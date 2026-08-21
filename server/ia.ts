/**
 * Substituto do `invokeLLM` da plataforma Manus, agora sobre a API da Anthropic.
 *
 * Mantem de proposito a mesma forma de chamada e de resposta do original, para
 * que os tres sitios que o usam mudem apenas a linha do import. A forma
 * `choices[0].message.content` nao e a da Anthropic — e a que o codigo ja
 * esperava, e nao vale a pena reescrever tres ficheiros para a trocar.
 *
 * Precisa de ANTHROPIC_API_KEY. Sem ela, lanca um erro que diz isso mesmo em
 * vez de falhar de forma obscura.
 */
import Anthropic from "@anthropic-ai/sdk";

const MODELO = process.env.ANTHROPIC_MODEL || "claude-opus-5";

export type PapelIA = "system" | "user" | "assistant";

export type MensagemIA = {
  role: PapelIA;
  content: string;
};

export type EsforcoIA = "low" | "medium" | "high" | "xhigh" | "max";

export type ParametrosIA = {
  messages: MensagemIA[];
  /** Ignorado. Existe porque uma das chamadas antigas passava "gpt-4o". */
  model?: string;
  /** Quanto a IA deve "pensar". Menos = mais rapido e mais barato. */
  effort?: EsforcoIA;
  max_tokens?: number;
  /** Forma antiga de pedir JSON com esquema. Convertida para o equivalente da Anthropic. */
  response_format?: {
    type: string;
    json_schema?: {
      name?: string;
      strict?: boolean;
      schema: Record<string, unknown>;
    };
  };
};

export type ResultadoIA = {
  choices: Array<{ message: { content: string } }>;
  /** Verdadeiro quando o modelo recusou responder. Ver nota em baixo. */
  recusou: boolean;
};

let cliente: Anthropic | null = null;

function obterCliente(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY nao esta definida. As funcionalidades de IA (chatbot, " +
        "gerador de artigos, preenchimento de dados no CRM) precisam dela."
    );
  }
  if (!cliente) cliente = new Anthropic();
  return cliente;
}

export async function invokeLLM(params: ParametrosIA): Promise<ResultadoIA> {
  const client = obterCliente();

  // A Anthropic recebe as instrucoes de sistema num campo proprio, nao no meio
  // das mensagens. Separamos.
  const sistema = params.messages
    .filter(m => m.role === "system")
    .map(m => m.content)
    .join("\n\n");

  const conversa = params.messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  if (conversa.length === 0) {
    throw new Error("invokeLLM: e preciso pelo menos uma mensagem de utilizador.");
  }

  const pedido: Anthropic.MessageCreateParamsNonStreaming = {
    model: MODELO,
    max_tokens: params.max_tokens ?? 16000,
    messages: conversa,
    output_config: { effort: params.effort ?? "medium" },
  };

  if (sistema) pedido.system = sistema;

  const esquema = params.response_format?.json_schema?.schema;
  if (esquema) {
    pedido.output_config = {
      ...pedido.output_config,
      format: { type: "json_schema", schema: esquema },
    };
  }

  const resposta = await client.messages.create(pedido);

  // O modelo pode recusar responder (assunto sensivel, por exemplo). Nao e um
  // erro de rede: o pedido devolve 200 com stop_reason "refusal". Deixamos isso
  // visivel para quem chama decidir o que dizer ao visitante.
  if (resposta.stop_reason === "refusal") {
    return { choices: [{ message: { content: "" } }], recusou: true };
  }

  const texto = resposta.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  return { choices: [{ message: { content: texto } }], recusou: false };
}
