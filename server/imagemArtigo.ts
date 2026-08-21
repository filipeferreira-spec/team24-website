/**
 * Capa dos artigos gerados automaticamente.
 *
 * A plataforma Manus gerava a imagem por IA. A Anthropic nao gera imagens, e
 * nao ha substituto directo — por isso esta funcionalidade fica DESLIGADA.
 *
 * Nao e uma falha silenciosa: o gerador de artigos ja tratava o caso de nao
 * haver imagem (o artigo e guardado na mesma, sem capa), e aqui escreve-se no
 * registo a dizer porque. Um artigo sem capa aparece no blog com o espaco da
 * imagem vazio — quem publicar pode acrescentar uma a mao no backoffice.
 *
 * Se um dia se quiser voltar a gerar capas, e aqui que se liga um servico de
 * geracao de imagens. A assinatura fica de proposito igual a antiga.
 */

export type PedidoImagem = { prompt: string };
export type ResultadoImagem = { url: string | null };

let jaAvisou = false;

export async function generateImage(_pedido: PedidoImagem): Promise<ResultadoImagem> {
  if (!jaAvisou) {
    console.warn(
      "[Imagem] A geracao automatica de capas esta desligada desde a saida da " +
        "plataforma Manus. Os artigos sao guardados sem imagem; podes acrescentar " +
        "uma a mao no backoffice."
    );
    jaAvisou = true;
  }
  return { url: null };
}
