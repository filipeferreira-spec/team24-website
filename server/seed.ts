/**
 * Povoamento automatico no arranque, para o site de teste.
 *
 * Evita ter de partilhar credenciais da base de dados com quem publica.
 *
 * Tres salvaguardas, por esta ordem:
 *   1. ABORTA se encontrar dados pessoais - nunca corre por cima de producao
 *   2. Nao faz nada se ja houver conteudo
 *   3. So corre se SEED_ON_START=1 estiver definido
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

// Se qualquer uma destas tiver uma linha que seja, esta base tem dados de pessoas
// reais e nao e um site de teste. Parar.
const TABELAS_PESSOAIS = [
  "candidaturas", "crm_leads", "crm_prospecting", "crm_empresas",
  "outreach_contactos", "newsletter_subscribers",
];

async function correrFicheiro(con: mysql.Connection, ficheiro: string) {
  const sql = fs.readFileSync(ficheiro, "utf8");
  // O primeiro byte pode trazer BOM se o ficheiro for editado no Windows
  const limpo = sql.charCodeAt(0) === 0xfeff ? sql.slice(1) : sql;
  await con.query(limpo);
}

async function corrigirEnderecosAntigos(con: mysql.Connection) {
  // Se uma base ja povoada ainda tiver enderecos do CDN da Manus, passam a
  // apontar para /media/. Barato e sem efeito se ja estiver tudo certo.
  const alvos: Array<[string, string]> = [
    ["equipa", "fotoUrl"],
    ["casos", "imagemUrl"],
    ["casos", "logoUrl"],
    ["recursos", "imageUrl"],
    ["imprensa", "imagemUrl"],
  ];
  let corrigidos = 0;
  for (const [tabela, coluna] of alvos) {
    const sql =
      "UPDATE `" + tabela + "` SET `" + coluna + "` = " +
      "CONCAT('/media/', SUBSTRING_INDEX(`" + coluna + "`, '/', -1)) " +
      "WHERE `" + coluna + "` LIKE '%cloudfront.net%' " +
      "   OR `" + coluna + "` LIKE '%manuscdn.com%'";
    try {
      const [r]: any = await con.query(sql);
      corrigidos += r.affectedRows || 0;
    } catch {
      /* a coluna pode nao existir nesta versao do esquema */
    }
  }
  if (corrigidos > 0) {
    console.log("[Povoamento] " + corrigidos + " enderecos do CDN da Manus reescritos para /media/");
  }
}

