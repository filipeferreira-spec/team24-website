/**
 * Prova que o desvio de emails funciona, sem contactar o Odoo.
 * Alimenta o interceptor com o XML de um email verdadeiro e verifica a saida.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Compilar o modulo TypeScript para JS temporario
const tmp = path.resolve('.tmp-teste-desvio');
fs.rmSync(tmp, { recursive: true, force: true });
execSync(
  `npx esbuild server/desvioEmail.ts --bundle --format=esm --platform=node --outfile=${tmp}/desvioEmail.mjs`,
  { stdio: 'pipe' }
);
const { aplicarDesvio, EnvioBloqueado } = await import(
  'file://' + path.join(tmp, 'desvioEmail.mjs')
);

const EMAIL_EXEMPLO = `<value><struct>
  <member><name>subject</name><value><string>A sua candidatura na TEAM 24 - Psicologo Clinico</string></value></member>
  <member><name>email_from</name><value><string>marketing@team24.pt</string></value></member>
  <member><name>email_to</name><value><string>candidato.real@gmail.com</string></value></member>
  <member><name>body_html</name><value><string>&lt;p&gt;Cara candidata,&lt;/p&gt;</string></value></member>
  <member><name>auto_delete</name><value><boolean>1</boolean></value></member>
</struct></value>`;

function membro(xml, nome) {
  const m = xml.match(
    new RegExp(`<member>\\s*<name>${nome}</name>\\s*<value>\\s*<string>([\\s\\S]*?)</string>`, 'i')
  );
  return m ? m[1] : null;
}

let falhou = false;
function verificar(descricao, condicao, detalhe = '') {
  console.log(`  ${condicao ? 'OK  ' : 'FALHA'} ${descricao}${detalhe ? '  ' + detalhe : ''}`);
  if (!condicao) falhou = true;
}

// ── Caso 1: sem configuracao nenhuma → tem de RECUSAR ───────────────────────
console.log('\n1) Sem EMAIL_DESVIO nem EMAIL_REAL_PERMITIDO (um site publicado por distraccao)');
delete process.env.EMAIL_DESVIO;
delete process.env.EMAIL_REAL_PERMITIDO;
try {
  aplicarDesvio(EMAIL_EXEMPLO);
  verificar('recusa enviar', false, '<- ENVIOU, isto seria grave');
} catch (e) {
  verificar('recusa enviar', e instanceof EnvioBloqueado);
  verificar('explica porque', /EMAIL_DESVIO/.test(e.message));
  verificar('diz quem nao recebeu', /candidato\.real@gmail\.com/.test(e.message));
}

// ── Caso 2: com desvio → vai para o endereco de teste ───────────────────────
console.log('\n2) Com EMAIL_DESVIO=filipe@exemplo.invalid (site de teste)');
process.env.EMAIL_DESVIO = 'filipe@exemplo.invalid';
const desviado = aplicarDesvio(EMAIL_EXEMPLO);
verificar('destinatario trocado', membro(desviado, 'email_to') === 'filipe@exemplo.invalid');
verificar(
  'candidato real ja NAO e destinatario',
  !new RegExp('<name>email_to</name>[\\s\\S]{0,80}candidato\\.real').test(desviado)
);
verificar('assunto marca o destino original', /\[DESVIO/.test(membro(desviado, 'subject') || ''));
verificar(
  'assunto original preservado',
  /A sua candidatura na TEAM 24/.test(membro(desviado, 'subject') || '')
);
verificar('aviso no topo da mensagem', /EMAIL DESVIADO/.test(membro(desviado, 'body_html') || ''));
verificar(
  'corpo original preservado',
  /Cara candidata/.test(membro(desviado, 'body_html') || '')
);

// ── Caso 3: envio real explicitamente autorizado ────────────────────────────
console.log('\n3) Com EMAIL_REAL_PERMITIDO=1 (producao)');
delete process.env.EMAIL_DESVIO;
process.env.EMAIL_REAL_PERMITIDO = '1';
const real = aplicarDesvio(EMAIL_EXEMPLO);
verificar('destinatario intacto', membro(real, 'email_to') === 'candidato.real@gmail.com');
verificar('assunto intacto', membro(real, 'subject') === 'A sua candidatura na TEAM 24 - Psicologo Clinico');
verificar('sem aviso de desvio', !/EMAIL DESVIADO/.test(membro(real, 'body_html') || ''));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(falhou ? '\n>>> HA FALHAS' : '\n>>> Todos os casos passaram');
process.exitCode = falhou ? 1 : 0;
