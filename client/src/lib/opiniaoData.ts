/* ============================================================
   TEAM 24 — Artigos de Opinião
   Escritos pelos psicólogos e especialistas da TEAM 24.
   O campo `conteudo` usa Markdown (mesmo formato do Blog).
   ============================================================ */

export interface ArtigoOpiniao {
  id: number;
  slug: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  autorCargo: string;
  autorAvatar?: string;
  data: string; // ISO 8601
  imagemCapa: string;
  resumo: string;
  conteudo: string; // Markdown — mesmo formato dos artigos do Blog
  tags: string[];
  referencias?: string[];
}

export const ARTIGOS_OPINIAO: ArtigoOpiniao[] = [
  {
    id: 1,
    slug: "seguranca-psicologica-no-trabalho",
    titulo: "Segurança Psicológica no Trabalho – o que significa e qual a sua importância?",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Mariana Fernandes",
    autorCargo: "Psicóloga TEAM 24",
    data: "2023-09-01",
    imagemCapa: "/media/opiniao-seguranca-psicologica-hero_0c9fbae3_c89fe383_a2c27c22.webp",
    resumo:
      "O conceito de Segurança Psicológica é a crença de que alguém não será punido ou humilhado por cometer erros, partilhar as suas ideias e/ou preocupações, fazer perguntas ou discordar da sua chefia.",
    tags: ["Segurança Psicológica", "Liderança", "Bem-estar Organizacional"],

    conteudo: `O conceito de **Segurança Psicológica** é a crença de que alguém não será punido ou humilhado por cometer erros, partilhar as suas ideias e/ou preocupações, fazer perguntas ou discordar da sua chefia. Mais ainda, existe uma perceção de que as opiniões de todos importam e contribuem para o desenvolvimento da organização.

No contexto das empresas, este conceito tem vindo a assumir um papel preponderante, uma vez que a segurança psicológica contribui para um ambiente de trabalho produtivo e sustentável em que as pessoas se sentem confortáveis em participar ativamente nos processos de tomada de decisão e de inovação. Por esta razão, um ambiente psicologicamente seguro no trabalho está associado a maior aprendizagem, compromisso, desempenho, *engagement*, criatividade e felicidade. A investigação tem ainda verificado que os contextos com baixos níveis de Segurança Psicológica apresentam maior *turnover* e maior risco de *burnout*.

## O que caracteriza um contexto psicologicamente seguro?

A ideia de segurança psicológica no trabalho surgiu nos anos 50, tendo sido definida enquanto conceito nos anos 90 por Amy Edmondson, professora da Harvard Business School. Desde então, têm sido realizados diversos estudos empíricos sobre o tema que assumiu um destaque particular para explicar o sucesso organizacional.

A Segurança Psicológica não é uma necessidade exclusivamente individual, mas uma qualidade inerente ao grupo/equipa, que molda o comportamento de aprendizagem e cria espaços de compreensão e crescimento.

Um contexto de trabalho psicologicamente seguro proporciona aos colaboradores a possibilidade de se demonstrarem vulneráveis e serem honestos na relação com os outros, nomeadamente com as suas lideranças. Os colaboradores percecionam que se trata de um espaço seguro para falar sobre as falhas, sem receio do julgamento e penalização. De realçar que não se trata de uma promoção ou incentivo ao erro, mas sim a aceitação do mesmo no processo de melhoria contínua. Neste sentido, a evidência empírica aponta que a segurança psicológica potencia a resiliência e bem-estar emocional dos colaboradores, permitindo que todos possam atingir o seu potencial máximo.

O conceito de segurança psicológica tem sido aplicado por muitos líderes e gestores, tendo impacto no modo como gerem as suas equipas e desenvolvem a sua liderança.

## Qual o papel dos líderes na promoção da segurança psicológica?

As lideranças desempenham um papel crucial na cultura organizacional e na forma como os elementos da equipa se relacionam, comunicam e se sentem no trabalho. Através das suas próprias ações, os líderes podem demonstrar como lidar com o outro e resolver conflitos de maneira construtiva. Concomitantemente, devem dar suporte e recursos para que os membros da equipa possam desenvolver relacionamentos positivos e saudáveis.

Além disso, os líderes devem estar atentos às necessidades e preocupações da equipa. Devem estar abertos a receber feedback, disponíveis para ouvir as preocupações dos colaboradores e preparados para agir quando necessário de forma a resolver problemas e melhorar o ambiente de trabalho. Nesta linha, as lideranças devem promover espaços de escuta ativa que permitam aos colaboradores sentirem acolhimento nas suas participações, no processo da construção de soluções, estratégias e mudança.

Assim, ao agirem enquanto exemplos vivos da cultura de segurança psicológica, inspiram e encorajam os membros da equipa a fazer o mesmo.

## Como podemos criar e promover a segurança psicológica nas empresas?

Existem algumas ações que contribuem para uma maior Segurança Psicológica nas empresas:

- Realização de *Workshops* dirigidos às lideranças no âmbito deste conceito, com enfoque na sua aplicabilidade prática;
- Criação de canais de comunicação em que os colaboradores podem expressar as suas preocupações, partilhar ideias, fazer perguntas e receber e dar feedback (ex. *one-to-one* com as suas chefias);
- Realização de reuniões informais, sem a presença de superiores hierárquicos, em que os colaboradores discutem e partilham experiências, resolvendo conflitos de uma forma construtiva;
- Formação sobre competências interpessoais e sociais aos colaboradores, em temáticas como: comunicação assertiva, resolução de conflitos, inteligência emocional ou *soft skills*;
- Inclusão dos colaboradores no processo de avaliação de desempenho;
- Realização de *team buildings* focalizados no fortalecimento da relação de confiança entre colegas e com lideranças;
- Promoção de um *work-life-balance* e uma conciliação trabalho-família, o que demonstra um cuidado relativamente ao bem-estar geral dos colaboradores;
- Sensibilização para uma cultura organizacional com base no respeito e inclusão, em que todos os colaboradores se sentem valorizados independentemente da sua identidade, origem ou opinião;
- Estabelecimento de políticas e procedimentos claros para lidar com situações de discriminação, assédio ou outros conflitos interpessoais nas equipas.

Criar e promover segurança psicológica exige um compromisso de todos os membros de uma empresa. Ao potenciar a confiança, respeito e transparência, as lideranças contribuem para a criação de equipas mais colaborativas, resilientes e preparadas para lidar com os desafios da organização.`,
  },
  {
    id: 2,
    slug: "rust-out-a-lideranca-pode-enferrujar",
    titulo: "Rust Out: A Liderança Pode Enferrujar!",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Rita Ferreira",
    autorCargo: "Psicóloga TEAM 24",
    data: "2023-10-01",
    imagemCapa: "/media/opiniao-rust-out-hero_ecbec9bf_3a98dc3b_bbf8120b.webp",
    resumo:
      "Os líderes estão mais sujeitos ao rust out, mas também são parte da solução. O rust out é um fenómeno tão recente que a investigação ainda escasseia, mas que se faz sentir nas organizações a uma velocidade preocupante.",
    tags: ["Rust Out", "Liderança", "Motivação", "Bem-estar Organizacional"],

    conteudo: `Ser líder é, muitas vezes, ser o único a saber existir um oásis e fazer um grupo inteiro percorrer um deserto até lá. No início pode ser o mais entusiasta com a perspetiva que será um pequeno caminho até a água e sombra fresca. Mas com a passagem dos dias, o enfrentamento de tempestades de areia, a necessidade de ensinar técnicas de sobrevivência, cuidar das feridas que se fazem pelo caminho e as altas temperaturas é possível que comece a duvidar do seu propósito e se a jornada faz sentido. Haverá mesmo um oásis ali à frente?

Reconhece este sentimento? Será que faz sentido esta missão? Para quê perseguir este objetivo se o caminho tem sido tão tumultuoso? Depois dos pensamentos em *loop*, vem o desânimo e a apatia. Não há desistência, há um adormecimento anímico que afeta o desempenho.

***Rust out* é um termo usado na indústria que se refere à deterioração de um material devido à ferrugem. Só que a indústria encontrou formas de proteger os seus metais contra o enferrujamento, no entanto para as pessoas o desenferrujar torna-se mais complexo.**

O *rust out* pode acontecer em qualquer momento da carreira, mas é mais comum em recém-licenciados, gestores intermédios e em mulheres profissionais de alto desempenho. A investigação demonstrou que a desigualdade de género ainda presente nos dias de hoje leva a que as mulheres sintam que devem trabalhar mais do que os homens para obter a mesma progressão na carreira, tornando-as mais suscetíveis a entrar em *rust out*. Já os recém-licenciados revelam sentirem-se limitados por uma função que não lhes permite demonstrar as suas capacidades e qualificações.

## Rust Out ou Burnout?

O *rust out* pode ter início numa diminuição das tarefas laborais ou nas tarefas repetitivas. O trabalho pouco estimulante, ou o fazer pouco, gera um desgaste emocional tão grande quanto a sobrecarga laboral, *burnout*. Assim, apesar de o *rust out* ter um início oposto ao *burnout* eles fazem parte de um mesmo contínuo, levando aos mesmos sintomas: agitação, mau humor, ansiedade, procrastinação e desmotivação.

Embora sejam fenómenos relacionados com a atividade profissional, o impacto negativo no resto da vida pode sentir-se, afetando hábitos alimentares, alterações do sono, causando inércia e infelicidade e levando à depressão.

## Porquê que o Rust Out afeta as lideranças?

Existe uma relação direta entre *rust out* e a falta de oportunidades e progressão na carreira, sendo este o motivo pelo qual as lideranças estão mais suscetíveis ao fenómeno. O líder, com um papel fundamental nas organizações, por ser uma via de comunicação entre a administração e a restante empresa e o que conduz a equipa ao sucesso, depara-se com a necessidade de representar diferentes papéis e salvaguardar os próprios interesses. Nesta mediação entre todos, são suscetíveis a rapidamente sentirem-se pouco reconhecidos, desmotivando e questionando-se se o esforço vale a pena.

O desgaste dos dias e o sentimento de o empenho não estar a ser recompensado fazem surgir o sentimento de enferrujamento.

***RUST OUT* é um fenómeno tão recente que a investigação ainda escasseia, mas que se faz sentir nas organizações, a uma velocidade preocupante, e já se sabe que são os líderes os mais suscetíveis.**

## Mas afinal como desenferrujar?

Aquilo que está a sentir importa para a sua empresa. Partilhe com a sua organização os seus sentimentos e as suas vivências. Muitas vezes, existem mais soluções do que as que imagina. Conferir mais autonomia para que possa decidir como trabalha e o que faz, facilitar a progressão, desenvolver competências e abraçar novos desafios são algumas das ações que as ciências sociais destacam como fatores de promoção do bem-estar, em situação de *rust out*.

**A autonomia, mestria e propósito são os três fatores que as organizações estão a apostar para desenferrujar os seus colaboradores.**

Quando falamos de desmotivação não conseguimos apresentar uma fórmula pronta. Existem diretrizes, mas será sempre necessário ouvir a pessoa, perceber o que a motiva, de que forma a organização pode proporcionar sentido de propósito, aumentando o sentimento de pertença. Só uma liderança empática e de proximidade pode salvaguardar esta premissa base.

O líder é o elemento essencial para a promoção de uma cultura organizacional de compreensão e aceitação. Mas para ser este líder de suporte, precisa de saber como desenferrujar.

Procure o seu sentido de missão dentro da organização. Pode envolver-se num trabalho de autorreflexão, respondendo às questões: em que momento da minha carreira me senti mais realizado/a e orgulhoso/a? O que me faz feliz enquanto profissional? As respostas a estas questões irão recentrá-lo para a sua essência profissional e facilitarão o encontro de novo propósito.

Sendo que o *rust out* tem na sua base a diminuição ou repetição de tarefas, traga os seus interesses para o seu dia-a-dia. Quais são os seus hobbies, as suas paixões? Num primeiro momento pode parecer difícil pensar como conciliar estes interesses nas tarefas profissionais, mas acredite que é possível.

Por fim, envolva-se em conhecer a sua equipa, aqueles que atravessam o deserto consigo. Conheça as suas capacidades e competências, os seus talentos e paixões, estreite relações e pratique a empatia. Afinal, não está a fazer a viagem sozinho. Conheça-se com os olhos dos que fazem consigo a caminhada. Ao conhecer os outros dará a oportunidade de se conhecer a si também. A relação é o fator mais importante para o encontro da motivação e o restabelecer do bem-estar.

E se nada disto funcionar, chame um helicóptero de salvamento. Procure ajuda! O *rust out* é um fenómeno profissional que pode ter um grande impacto psicológico e a ajuda profissional pode ser necessária e útil.`,
  },
  {
    id: 3,
    slug: "liberdade-comunicacao-e-sucesso-organizacional",
    titulo: "Liberdade, Comunicação e Sucesso Organizacional",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Maria Ferreira",
    autorCargo: "Psicóloga TEAM 24",
    data: "2024-04-25",
    imagemCapa: "/media/opiniao-liberdade-comunicacao-hero_2ca630d6_1bec6537_ec983314.webp",
    resumo:
      "A comunicação aberta e segura é um pilar fundamental para uma organização saudável. Em honra dos 50 anos da Revolução dos Cravos, refletimos sobre como a liberdade de expressão impacta o sucesso organizacional.",
    tags: ["Comunicação", "Liderança", "Cultura Organizacional", "Feedback"],

    conteudo: `Em honra de uma das mais importantes efemérides da História contemporânea de Portugal, este ano, celebram-se os 50 anos da Revolução dos Cravos.

De entre as muitas conquistas sociais e individuais que este evento aportou ao país, a **liberdade de expressão** foi a que de forma mais transversal impactou o rumo do mesmo. Não por ser um fim em si mesma, mas porque permite mudança através do diálogo, no sentido do que é melhor para a comunidade.

Ora, a comunicação aberta e segura é um pilar fundamental para uma organização saudável.

## O Poder da Comunicação nas Organizações

Muitos têm sido os esforços para perceber como abordagens e estilos de comunicação democráticos podem melhorar a performance dos trabalhadores e como torná-las eficientes estratégias de retenção de talentos. Com uma população cada vez mais qualificada, integrada num mercado de trabalho global e livre, é sabido que a qualidade do ambiente organizacional é a chave para manter equipas estáveis, motivadas e produtivas.

Abril trouxe-nos mais literacia e com ela mais liberdade de pensamento. O trabalho passou de uma obrigação acrítica, a um importante contributo para a realização pessoal e para o sentido de vida. Desta forma, as ***feedback conversations*** são instrumentos pertinentes que mantêm o colaborador alinhado com o objetivo da empresa, enquanto reconhecem valor ao esforço do seu trabalho. Estas ferramentas de *engagement* organizacional são tanto mais úteis quanto mais próximas do comportamento a assinalar, podendo atentar a ***positive feedback***, como a ***construtive feedback***.

## Positive Feedback

Embora possamos ser tentados a alertar mais ao que corre menos bem, as conversas de *positive feedback* têm vindo a revelar-se poderosas estratégias de motivação, com especial atenção para as que sublinham *work progress*. Além de valorizado, o colaborador percebe que a sua liderança se mantém atenta e diligente às suas necessidades e à sua capacidade de superar desafios.

## Construtive Feedback

Mesmo que mais frequentes, as conversas de *construtive feedback* devem ser alvo de especial cuidado. O objetivo desta ferramenta deve ser alertar para comportamentos pouco eficientes, sem agredir as características pessoais do colaborador. É, sobretudo, uma oportunidade de reflexão conjunta para identificar falhas e expectativas para o futuro, clarificando objetivos de forma aberta e segura. Quando bem planeadas, possibilitam ao colaborador uma evolução sustentada das suas capacidades e uma maior perceção de pertença.

## Stay Conversations

A liberdade possibilita mudanças, que, mais do que nunca, são ágeis e permanentes no meio organizacional. A disrupção de padrões de conduta tem um potencial evolutivo igual ao destrutivo, mediante a forma como forem comunicadas as mudanças. As ***stay conversations*** podem tornar-se um simples, mas muito eficaz, recurso de retenção de talento e ajustamento à mudança. Elucidando o colaborador acerca das suas valências para a instituição e da sua perceção acerca delas, esta estratégia de comunicação é um mecanismo de construção de confiança e estabilidade no valor pessoal do trabalhador. Mediante um retorno à sua zona de conforto, as *stay conversations* têm demonstrado eficácia em reduzir a necessidade de procura por outras oportunidades profissionais como estratégia para mitigar a ambiguidade causada pela mudança. Ao sentir-se valorizado e alinhado com os novos objetivos organizacionais, o colaborador volta a um estado de comprometimento assente nas capacidades empáticas da sua liderança.

## Exit Interviews

Uma vez que as mudanças, mesmo que dolorosas, podem sempre converter-se em oportunidades de evolução. As ***exit interviews*** são exemplo disso mesmo. Reter talento deve ser um objetivo, mas deixá-los partir é um ato de grande responsabilidade, quer para a imagem da empresa, quer para o que ela revela acerca do funcionamento da organização. A liberdade de escolha de um colaborador não deve ser encarada de forma litigiosa, senão uma oportunidade de *insight* acerca dos motivos que podem levar à rotatividade de trabalhadores. Para que tal tenha o efeito construtivo pretendido, importa que o entrevistador seja capaz de estabelecer uma relação de confiança, que possibilite uma partilha rica e honesta, preferencialmente isenta de relações de hierarquia. Além disso, a preparação deste momento deve ser cuidadosa, para que se façam perguntas pertinentes, quer acerca do motivo da saída, quer acerca do que o mercado pode estar a oferecer de inovador, sem esquecer a visão pessoal acerca de que práticas poderiam ser implementadas para evitar perdas futuras. Finalmente, é fundamental que estas conversas sejam consequentes e possam converter-se em programas sustentados de mudança, orientados para a coesão da equipa.

Dia 25 de abril de 1974 é um símbolo de liberdade, porque dali em diante se abriu espaço a oportunidades de fazer diferente. Abril tornou-nos permeáveis à possibilidade, aportando dinamismo e inovação às pessoas e às empresas. Percebemos que pessoas motivadas se traduzem em produtividade, mas que as pessoas se deixam motivar por projetos em que acreditam e por pessoas que os sabem transmitir. Sabemos que pessoas motivadas, são pessoas saudáveis, que constroem organizações sãs. Honrar abril é continuar a alimentar a expressão livre de ideias, necessidades e emoções nas organizações.`,
  },
  {
    id: 4,
    slug: "saude-mental-dos-lideres",
    titulo: "Porquê que a Saúde Mental dos Líderes deve ser uma prioridade?",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Jessica Alves",
    autorCargo: "Psicóloga TEAM 24",
    data: "2024-04-01",
  imagemCapa: "/media/opiniao-saude-mental-lideres-hero_db17186d_7232794c.webp",
  resumo:
    "Um estudo com 3,4 mil pessoas em dez países revelou que as atitudes dos líderes impactam 69% a saúde mental dos colaboradores — um impacto equiparável apenas ao do companheiro de vida.",
  tags: ["Saúde Mental", "Liderança", "Burnout", "Bem-estar Organizacional"],

  conteudo: `Um estudo realizado pela *The Workforce Institute* UK com 3,4 mil pessoas em dez países revelou que as atitudes dos líderes das empresas impactam **69% a saúde mental dos colaboradores**. Este impacto é superior ao impacto que um terapeuta ou médico têm e é equiparável apenas ao impacto que o companheiro de vida tem na sua saúde mental.

Os líderes e chefias de uma empresa são as pessoas a quem os trabalhadores recorrem e estão na linha da frente da experiência dos colaboradores, portanto, fundamentais no apoio à saúde psicológica e segurança no local de trabalho. Contudo, só poderão desempenhar este papel eficazmente, se a sua própria saúde mental estiver preservada.

## Ser Líder não é sinónimo de estar SEMPRE bem

Frequentemente o líder é percebido como alguém que possui determinadas características — inteligência, motivação, dinamismo — tipicamente associadas a um perfil forte e implicitamente saudável mentalmente. Além disso, o líder é percebido como estando numa posição hierárquica superior e por isso, terá acesso a recursos sociais e organizacionais, como um maior controlo sobre o seu trabalho e flexibilidade que são fatores importantes para a saúde mental no trabalho.

A verdade é que independentemente do cargo e posição que ocupam na organização, os líderes não deixam de ser colaboradores da empresa e fazem parte das equipas que lideram, estando expostos aos mesmos riscos psicossociais e à mesma cultura organizacional que os restantes colaboradores.

Além disso, a complexidade cognitiva das suas funções e tomada de decisão, as emoções negativas dos colaboradores que lhes são dirigidas, o isolamento social e solitude dos cargos de topo, a responsabilidade que têm sobre a saúde e segurança dos trabalhadores, sustentam o valor que é necessário atribuir à saúde mental dos que ocupam esta posição de responsabilidade.

> **"A liderança não é menos suscetível às dificuldades e desafios que afetam a organização."** Ethan Karp, CEO e presidente do Grupo MAGNET

## Ser Líder é aprender a estar bem, primeiro por si e depois pelo outro

A investigação mostra que os líderes atualmente enfrentam níveis mais elevados de burnout e problemas de saúde mental do que nunca. Os desafios da liderança sempre foram elevados, no entanto, conhecido o impacto que têm nas equipas, é essencial os líderes e organizações garantirem que estão a fazer tudo o que podem para dar o seu melhor e terem um impacto mais positivo nos outros. Para isso é importante olhar para o líder como um colaborador, cuja saúde mental deve ser protegida e promovida pela organização.

## Estratégias para promover a Saúde Mental das Lideranças

**Privilegiar o autocuidado:** práticas de autocuidado, tais como exercício físico, sono descansado, alimentação saudável, participação em atividades que proporcionem bem-estar e relaxamento, fazer pausas durante o dia de trabalho e estabelecer limites é crucial para manter o bem-estar mental.

**Criar rede de apoio:** procurar ativamente o apoio de mentores, colegas com funções semelhantes ou de superiores que possam fornecer orientação e um espaço seguro para discutir desafios e preocupações.

**Aplicar técnicas de Mindfulness:** praticar meditação, exercícios de respiração profunda ou a escrita de um diário, podem proporcionar momentos de calma e clareza no meio das exigências da liderança.

**Promover o work-life balance:** devem ser um modelo de integração saudável entre a vida profissional e pessoal, promovendo horários flexíveis, tempo livre e uma cultura que valorize tanto o bem-estar como a produtividade.

**Praticar a auto-compaixão:** oferecer a si próprio compaixão e encorajamento em vez de autocrítica, cria um diálogo interior de apoio que alimenta a saúde mental em geral.

**Procurar apoio profissional:** procurar um profissional como, por exemplo, um psicólogo pode oferecer-lhe um espaço seguro para discutir as suas preocupações, ganhar clareza e desenvolver estratégias eficazes para ultrapassar desafios.

Um líder que se preocupa e cuida da sua saúde mental não está a demonstrar sinais de fraqueza, mas sim, um exemplo de responsabilidade e compromisso consigo próprio, com aqueles que lidera e com a organização. Uma liderança que priorize a saúde mental está mais apta a tomar decisões ponderadas, a lidar com desafios de forma mais resiliente e a inspirar a sua equipa. Promover uma cultura em que o autocuidado é valorizado e a saúde mental protegida, é não só um investimento com retorno garantido, como contribuiu para lideranças consistentes e ambientes de trabalho mais positivos.`,
  },
  {
    id: 5,
    slug: "saude-mental-employer-branding",
    titulo: "Saúde Mental como Impulsionadora de Employer Branding",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Nídia Franco",
    autorCargo: "Psicóloga TEAM 24",
    data: "2024-05-01",
    imagemCapa: "/media/opiniao-employer-branding-hero_56d05113_ee92e685.webp",
    resumo:
      "O employer branding está relacionado com a forma como a organização se apresenta perante os seus colaboradores atuais e potenciais. A saúde mental tornou-se uma das suas ferramentas mais poderosas.",
    tags: ["Employer Branding", "Saúde Mental", "Atração de Talentos", "Bem-estar Organizacional"],

    conteudo: `Nos últimos tempos temos assistido a inúmeras mudanças sociais, económicas, políticas e tecnológicas ao nível global. Estas alterações exigem uma maior adaptação, flexibilidade e inovação por parte das organizações. Sabemos que os colaboradores são os ativos mais valiosos das organizações. Assim, a atração e retenção de talentos é fundamental para o crescimento das empresas, mas é também um dos principais desafios que estas enfrentam atualmente. Para se conseguirem diferenciar no mercado como empregadores atrativos e desejáveis as organizações têm utilizado o **employer branding** como uma ferramenta estratégica.

O **employer branding** está relacionado com a forma como a organização se apresenta perante os seus colaboradores atuais e potenciais colaboradores. Esta estratégia é desenvolvida de modo que a organização foque os seus esforços em recrutar profissionais que agreguem valor e consiga manter os colaboradores que permitem o seu crescimento.

O principal objetivo do **employer branding** é que exista um alinhamento de valores e uma troca positiva para ambas as partes. Ou seja, a organização oferece aquilo que as pessoas valorizam (salários, benefícios, formação, progressão, reconhecimento etc.), em troca daquilo que necessita por parte dos colaboradores (motivação, capacidades e conhecimento), sendo expectável que ambas as partes cumpram com o seu acordo.

## A promoção da saúde psicológica no local de trabalho como uma bandeira de employer branding

Já não é novidade que valorizar o bem-estar dos colaboradores beneficia as pessoas individualmente e contribui para o sucesso global das organizações. O investimento na saúde mental dos colaboradores está a tornar-se uma prioridade. Exemplo disso são grandes empresas como a Google, a Amazon e a Microsoft que oferecem programas de apoio psicológico aos seus colaboradores já há algum tempo.

A implementação de programas de apoio psicológico é uma das formas pelas quais as empresas podem demonstrar que se preocupam com o bem-estar dos seus colaboradores. Esses planos podem incluir, por exemplo: consultas de psicologia, apoio psicológico de emergência, workshops sobre gestão de stress, formações, avaliação do clima organizacional, avaliação de riscos psicossociais etc.

## De que forma pode a inclusão de programas de apoio psicológico beneficiar as organizações?

**Cuidado com os Colaboradores:** Ao oferecer programas de apoio psicológico, as empresas demonstram empatia e preocupação com o bem-estar dos seus colaboradores, reconhecendo e valorizando os seus esforços diários. Além disso, este cuidado transmite a mensagem clara de que a empresa valoriza não só as competências técnicas da sua força de trabalho, mas também a sua saúde e bem-estar geral. Tudo isto contribui para a construção de uma marca empregadora forte e positiva.

**Criação de um Ambiente de Trabalho Saudável:** A implementação de programas de apoio psicológico contribui para a criação de um ambiente de trabalho mais acolhedor e seguro e promove uma cultura empática de confiança e interajuda. Quando as pessoas sentem que há uma preocupação genuína com as suas necessidades emocionais e que podem partilhar as suas dificuldades, ficam mais disponíveis para estabelecer um compromisso afetivo com a empresa e conseguem ser mais produtivas.

**Atração e Retenção de talentos:** Os potenciais colaboradores estão a priorizar cada vez mais locais de trabalho que valorizem a sua saúde mental e bem-estar. A incorporação destes programas também contribui para a retenção dos colaboradores. Uma força de trabalho que se sente apoiada e valorizada tem maior probabilidade de permanecer leal à organização.

**Produtividade e Desempenho:** Uma força de trabalho psicologicamente saudável é consequentemente uma força de trabalho mais produtiva. A intervenção psicológica permite que os colaboradores desenvolvam estratégias para gerir o stress, resolver conflitos, manter o foco e contribuir de forma ativa e criativa para os objetivos da empresa.

**Redução do Estigma em Torno da Saúde Mental:** A inclusão de programas de apoio psicológico nas organizações, estimula as pessoas a procurarem ajuda em momentos de dificuldade. A promoção do bem comum é altamente valorizada na sociedade atual e contribui para que a empresa seja percebida como um agente de mudança positiva.

**Demonstração de Responsabilidade Social:** A aposta no apoio psicológico revela o compromisso da organização com a responsabilidade social corporativa. Isto contribui para uma imagem muito positiva da empresa, tanto interna quanto externamente.

A **inclusão de programas de apoio psicológico** como parte do **employer branding** é uma **abordagem transformadora**. Ao reconhecer a importância de investir na saúde mental, as organizações podem promover mudanças positivas nos colaboradores, no ambiente de trabalho, aumentar a sua produtividade e contribuir para o desenvolvimento da sociedade. A aposta na saúde mental pode ajudar as organizações a posicionarem-se como empregadores de referência, num mercado cada vez mais competitivo e exigente.`,
  },
  {
    id: 6,
    slug: "qualidade-nas-organizacoes",
    titulo: "Qualidade nas Organizações: conheça um dos fatores de maior impacto",
    subtitulo: "A TEAM 24 Responde...",
    autor: "Joel Teixeira",
    autorCargo: "Psicólogo TEAM 24",
    data: "2023-11-10",
    imagemCapa: "/media/opiniao-qualidade-organizacoes-hero_43f447a9_c2bb77db.webp",
    resumo:
      "E se o bem-estar dos colaboradores for um indicador de Qualidade na Organização? Descubra como a saúde mental e os riscos psicossociais impactam diretamente a qualidade organizacional.",
    tags: ["Qualidade", "Bem-estar", "Riscos Psicossociais", "Gestão de Pessoas"],

    conteudo: `Assinalou-se, na semana de **6 a 10 de novembro de 2023, a semana da Qualidade**, tendo como objetivo destacar a importância da qualidade na produtividade e na competitividade das organizações, mas também refletir nas melhores práticas.

Este ano, a Semana da Qualidade foi celebrada sob o lema **"Qualidade: realizando seu potencial competitivo"**. O potencial competitivo de uma organização consiste na capacidade de se manter sustentável e ampliar o seu mercado. Assim, torna-se essencial entender que só é possível **ampliar o potencial competitivo de uma organização através do bem-estar dos seus colaboradores**, tendo em vista a melhoria do produto final para os seus clientes.

## Afinal o que é Qualidade nas Organizações?

Defina-se “qualidade” como a totalidade de características de um produto ou serviço que possuem a capacidade de satisfazer uma certa necessidade de um determinado cliente.

Qualidade é mais do que apenas uma palavra da moda, é sim um diferencial competitivo no atual cenário de mercado em constante evolução. Da produção aos serviços, a gestão da qualidade ajuda as organizações a racionalizar os seus processos, aumentar a satisfação do cliente e impulsionar o crescimento sustentável.

Em qualquer setor de atividade existem diversos fatores a influenciar diretamente a definição de “qualidade”, como a cultura, o serviço prestado, as necessidades dos consumidores e as suas expectativas. No entanto, a qualidade final só poderá ser obtida não só através do “Sistema de Gestão da Qualidade” que visa um conjunto de elementos interligados, integrados na organização de uma empresa para atender à política da qualidade e os objetivos da organização, mas também que os colaboradores se sintam parte dela, aumentando o seu sentimento de pertença.

## Bem-estar e Qualidade

Simplificando, o bem-estar está orientado para oferecer aos colaboradores condições de trabalho que lhes permitam estar de tal forma envolvidos com a organização e com os papéis que desempenham. É uma conjuntura de atividades oferecida pelas organizações que proporcionam emoções positivas aos seus colaboradores sempre que eles pensam nas atividades que exercem no seu contexto laboral. Só conseguimos alcançar a qualidade com o envolvimento de toda a estrutura organizacional.

Na conjuntura atual das organizações é imprescindível melhorar as práticas na gestão das pessoas, uma vez que o salário já não é a principal dimensão na retenção dos seus colaboradores e do seu potencial.

O bem-estar dos colaboradores no local de trabalho está intimamente ligado à gestão dos riscos psicossociais, sendo que avaliar e abordar os riscos psicossociais nas organizações não só prioriza a saúde e o bem-estar, como acarreta vantagens para as entidades empregadoras, nomeadamente na redução do absentismo e presentismo, no aumento da motivação, produtividade e na melhoria da imagem organizacional.

## Riscos Psicossociais: como prevenir?

Os riscos psicossociais são uma das categorias de riscos profissionais e correspondem aos aspetos da organização e da gestão do trabalho, dos contextos sociais e ambientais relativos ao trabalho que têm potenciais efeitos negativos do ponto de vista psicossocial. Em termos gerais, é possível enumerar o stresse ocupacional, o assédio moral, a violência no trabalho, o *burnout*, a carga mental no trabalho, assim como o trabalho emocional.

Com a abordagem correta, os riscos psicossociais podem ser prevenidos e geridos com sucesso, independentemente da dimensão ou tipo de organização. A prevenção destes riscos constitui não só uma obrigação moral, mas também um bom investimento para as entidades empregadoras. Além da **responsabilidade legal das organizações em assegurar a avaliação e o controlo adequados dos riscos no local de trabalho**, é essencial garantir também o envolvimento dos colaboradores, pois são estes que têm uma melhor perceção dos problemas que podem ocorrer no local de trabalho.

## Qualidade, Bem-estar e Riscos Psicossociais: como serão as organizações do futuro?

As constantes evoluções no mundo do trabalho levaram à emergência de novos riscos ocupacionais para o trabalhador, como é o exemplo dos riscos psicossociais. A avaliação de riscos psicossociais e o desenvolvimento de intervenções personalizadas às necessidades específicas de cada organização promovem um local de trabalho feliz, na medida em que promovem o bem-estar de todos os colaboradores.

Assim, só podemos pensar em qualidade quando temos colaboradores saudáveis, felizes e interligados à cultura da organização, pois **locais de trabalho saudáveis promovem a qualidade organizacional**.`,
  },
];
