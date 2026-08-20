import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Questionario() {
  const { token } = useParams<{ token: string }>();
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.questionario.getByToken.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: false }
  );

  const submitMutation = trpc.questionario.submit.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err) => setSubmitError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const respostasArray = data.perguntas.map((p) => ({
      perguntaId: p.id,
      resposta: respostas[p.id] ?? "",
    }));
    submitMutation.mutate({ token: token ?? "", respostas: respostasArray });
  };

  const handleChange = (perguntaId: number, value: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F0]">
      <Navbar />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Estado: a carregar */}
          {isLoading && (
            <div className="text-center py-24">
              <div className="inline-block w-8 h-8 border-2 border-[#DB5C34] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#0A1A2A]/60">A carregar questionário...</p>
            </div>
          )}

          {/* Estado: erro (link inválido, expirado, já respondido) */}
          {error && !isLoading && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#0A1A2A] mb-3">Link inválido</h1>
              <p className="text-[#0A1A2A]/60 max-w-sm mx-auto">
                {error.message || "Este link é inválido, expirou ou já foi utilizado."}
              </p>
              <a href="/carreiras" className="inline-block mt-8 text-[#DB5C34] font-medium hover:underline">
                ← Ver vagas abertas
              </a>
            </div>
          )}

          {/* Estado: já submetido */}
          {submitted && (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#0A1A2A] mb-3">Obrigado pelas suas respostas!</h1>
              <p className="text-[#0A1A2A]/60 max-w-sm mx-auto">
                A nossa equipa irá analisar as suas respostas e entrar em contacto brevemente.
              </p>
              <a href="/carreiras" className="inline-block mt-8 text-[#DB5C34] font-medium hover:underline">
                ← Ver vagas abertas
              </a>
            </div>
          )}

          {/* Formulário do questionário */}
          {data && !submitted && (
            <form onSubmit={handleSubmit}>
              {/* Cabeçalho */}
              <div className="mb-10">
                <span className="text-xs font-semibold tracking-widest text-[#DB5C34] uppercase">
                  Questionário de Seleção
                </span>
                <h1 className="text-3xl font-bold text-[#0A1A2A] mt-2 mb-3">
                  {data.questionario.titulo}
                </h1>
                {data.questionario.descricao && (
                  <p className="text-[#0A1A2A]/70 leading-relaxed">
                    {data.questionario.descricao}
                  </p>
                )}
                <div className="mt-4 h-px bg-[#0A1A2A]/10" />
              </div>

              {/* Perguntas */}
              <div className="space-y-8">
                {data.perguntas.map((pergunta, index) => (
                  <div key={pergunta.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#0A1A2A]/5">
                    <label className="block mb-4">
                      <span className="text-xs font-semibold text-[#DB5C34] uppercase tracking-wider">
                        Pergunta {index + 1}
                        {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <p className="text-[#0A1A2A] font-medium mt-1 leading-relaxed">
                        {pergunta.texto}
                      </p>
                    </label>

                    {/* Texto livre */}
                    {pergunta.tipo === "texto" && (
                      <textarea
                        className="w-full border border-[#0A1A2A]/20 rounded-lg p-3 text-sm text-[#0A1A2A] focus:outline-none focus:border-[#DB5C34] resize-none min-h-[100px]"
                        placeholder="A sua resposta..."
                        value={respostas[pergunta.id] ?? ""}
                        onChange={(e) => handleChange(pergunta.id, e.target.value)}
                        required={pergunta.obrigatoria}
                      />
                    )}

                    {/* Sim / Não */}
                    {pergunta.tipo === "sim_nao" && (
                      <div className="flex gap-4">
                        {["Sim", "Não"].map((op) => (
                          <label key={op} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`pergunta-${pergunta.id}`}
                              value={op}
                              checked={respostas[pergunta.id] === op}
                              onChange={() => handleChange(pergunta.id, op)}
                              required={pergunta.obrigatoria}
                              className="accent-[#DB5C34]"
                            />
                            <span className="text-sm text-[#0A1A2A]">{op}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Escala 1–5 */}
                    {pergunta.tipo === "escala" && (
                      <div className="flex gap-3 flex-wrap">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`pergunta-${pergunta.id}`}
                              value={String(n)}
                              checked={respostas[pergunta.id] === String(n)}
                              onChange={() => handleChange(pergunta.id, String(n))}
                              required={pergunta.obrigatoria}
                              className="accent-[#DB5C34]"
                            />
                            <span className="text-sm font-medium text-[#0A1A2A]">{n}</span>
                          </label>
                        ))}
                        <div className="w-full flex justify-between text-xs text-[#0A1A2A]/50 mt-1">
                          <span>Discordo totalmente</span>
                          <span>Concordo totalmente</span>
                        </div>
                      </div>
                    )}

                    {/* Escolha múltipla */}
                    {pergunta.tipo === "escolha_multipla" && (() => {
                      let opcoes: string[] = [];
                      try { opcoes = JSON.parse(pergunta.opcoes ?? "[]"); } catch { opcoes = []; }
                      return (
                        <div className="space-y-2">
                          {opcoes.map((op) => (
                            <label key={op} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`pergunta-${pergunta.id}`}
                                value={op}
                                checked={respostas[pergunta.id] === op}
                                onChange={() => handleChange(pergunta.id, op)}
                                required={pergunta.obrigatoria}
                                className="accent-[#DB5C34]"
                              />
                              <span className="text-sm text-[#0A1A2A]">{op}</span>
                            </label>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {/* Erro de submissão */}
              {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {/* Botão submeter */}
              <div className="mt-10 flex justify-end">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="bg-[#DB5C34] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#c24e28] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitMutation.isPending ? "A enviar..." : "Enviar Respostas"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