export async function povoarSeVazio() {
  if (process.env.SEED_ON_START !== "1") return;
  if (!process.env.DATABASE_URL) {
    console.log("[Povoamento] sem DATABASE_URL; nada a fazer");
    return;
  }

  const pasta = path.resolve(process.cwd(), "seed");
  const estrutura = path.join(pasta, "01-estrutura.sql");
  const conteudo = path.join(pasta, "02-conteudo.sql");
  if (!fs.existsSync(estrutura)) {
    console.log("[Povoamento] pasta seed/ nao encontrada; nada a fazer");
    return;
  }

  const u = new URL(process.env.DATABASE_URL);
  u.search = "";
  const con = await mysql.createConnection({ uri: u.toString(), multipleStatements: true });

  try {
    const [tabelas] = await con.query<any[]>(
      "SELECT TABLE_NAME t FROM information_schema.tables WHERE table_schema = DATABASE()"
    );
    const existentes = new Set(tabelas.map(r => r.t));

    // --- Salvaguarda 1: dados pessoais -------------------------------------
    for (const t of TABELAS_PESSOAIS) {
      if (!existentes.has(t)) continue;
      const [[{ n }]] = await con.query<any[]>(`SELECT COUNT(*) n FROM \`${t}\``);
      if (n > 0) {
        console.error(
          `[Povoamento] ABORTADO: a tabela "${t}" tem ${n} registos. ` +
          `Esta base tem dados pessoais e nao e um site de teste. Nada foi alterado.`
        );
        return;
      }
    }

    // --- Estrutura ---------------------------------------------------------
    if (existentes.size === 0) {
      console.log("[Povoamento] base vazia; a criar as tabelas...");
      await correrFicheiro(con, estrutura);
      console.log("[Povoamento] tabelas criadas");
    }

    // --- Salvaguarda 2: ja ha conteudo? ------------------------------------
    const [[{ n: jaTem }]] = await con.query<any[]>("SELECT COUNT(*) n FROM `recursos`");
    if (jaTem > 0) {
      console.log(`[Povoamento] ja existem ${jaTem} recursos; nada a fazer`);
    } else if (fs.existsSync(conteudo)) {
      await correrFicheiro(con, conteudo);
      const [[{ n: agora }]] = await con.query<any[]>("SELECT COUNT(*) n FROM `recursos`");
      console.log(`[Povoamento] conteudo carregado (${agora} recursos)`);
    }

    // --- Enderecos antigos do CDN da Manus ---------------------------------
    // Corre sempre (e barato e nao repete efeito): se uma base ja povoada
    // ainda tiver enderecos do CDN, passam a apontar para /media/.
    await corrigirEnderecosAntigos(con);

    // --- Conta de acesso ao backoffice -------------------------------------
    // Sem esta, o backoffice fica inacessivel: as contas de administrador
    // vivem numa tabela de dados pessoais que nao foi copiada.
    const [[{ n: admins }]] = await con.query<any[]>("SELECT COUNT(*) n FROM `backoffice_admins`");
    const reporPedido = process.env.REPOR_ADMIN_TESTE === "1";
    if (admins > 0 && reporPedido) {
      // A palavra-passe da conta de teste so aparece no registo uma vez, no
      // arranque em que e criada. Se se perder, define REPOR_ADMIN_TESTE=1,
      // republica, le a nova no registo, e volta a tirar a variavel.
      const crypto = await import("node:crypto");
      const senha = crypto.randomBytes(18).toString("base64url");
      const segredo = process.env.JWT_SECRET || "";
      if (!segredo) {
        console.error("[Povoamento] JWT_SECRET nao definida; nao reponho a conta de teste.");
      } else {
        const hash = crypto.createHmac("sha256", segredo).update(senha).digest("hex");
        const [r]: any = await con.query(
          "UPDATE `backoffice_admins` SET passwordHash = ?, ativo = 1 WHERE username = ?",
          [hash, "teste"]
        );
        if (r.affectedRows === 0) {
          await con.query(
            "INSERT INTO `backoffice_admins` (username, passwordHash, nome, email, ativo, role) VALUES (?,?,?,?,1,?)",
            ["teste", hash, "Conta de teste", "teste@exemplo.invalid", "superadmin"]
          );
        }
        console.log("=".repeat(64));
        console.log("[Povoamento] palavra-passe da conta de teste REPOSTA");
        console.log("   utilizador: teste");
        console.log(`   palavra-passe: ${senha}`);
        console.log("   >>> tira a variavel REPOR_ADMIN_TESTE depois de entrares <<<");
        console.log("=".repeat(64));
      }
    }
    if (admins === 0) {
      const crypto = await import("node:crypto");
      const senha = crypto.randomBytes(18).toString("base64url");
      const segredo = process.env.JWT_SECRET || "";
      if (!segredo) {
        console.error("[Povoamento] JWT_SECRET nao definido; conta de teste NAO criada");
      } else {
        const hash = crypto.createHmac("sha256", segredo).update(senha).digest("hex");
        await con.query(
          "INSERT INTO `backoffice_admins` (username, passwordHash, nome, email, ativo, role) VALUES (?,?,?,?,1,'superadmin')",
          ["teste", hash, "Conta de teste", "teste@exemplo.invalid"]
        );
        console.log("=".repeat(64));
        console.log("[Povoamento] conta de teste do backoffice criada");
        console.log(`   utilizador: teste`);
        console.log(`   palavra-passe: ${senha}`);
        console.log("   (gerada ao acaso; aparece so nesta linha do registo)");
        console.log("=".repeat(64));
      }
    }

    // --- Conta de acesso ao CRM -------------------------------------------
    // Mesma logica do backoffice: os utilizadores do CRM vivem numa tabela de
    // dados pessoais que nao e copiada, portanto num site de teste nao ha por
    // onde entrar.
    const [[{ n: crmContas }]] = await con.query<any[]>("SELECT COUNT(*) n FROM `crm_users`");
    if (crmContas === 0 || reporPedido) {
      const crypto = await import("node:crypto");
      const senha = crypto.randomBytes(18).toString("base64url");
      const segredo = process.env.JWT_SECRET || "";
      if (!segredo) {
        console.error("[Povoamento] JWT_SECRET nao definida; conta de CRM NAO criada");
      } else {
        const hash = crypto.createHmac("sha256", segredo).update(senha).digest("hex");
        const [r]: any = await con.query(
          "UPDATE `crm_users` SET passwordHash = ?, ativo = 1 WHERE email = ?",
          [hash, "teste@exemplo.invalid"]
        );
        if (r.affectedRows === 0) {
          await con.query(
            "INSERT INTO `crm_users` (nome, email, passwordHash, role, ativo) VALUES (?,?,?,?,1)",
            ["Conta de teste", "teste@exemplo.invalid", hash, "admin"]
          );
        }
        console.log("=".repeat(64));
        console.log("[Povoamento] conta de teste do CRM");
        console.log("   email: teste@exemplo.invalid");
        console.log("   palavra-passe: " + senha);
        console.log("=".repeat(64));
      }
    }
  } catch (e) {
    console.error("[Povoamento] falhou:", e);
  } finally {
    await con.end();
  }
}
