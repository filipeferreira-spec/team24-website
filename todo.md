# TEAM 24 Website — TODO

## Concluído

- [x] Site principal com design editorial (homepage, blog, casos, contacto, etc.)
- [x] Banner fullscreen com 3 slides cinematográficos
- [x] 3.º slide do banner com mockup de telemóvel real (print da app TEAM 24)
- [x] Substituição da foto da Ana Ruivo no hero
- [x] Print da app integrado no FeaturesSection e página Platform
- [x] Página de Recursos com filtros, pesquisa, modal de lead e newsletter
- [x] Link "Recursos" no menu superior (navbar desktop e mobile)
- [x] Upgrade para full-stack (web-db-user): backend Express, tRPC, base de dados MySQL
- [x] Botão de login no navbar (ícone de utilizador, dropdown com logout e link backoffice)
- [x] Página de Recursos com Navbar e Footer (corrigido)
- [x] Backoffice em /backoffice com 4 áreas: Recursos, Casos de Sucesso, Imprensa, Carreiras
- [x] Landing page de conversão em /demo (hero + formulário + benefícios + social proof + CTA)
- [x] Link "Agendar Demo" no footer apontando para /demo
- [x] Chat com assistente de IA (widget flutuante em todas as páginas, powered by LLM)

## Migração Imagens (2026-06-30)

- [x] 111 imagens do ZIP enviadas para o bucket correcto do novo projecto
- [x] 78 imagens adicionais do projecto antigo re-enviadas para o bucket correcto
- [x] 14 logos substitutos encontrados online e enviados para o bucket correcto
- [x] Todos os caminhos /manus-storage/ actualizados no código-fonte (30 ficheiros)
- [x] Hero com nova imagem de cultura empresarial como slide 1
- [x] Botões "Agendar Reunião" em todo o site (substituiu "Agendar Demo")
- [x] storageProxy corrigido para usar downloadUrl permanente
- [x] dotenv com override:false para prioridade das variáveis de produção

## Restauração de Dados (2026-06-30)

- [x] Restaurar dados do backup: 30 recursos, 5 casos, 1 imprensa, 1 carreira
- [x] Corrigir coluna slug em falta na tabela carreiras (ALTER TABLE)
- [x] Remover 6 recursos duplicados do backup (IDs 30002-30007)
- [x] Credenciais do backoffice actualizadas (JWT_SECRET novo)

## Pendente

- [ ] Ligar os E-books da página Recursos a PDFs reais (upload para CDN)
- [ ] Implementar CRUD real no backoffice (base de dados + formulários de criação/edição)
- [ ] Envio real do formulário da landing page (email/CRM)
- [ ] Foto da Ana Ruivo na página /quem-somos (secção da equipa)
- [ ] Adicionar mais prints da app no banner (carrossel de ecrãs)
- [ ] Testes vitest para os novos endpoints (chat, etc.)
- [x] Scroll para o topo ao navegar para /recursos via navbar (ScrollToTop global em todas as páginas)
- [x] Landing page /demo redesenhada com layout editorial do site (Navbar+Footer reais, sem emoji)
- [x] Dar mais destaque aos logotipos/nomes de clientes em todo o site (homepage marquee, landing page grid 6 col, parceiros grid com hover)
- [x] CRUD completo no backoffice com base de dados real (Recursos, Casos, Imprensa, Carreiras)
- [x] Login com username/password para proteger o backoffice (/backoffice/login)
- [x] Ligar página /recursos à base de dados do backoffice (recursos dinâmicos aparecem primeiro)
- [x] Melhorar UX de publicação no backoffice (botão toggle direto na tabela: Rascunho → Publicar)
- [ ] Ligar página /casos à base de dados do backoffice (casos dinâmicos)
- [x] Migrar 30 recursos estáticos para a base de dados (seed executado com sucesso)
- [x] Upload de imagem e ficheiro PDF no backoffice via S3 (drag-and-drop no formulário)
- [x] Ligar página /casos à base de dados do backoffice (casos dinâmicos)
- [x] Toggle de publicação direto na tabela de Casos do backoffice
- [ ] Corrigir backoffice para mostrar todos os 31 recursos (bug na query de listagem)
- [ ] Upload de imagem e PDF/ebook no formulário do backoffice
- [x] Migrar 4 casos de sucesso estáticos (RTP, Adecco, Eurotux, Grupo BEL) para a base de dados
- [x] Upload de imagem (logo + capa) no formulário de Casos de Sucesso do backoffice
- [x] Ligar página /imprensa à base de dados do backoffice
- [x] Ligar página /carreiras à base de dados do backoffice
- [x] Toggle de publicação direto nas tabelas de Imprensa e Carreiras do backoffice
- [x] Tabela 'candidaturas' criada na base de dados com campos: id, carreiraId, nome, email, telefone, linkedin, mensagem, cvUrl, cvNome, estado, createdAt
- [x] Endpoint tRPC 'candidaturas.submit' para submissão pública de candidaturas com upload de CV
- [x] Formulário de candidatura na página /carreiras com upload drag-and-drop de CV (PDF/Word, máx. 10MB)
- [x] Secção "Candidaturas" no backoffice com tabela completa (Nome, Email, Telefone, LinkedIn, CV download, Mensagem, Estado, Data, Eliminar)
- [x] Gestão de estado das candidaturas no backoffice (Pendente, Em Análise, Entrevista, Rejeitado, Aceite)
- [x] Testes vitest para o sistema de candidaturas (19 testes passam)
- [x] Remover Blog do menu de topo (Navbar + App.tsx)
- [x] Criar página /formacoes com listagem de cursos de liderança (RH, Comercial, Operações)
- [x] Registar rota /formacoes no App.tsx
- [x] Remover ícone de login do Navbar
- [x] Remover número de telefone do Navbar
- [x] Upload de 14 logos reais para CDN (Adecco, Águas de Portugal, Banco BNI, Casais, Doutor Finanças, Galp, IKEA, Mercedes, MDS, Nova, RTP, Salvador Caetano, STCP, Norauto)
- [x] Atualizar companyLogos.ts com URLs CDN reais dos 14 logos fornecidos
- [x] Substituir logos no marquee do HeroSection pelos 14 logos reais
- [x] Substituir logos na secção de testemunhos pelos logos reais
- [x] Substituir logos na página de Parceiros pelos logos reais
- [x] Substituir logos na LandingPage pelos logos reais
- [x] Atualizar logos nos casos de sucesso (RTP e Adecco) com URLs CDN reais
- [x] Substituir Playfair Display por Fraunces (serif display moderna) e DM Sans por Plus Jakarta Sans em todo o site
- [x] Substituir Fraunces (serif) por Syne (sans-serif moderna) nos títulos em todo o site
- [x] Transformação visual high-tech: Space Grotesk, paleta dark/tech, gradientes e glassmorphism
- [x] Navbar sobreposto ao vídeo hero com fundo transparente/glassmorphism
- [x] Upload dos 14 logos novos para CDN e uniformizar tamanho no marquee
- [x] Reverter fundo dark/tech para o design claro original (manter navbar transparente e logos)
- [x] Página Formações: diminuir tamanho do texto e adicionar botão para página de detalhe
- [x] Criar página de detalhe para cada formação com rota própria
- [x] Corrigir hover laranja no Navbar (mouseOver → cor laranja #DB5C34)
- [x] Logos dos clientes: fundo branco e tamanho maior no marquee
- [x] Criar página da Equipa (/equipa) com membros, bio e design editorial
- [x] Adicionar link "A Nossa Equipa" no footer (coluna Empresa)
- [ ] Adicionar foto a cada formação na página de Formações
- [ ] Criar tabela `ofertas` na BD (título, departamento, localização, tipo, descrição, requisitos, publicado)
- [ ] Criar procedures tRPC para CRUD de ofertas no backoffice e listagem pública
- [ ] Criar página pública /carreiras com listagem de ofertas e modal de candidatura por email
- [ ] Adicionar secção CarreirasSection no backoffice (criar, editar, publicar, eliminar ofertas)
- [ ] Adicionar link Carreiras no footer e no menu de navegação
- [x] Remover secção Candidaturas do backoffice
- [x] Criar secção Recursos no backoffice (criar, editar, apagar)
- [x] Migrar recursos estáticos da página para a BD (31 recursos na BD)

## Menu Serviços (2026-03-17)

- [x] Analisar 6 páginas de referência (psicologia, app, jurídico, social, financeiro, nutrição)
- [x] Criar página /servicos/psicologia
- [x] Criar página /app (App Mobile)
- [x] Criar página /servicos/juridico
- [x] Criar página /servicos/social
- [x] Criar página /servicos/financeiro
- [x] Criar página /servicos/nutricao
- [x] Adicionar menu dropdown 'Serviços' na Navbar (desktop + mobile)
- [x] Registar as 6 rotas no App.tsx

## Restauração do Backup (2026-03-17)

- [x] Projeto restaurado a partir do backup (projeto_completo.tar.gz)
- [x] Ficheiros do backup copiados para o projeto webdev
- [x] Dependências instaladas com pnpm
- [x] Migrações de base de dados aplicadas (users, backoffice_admins, carreiras, casos, imprensa, recursos, candidaturas)
- [x] Dados do backup restaurados na BD (31 recursos, 1 caso, 1 imprensa, 1 carreira, 1 admin)
- [x] Servidor de desenvolvimento a funcionar corretamente
- [x] Todos os 19 testes vitest a passar

## Alterações Serviços (2026-03-17)

- [x] Renomear "Casa das Finanças" para "As Suas Finanças" (página, navbar, listagem)
- [x] Adicionar imagem de fundo no hero da página /servicos/psicologia
- [x] Adicionar imagem de fundo no hero da página /app
- [x] Adicionar imagem de fundo no hero da página /servicos/juridico
- [x] Adicionar imagem de fundo no hero da página /servicos/social
- [x] Adicionar imagem de fundo no hero da página /servicos/financeiro
- [x] Adicionar imagem de fundo no hero da página /servicos/nutricao

## Atualização Heroes Serviços (2026-03-17)

- [ ] Atualizar imagem hero /servicos/psicologia com foto europeia
- [ ] Atualizar imagem hero /app (bem-estar) com foto europeia
- [ ] Atualizar imagem hero /servicos/juridico com foto europeia
- [ ] Atualizar imagem hero /servicos/social com foto europeia
- [ ] Atualizar imagem hero /servicos/financeiro com foto europeia
- [ ] Atualizar imagem hero /servicos/nutricao com foto europeia

## Atualização Apoio Jurídico (2026-03-23)

- [x] Atualizar conteúdo da página /servicos/juridico com texto real do utilizador

## Fotos e Grids Pares (2026-03-23)

- [x] Adicionar fotos a acompanhar os textos da página /servicos/juridico
- [x] Corrigir grids ímpares em todo o site (regra: sempre 2+2 ou 3+3, nunca 3+1)
- [x] Auditar e corrigir: ServicoJuridico, ServicoSocial, ServicoFinanceiro, ServicoNutricao, ServicoPsicologia, Servicos, Platform, Partners

## Atualização As Suas Finanças (2026-03-23)

- [ ] Atualizar conteúdo da página /servicos/financeiro com texto real do utilizador
- [ ] Adicionar fotografias a acompanhar os textos (grids pares)

## Integração Odoo CRM Direta (2026-03-28)

- [x] Integração direta com Odoo CRM via XML-RPC (substituição do Make.com webhook)
- [x] Cliente Odoo XML-RPC criado (server/odoo.ts) com suporte a API Keys
- [x] Procedimentos tRPC criados: forms.contact, forms.partner, forms.ebook, forms.newsletter
- [x] ContactSection.tsx atualizado para usar trpc.forms.contact
- [x] Partners.tsx atualizado para usar trpc.forms.partner
- [x] NewsletterWidget.tsx atualizado para usar trpc.forms.newsletter
- [x] Contact.tsx atualizado para usar trpc.forms.contact
- [x] Recursos.tsx atualizado para usar trpc.forms.ebook e trpc.forms.newsletter
- [x] Testes vitest para integração Odoo (3 testes: versão, criar lead, subscrever newsletter)
- [x] Nova API Key Odoo configurada (d380e5f3...)
- [ ] Corrigir campo telefone nas leads Odoo (não estava a ser passado corretamente)
- [x] Corrigir campo telefone nas leads Odoo (phone guardado corretamente)
- [x] Adicionar source_id às leads Odoo (UTM Source "Website TEAM 24", ID 27)
- [x] Adicionar tag_ids às leads Odoo por formulário (Formulário Contacto ID 12, Formulário Parceiros ID 13, Download Ebook ID 14, Newsletter ID 15)
- [x] Integrar newsletter no módulo Email Marketing do Odoo (mailing.contact adicionado à lista "Newsletter" ID 1)
- [x] Envio automático de email com ebook em anexo via Odoo (template ID 64, PDF em ir.attachment ID 4933)
- [x] Corrigir email de ebook enviado em duplicado (botão disabled durante loading)
- [x] Corrigir texto do template de email (variáveis Jinja agora resolvidas corretamente pelo Odoo)
- [x] Corrigir variáveis Jinja no template de email Odoo (nome resolvido em Node.js, email construído diretamente via mail.mail)
- [x] Reduzir velocidade do carrossel de logótipos na homepage (de 60s para 90s)
- [x] Remover logótipo McDonald's do carrossel e da página de parceiros
- [x] Email de agradecimento automático após subscrição de newsletter (via Odoo, enviado por marketing@team24.pt)
- [x] Corrigir erro de inserção na tabela newsletter_subscribers (tratamento de duplicado melhorado para cobrir errno 1062 e mensagem)
- [x] Remover bloco "Equipa de Liderança" da página Quem Somos
- [x] Corrigir espaço em falta entre "papel" e "a 200.000 vidas" na página Quem Somos
- [x] Remover botão "Iniciar Chat" da secção Chat ao Vivo na página de suporte
- [x] Traduzir cargo de Ana Ruivo para inglês: "CEO & Co-Fundadora" → "CEO & Co-Founder" (HeroSection, About, blogData)
- [x] Mover imagem dos casos de sucesso para sidebar (pequena, 180px altura, acima de "Sobre a Empresa"), removida do artigo principal
- [x] Remover secção "Vozes que nos Inspiram" da página de parceiros
- [x] Remover completamente o bloco de testemunhos (título + cards) da página de parceiros
- [x] Reordenar elementos em mobile na página de caso de sucesso: imagem → sobre a empresa → texto (CSS order)
- [x] Adicionar campo "references" no tipo BlogPost (blogData.ts)
- [x] Gerar referências bibliográficas via LLM para todos os 22 artigos existentes
- [x] Mostrar referências bibliográficas no final de cada artigo do blog (BlogPost.tsx)
- [ ] Gerar referências automaticamente ao criar novos artigos no backoffice

## SEO/GEO/AEO 2026
- [x] Schema JSON-LD Organization na homepage
- [x] Schema JSON-LD Article/NewsArticle em cada artigo do blog
- [x] Schema JSON-LD FAQPage nas páginas de serviços (Psicologia, Jurídico, Financeiro, Nutrição, Social, Work-Life Balance, App)
- [x] Schema JSON-LD FAQPage nas páginas principais (Serviços, Suporte, Quem Somos, Contacto, Homepage)
- [x] Meta tags dinâmicas (title, description) únicas por página (todas as 36 páginas)
- [x] Open Graph tags (og:title, og:description, og:image) por página
- [x] Twitter Card meta tags
- [x] llms.txt na raiz do site (GEO 2026)
- [x] robots.txt atualizado para permitir GPTBot, ClaudeBot, PerplexityBot
- [x] Sitemap XML com 36 URLs (blog posts, casos, serviços, páginas principais)
- [x] Alt text descritivo em todas as imagens do site (verificado e melhorado)
- [ ] Data "Última atualização" visível nos artigos do blog
- [x] Breadcrumbs com Schema BreadcrumbList nas páginas de blog e casos
- [x] Canonical tags em todas as páginas

## Pop-up Campanha Colaborador Invisível (2026-04-01)
- [x] Criar componente CampaignPopup.tsx com design editorial dark/laranja
- [x] Pop-up aparece após 4s na homepage (e só uma vez por sessão)
- [x] Integrar CampaignPopup na App.tsx (global, todas as páginas)
- [x] Link para https://teamhealth-l3kswbrb.manus.space/

## Correção Datas Artigos Blog (2026-04-01)
- [x] Atualizar publishedAt de todos os 24 artigos com as datas reais de criação (via git log)

## Academia TEAM 24 (2026-04-02)
- [x] Criar página Academia.tsx com hero, audiências, conteúdos e recursos
- [x] Adicionar rota /academia no App.tsx
- [x] Adicionar link Academia no menu de navegação (desktop e mobile)

## Correções de Segurança — Risco Alto (2026-04-07)
- [x] Corrigir rota upload.file: mover para boProtectedProcedure, validar content-type, sanitizar folder
- [x] Adicionar headers HTTP de segurança com helmet (CSP, X-Frame-Options, HSTS, etc.)
- [x] Corrigir cookie do backoffice: garantir atributo Secure via isSecureBoRequest

## Cookiebot (2026-04-07)
- [x] Adicionar script Cookiebot no index.html (primeiro script do <head>, modo bloqueio automático)
- [x] Verificado: não existia banner de cookies personalizado anterior no site

## Conformidade ERS / Legal (2026-04-07)
- [x] Adicionar número de registo ERS (e161272) no footer e página Quem Somos
- [x] Adicionar link Livro de Reclamações Eletónico (livroreclamacoes.pt) no footer
- [x] Atualizar NIF (516 883 194) na Política de Privacidade
- [x] Adicionar secção de Regulamentação (ERS, RGPD, Ordem dos Psicólogos) na página Quem Somos

## Ajustes de Navegação (2026-04-07)
- [x] Remover link Academia do menu de navegação (desktop e mobile)

## Legibilidade Rodapé (2026-04-07)
- [x] Aumentar contraste do texto no footer (copyright, ERS, links) — opacidades de 0.13-0.5 para 0.55-0.85

## Morada Sede Social (2026-04-07)
- [x] Atualizar morada na Política de Privacidade para Av. Marechal Gomes da Costa, 1551, Porto 4150-360

## Ajustes Suporte e Privacidade (2026-04-07)
- [x] Atualizar morada na Política de Privacidade para Av. Marechal Gomes da Costa, 1551, Porto 4150-360
- [x] Remover botões "Enviar Email" e "Ligar Agora" da página /suporte

## Foto Ana Ruivo (2026-04-07)
- [x] Substituir foto da Ana Ruivo pela versão de maior qualidade (ANA-RUIVO.png)
- [x] Remover linha decorativa (accent bar) ao lado da imagem da Ana na homepage

## Termos e Política de Privacidade — PDF (2026-04-08)
- [x] Atualizar Privacy.tsx com conteúdo do PDF PolíticadePrivacidade-APPTEAM24.pdf
- [x] Atualizar Terms.tsx com conteúdo do PDF Termosecondições-APPTEAM24.pdf (11 secções)

## Certificado ERS no Rodapé (2026-04-09)
- [x] Upload do CertificadoERS2026.pdf para CDN
- [x] Adicionar hiperlink "Download Certificado" junto à menção ERS no rodapé (cor laranja, abre em nova aba)

## Logos Clientes no Carrossel (2026-04-09)
- [ ] Pesquisar e descarregar logos oficiais dos 21 clientes
- [ ] Fazer upload dos logos para CDN
- [ ] Atualizar carrossel da homepage com os novos logos

## Abril 2026

- [x] Remover chatbot (ChatWidget) do site — componente mantido no projeto mas desativado
- [x] Logo branco no Navbar quando fundo blur/transparente (sobre imagem); logo normal (azul/laranja) quando fundo branco
- [x] Nova secção "Artigos de Opinião" criada: listagem /opiniao + detalhe /opiniao/:slug + link no footer
- [x] Primeiro artigo de opinião: "Segurança Psicológica no Trabalho" (Mariana Fernandes) extraído de team24.pt
- [x] Footer: remover sublinks dos Artigos de Opinião, manter só link para /opiniao
- [x] Artigos de Opinião: usar formatação de texto igual ao blog (renderizador Markdown)
- [x] Adicionar artigo "Rust Out: A Liderança Pode Enferrujar!" (Rita Ferreira) aos Artigos de Opinião
- [x] Igualar número de colunas da página /opiniao ao layout do Blog (3 colunas desktop, cards com border igual ao Blog)
- [x] Adicionar artigo "Liberdade, Comunicação e Sucesso Organizacional" aos Artigos de Opinião
- [x] Adicionar secção de artigos relacionados (máx. 4 thumbnails) no final de cada OpiniaoPost
- [x] Hero section: transição fade in/out suave entre banners (TRANSITION=2200ms ease-in-out, DURATION=7000ms)
- [x] Hero section: terceiro slide RH adicionado ("Saiba o que a sua equipa sente. / Diagnóstico em tempo real.")
- [x] Slide RH: sub-heading corrigido para "Dados reais. Decisões certas."
- [x] Hero carousel: Ken Burns contínuo sem saltos (todos os slides sempre montados, apenas opacidade alterna)
- [x] Secção "Tudo o que a sua equipa precisa": mockup substituido por mockup9.png com position sticky no desktop
- [x] FeaturesSection: imagem mockup9 aumentada para 380px, caixas laterais reduzidas (padding, font, gap)
- [x] Página Plataforma: mockup "no bolso de cada colaborador" substituído por mockup01-global.webp (dois telemóveis)
- [x] Homepage: carrossel de logos movido para imediatamente após o FullscreenVideo (primeiro scroll)
- [x] Adicionar artigo "Porquê que a Saúde Mental dos Líderes deve ser uma prioridade?" (Jessica Alves) aos Artigos de Opinião
- [x] Adicionar artigo "Saúde Mental como Impulsionadora de Employer Branding" (Nídia Franco) aos Artigos de Opinião
- [x] Adicionar artigo "Qualidade nas Organizações: conheça um dos fatores de maior impacto" (Joel Teixeira) aos Artigos de Opinião
- [x] Todos os formulários: checkbox obrigatória de aceitação dos Termos e Política de Privacidade (Contact, LandingPage, Careers, Partners, Press, Support)
- [ ] Adicionar fotografias dos autores aos artigos de opinião (Mariana, Rita, Maria, Jessica, Nídia, Joel)
- [x] Página Imprensa: botão Download do ZIP do logótipo TEAM 24 activo na secção Media Kit
- [x] Página Quem Somos: texto de citação da Ana Ruivo actualizado
- [x] Página Quem Somos: estatísticas actualizadas (2022, +50 pessoas, 16 países)
- [x] Página Quem Somos: fundo da secção Entidades Reguladas alterado para branco
- [x] Página Quem Somos: fundo das caixas ERS/RGPD/Ordem dos Psicólogos alterado para #EBF4FA (azul leve)
- [ ] Todos os formulários: adicionar checkbox obrigatória de aceitação dos Termos e Política de Privacidade

## Páginas de Vaga com URL Próprio (2026-05-24)

- [x] Campo `slug` adicionado à tabela `carreiras` no schema.ts e na BD
- [x] Procedimento `getBySlug` adicionado ao router backoffice (publicProcedure)
- [x] Geração automática de slug ao criar vaga adicionada ao backoffice router
- [x] Página `CareerDetail.tsx` criada (/carreiras/:slug) com detalhe completo e formulário de candidatura
- [x] Rota `/carreiras/:slug` registada no App.tsx
- [x] Campo `slug` adicionado ao mapeamento `allJobs` no Careers.tsx
- [x] Botões "Ver vaga" (link para /carreiras/:slug) + "Candidatar-me" (scroll) adicionados ao painel expandido de cada vaga
- [x] Import Link de wouter adicionado ao Careers.tsx
- [x] CTA de Carreiras adicionado à homepage antes do footer (fundo escuro #0A1A2A, título + subtítulo + botão laranja "Ver vagas abertas" → /carreiras)

## Sistema de Questionários Pós-Candidatura

- [ ] Schema BD: tabelas questionarios, perguntas_questionario, tokens_questionario, respostas_questionario
- [ ] tRPC: CRUD de questionários e perguntas no backoffice
- [ ] tRPC: associar questionário a vaga no backoffice
- [ ] Email automático com link único após submissão de candidatura
- [ ] Página pública /questionario/:token para candidatos responderem
- [ ] Backoffice: secção de gestão de questionários (criar/editar/associar a vaga)
- [ ] Backoffice: secção de respostas por candidato/vaga

## Restauração Backup 2026-05-26

- [x] Descomprimir backup team24-website_backup_20260525_184734.tar.gz
- [x] Iniciar novo projeto webdev team24-website
- [x] Copiar todos os ficheiros do backup (client/, server/, shared/, drizzle/)
- [x] Restaurar base de dados completa (13 tabelas: users, carreiras, casos, recursos, candidaturas, imprensa, newsletter_subscribers, questionarios, perguntas_questionario, tokens_questionario, respostas_questionario, backoffice_admins, imprensa)
- [x] Instalar dependências (pnpm install)
- [x] Servidor de desenvolvimento a funcionar
- [x] 19 testes vitest a passar (candidaturas, auth, chat)
- [ ] Configurar credenciais Odoo (ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY) — necessário para integração CRM

## Auditoria SEO e Melhores Práticas (2026-05-28)
- [x] OG image: usar URL absoluta (https://www.team24.pt/...) em vez de relativa no index.html e SEO.tsx
- [x] Preconnect para CDN de imagens (d2xsxph8kpxj0f.cloudfront.net) e GTM no index.html
- [x] Web App Manifest (manifest.json) para PWA e SEO mobile
- [x] Sitemap.xml: adicionar lastmod dates a todas as entradas
- [x] LandingPage (/demo): adicionar SEO com noIndex=true
- [x] FormacaoDetalhe: adicionar componente SEO com title/description dinâmicos
- [x] FormacaoDetalhe: corrigir dois H1 na mesma página (segundo deve ser H2)
- [x] CareerDetail: adicionar JobPosting JSON-LD schema para vagas individuais
- [x] Footer: adicionar rel="noopener noreferrer" nos links target="_blank"
- [x] Equipa.tsx, BlogPost.tsx, OpiniaoPost.tsx: adicionar rel="noopener noreferrer" nos links externos
- [x] Robots.txt: adicionar Disallow para /demo (landing page de conversão)
- [x] Structured data: adicionar jobPostingLD helper ao SEO.tsx e usar no CareerDetail

## Migração para Novo Projecto WebDev (2026-06-26)

- [x] Restaurar ficheiros sobrescritos pelo scaffold: client/index.html, client/src/App.tsx, client/src/index.css, client/src/main.tsx, client/src/pages/Home.tsx, client/src/pages/NotFound.tsx
- [x] Restaurar server/_core/index.ts, server/routers.ts, server/storage.ts do backup
- [x] Restaurar drizzle/schema.ts do backup
- [x] Adicionar dependências em falta: helmet, multer, @types/multer, jspdf, react-helmet-async
- [x] Configurar segredos: ODOO_API_KEY, ODOO_DB, ODOO_URL, ODOO_USER
- [x] Restaurar o schema da base de dados TiDB via webdev_execute_sql (13 tabelas criadas)
- [x] Verificar o build de produção sem erros (26 testes passam, TypeScript OK)
- [x] Criar checkpoint e publicar o site (versão f55d7231 — pronto para Publish)

## Módulo Outreach — Campanhas de Email (2026-07-01)
- [x] Schema BD: 5 tabelas (outreach_sequencias, outreach_emails, outreach_contactos, outreach_campanhas, outreach_envios)
- [x] Router tRPC outreachRouter com procedures para sequências, contactos e campanhas
- [x] Seed das 2 sequências padrão (Geral e NP4552) com os 4 emails cada
- [x] Importação de contactos do Odoo (por segmento: NP4552 ou clientes gerais)
- [x] UI BackofficeOutreach.tsx com 3 tabs: Campanhas, Sequências, Contactos
- [x] Lançamento de campanha (Email 1 para todos os contactos do segmento)
- [x] Envio de teste por email antes do lançamento
- [x] Métricas por campanha: enviados, erros, respostas, breakdown por email
- [x] Editor de sequências de email (criar/editar/apagar sequências e emails)
- [x] Gestão de contactos (importar Odoo, descartar, apagar, paginação)
- [x] Secção "Campanhas Outreach" adicionada ao sidebar do backoffice
- [x] Gráfico de barras de distribuição por nº de colaboradores na tab de Contactos (recharts, escalões, filtro por segmento)

## Página Ebooks (2026-07-05)
- [x] Página /ebooks com grid de 6 ebooks, filtros por tema (Saúde Mental, Liderança, RH & Cultura, Burnout, Bem-Estar)
- [x] Modal de formulário (nome, email profissional, telefone) antes do download
- [x] Estado de sucesso no modal com botão de download do PDF
- [x] Rota /ebooks registada no App.tsx
- [x] Link "Ebooks Gratuitos" adicionado ao footer (coluna Recursos)

## Ebooks Reais e Validação Odoo (2026-07-06)
- [ ] Substituir os ebooks de exemplo da página /ebooks pelo ebook real "O Custo do Silêncio"
- [ ] Fazer upload do PDF real para CDN e ligar o download ao card do ebook
- [ ] Confirmar que a submissão do formulário de ebook cria lead corretamente no Odoo
- [ ] Ajustar metadados visuais e copy do card/modal com base no PDF real
- [ ] Guardar checkpoint após validação da página e integração

## Novo Ebook — Férias, Stress e Saúde Mental (2026-07-09)
- [x] Fazer upload do PDF "Férias, Stress e Saúde Mental" para CDN
- [x] Adicionar card do novo ebook à página /ebooks com mesmo fluxo (formulário + Odoo + download)
- [x] Atualizar filtros de tema para incluir "Bem-Estar no Trabalho"
- [x] Guardar checkpoint após validação

## CRM / Backoffice Comercial TEAM 24

### Fase 1 — Base de Dados
- [ ] Schema: tabela crm_users (utilizadores CRM com roles: admin, gestor_comercial, psicologo)
- [ ] Schema: tabela crm_empresas (nome, nif, cae, sector, nº colaboradores, website, linkedin, morada, cidade, segmento, score, fonte)
- [ ] Schema: tabela crm_contactos (empresa_id, nome, cargo, departamento, email, telefone, linkedin, decisor)
- [ ] Schema: tabela crm_leads (empresa_id, contacto_id, fase, valor_estimado, probabilidade, origem, responsavel_id, datas, notas, motivo_perda)
- [ ] Schema: tabela crm_actividades (lead_id, tipo, data, resumo, resultado, criado_por)
- [ ] Schema: tabela crm_propostas (lead_id, empresa_id, versao, estado, valor, url_pdf, data_envio, data_abertura)
- [ ] Schema: tabela crm_alertas (tipo, titulo, descricao, lead_id, empresa_id, prioridade, estado, responsavel_id)
- [ ] Gerar e aplicar migração SQL
- [ ] Migrar 1445 leads do Odoo com todos os campos disponíveis
- [ ] Enriquecer leads com número de colaboradores e outros campos em falta

### Fase 2 — Autenticação e Roles
- [ ] Login Microsoft 365 (OAuth via Microsoft Graph API)
- [ ] Gestão de roles: admin, gestor_comercial, psicologo
- [ ] Middleware de autorização por role em todas as rotas CRM
- [ ] Área de admin: gestão de utilizadores (criar, editar, desactivar, atribuir role)

### Fase 3 — Pipeline e Leads
- [ ] Vista Kanban com drag-and-drop entre fases (9 fases do Odoo)
- [ ] Vista de lista com filtros e ordenação
- [ ] Ficha completa da lead com histórico de actividades
- [ ] Registo de actividades (chamada, email, reunião, nota, proposta)
- [ ] Upload de propostas PDF com tracking de abertura
- [ ] Atribuição de responsável por lead

### Fase 4 — Empresas e Contactos
- [ ] Módulo de empresas com perfil completo
- [ ] Múltiplos contactos por empresa
- [ ] Histórico de todas as interacções por empresa
- [ ] Pesquisa e filtros avançados

### Fase 5 — Alertas e Automações
- [ ] Alerta: lead sem actividade há X dias
- [ ] Alerta: proposta enviada há X dias sem resposta
- [ ] Alerta: contrato a renovar em 90/60/30 dias
- [ ] Alerta: nova lead entra no sistema
- [ ] Envio de alertas por email ao responsável
- [ ] Dashboard de alertas activos

### Fase 6 — Área de Administração
- [ ] Dashboard executivo com KPIs (leads, conversão, MRR, pipeline)
- [ ] Gestão de utilizadores e permissões
- [ ] Configuração de automações e alertas
- [ ] Relatórios e exportação de dados

### Fase 7 — Integrações
- [ ] Website team24.pt → leads entram directamente no CRM (substituir Odoo)
- [ ] Integração Microsoft Teams para agendamento de reuniões
- [ ] Agente LinkedIn → CRM via API

## CRM — Perfil Detalhado de Empresa (2026-07-14)
- [x] Backend: crm.empresas.byId com dados completos, leads, contactos, actividades, propostas
- [x] Backend: crm.empresas.addActividade (chamada, email, reunião, nota)
- [x] Backend: crm.empresas.addProposta com upload de PDF para S3
- [x] Backend: crm.empresas.update (editar dados da empresa)
- [x] Frontend: EmpresaDetalhe — painel lateral/modal com tabs
- [x] Frontend: tab Visão Geral (dados, KPIs, responsável, segmento)
- [x] Frontend: tab Actividades (histórico cronológico + formulário nova actividade)
- [x] Frontend: tab Propostas (lista com download + upload nova proposta)
- [x] Frontend: tab Contactos (lista de contactos da empresa)

## CRM — Correcção Mensalidade e Responsável (2026-07-14)
- [x] Executar update-mensalidade.mjs: 940 leads actualizadas com mensalidade do Odoo
- [x] Sincronizar schema Drizzle: responsavelNome adicionado a crm_leads e crm_empresas; mensalidade adicionado a crm_empresas
- [x] Migração SQL aplicada: crm_empresas.responsavelNome e crm_empresas.mensalidade criados
- [x] Frontend EmpresaDetalhe: responsavelNome e mensalidade visíveis na tab Visão Geral
- [x] Lista de empresas: mensalidade (campo novo) mostrado em vez de valorMensalidade
- [x] Router leads.list e leads.kanban: COALESCE(crm_users.nome, crm_leads.responsavelNome) para mostrar responsável Odoo quando não há utilizador CRM
- [x] Frontend: tab Leads (leads associadas à empresa)
- [x] Integrar EmpresaDetalhe na secção Empresas do CRM (clique na linha abre o painel)
- [x] Checkpoint após validação visual

## CRM — Indicador de Renovação (2026-07-14)
- [x] Badge de renovação com cores (verde/amarelo/vermelho) no perfil de empresa e lista de leads
- [x] Campo de data de renovação editável no perfil de empresa (dataFimContrato)
- [ ] Migrar datas de renovação do Odoo (date_deadline e campos personalizados)

## CRM — Widget Renovações no Dashboard (2026-07-14)
- [x] Backend: endpoint crm.dashboard.proximasRenovacoes (5 empresas com dataFimContrato mais próxima)
- [x] Frontend: widget "Próximas Renovações" no dashboard com badge colorido e link para empresa

## CRM — Tema Claro (2026-07-14)
- [x] Converter CRM de tema escuro para tema claro (fundo branco/cinza, texto escuro, acentos laranja)

## CRM — Eliminar Lead (2026-07-14)
- [x] Backend: endpoint crm.leads.delete (eliminar lead por id, apenas admin ou criador)
- [x] Frontend: botão "Eliminar" no modal LeadDetail com diálogo de confirmação

## CRM — Migrar Ebooks/Formulários de Empresas para Leads (2026-07-14)
- [x] Analisar padrão dos registos incorrectos em crm_empresas (ebooks, formulários website)
- [x] Migrar registos de ebooks/formulários de crm_empresas para crm_leads via SQL
- [x] Eliminar registos migrados de crm_empresas

## CRM — Ebooks como Leads + Converter Lead em Empresa (2026-07-14)
- [x] Webhook/router: ebooks e formulários do website criam crm_leads em vez de crm_empresas
- [x] Backend: endpoint crm.leads.converterParaEmpresa
- [x] Frontend: botão "→ Empresa" no modal LeadDetail com formulário inline

## CRM — Sistema de Alertas Programáveis (2026-07-14)
- [x] Schema: tabela crm_regras_alerta criada com 14 regras pré-definidas
- [x] Backend: endpoint alertas.criarManual (criar alerta pontual)
- [x] Backend: endpoints alertas.listarRegras, toggleRegra, editarRegra
- [x] Backend: endpoint alertas.executarVerificacao (gera alertas automáticos por regra)
- [x] Frontend: página Alertas com 3 tabs (Pendentes, Regras Automáticas, Histórico)
- [x] Frontend: tab Regras com toggle on/off e edição de dias por regra
- [x] Frontend: formulário de criação de alerta manual

## CRM — Funil de Vendas (2026-07-14)
- [x] Backend: endpoint crm.funil.stats com dados por fase, período personalizável e comparação mês/ano anterior
- [x] Frontend: página Funil de Vendas com combobox de período, funil visual, tabela de métricas e comparativos

## CRM — Filtro por Comercial no Funil (2026-07-14)
- [x] Backend: adicionar parâmetro responsavelId opcional ao endpoint crm.funil.stats
- [x] Frontend: combobox de comercial no Funil de Vendas (Todos + lista de utilizadores CRM)

## CRM — Módulo de Prospecção LinkedIn (2026-07-14)
- [x] Schema: tabelas crm_prospecting e crm_prospecting_mensagens criadas
- [x] Backend: endpoint público POST /api/prospecting/webhook com API key
- [x] Backend: verificação de duplicados (nome vs crm_leads, empresa vs crm_empresas) no webhook
- [x] Backend: endpoints tRPC crm.prospecting.listar, byId, actualizarEstado, adicionarMensagem, converterEmLead, eliminar
- [x] Frontend: página Prospecção no menu CRM com lista de prospectos e painel de detalhe
- [x] Frontend: badge de duplicado (amarelo=empresa existe, vermelho=pessoa existe como lead)
- [x] Frontend: histórico de mensagens por prospecto (enviada/recebida/nota interna)
- [x] Documentação da API gerada para o agente Claude

## CRM — Prospecção: Paginação e Filtros por Fonte (2026-07-15)
- [ ] Backend: endpoint crm.prospecting.listar com paginação real (pagina, porPagina) e filtro por fonte
- [ ] Frontend: paginação completa na página Prospecção (mostrar todos os 7846 registos, 50 por página)
- [ ] Frontend: filtros por base de dados no topo (PME Excelência, +1000 Funcionários, ISO 45001, NP 4552, Câmaras, Certificadas IPAC, etc.)

## Operação — Backup Integral do Projecto (2026-08-15)
- [ ] Criar arquivo tar.gz integral do projecto, incluindo código, dotfiles, node_modules, artefactos de build, histórico Git e dump SQL completo
