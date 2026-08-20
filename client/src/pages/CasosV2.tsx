import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight } from "lucide-react";
import { trackAgendarClick } from "@/lib/analytics";

const CDN = "/media";

interface CardData {
  empresa: string;
  logo: string | null; // null = sem logo disponível
  citacao: string;
  autor: string;
}

// Apenas testemunhos reais do PDF fornecido pela TEAM 24
// Logos: apenas os que existem na base de dados. null = "?" placeholder
const CARDS: CardData[] = [
  {
    empresa: "RTP",
    logo: "/media/RTP-logo_3a708cc6_b2e0c6ac.jpg",
    citacao: "A TEAM 24 surge como uma parceria que tem permitido dar resposta e chegar mais perto, aproximar e apoiar. O serviço totalmente online, anónimo e confidencial apresenta uma vantagem única que dá liberdade e oportunidade aos trabalhadores para procurarem este apoio quando mais necessitam.",
    autor: "Bárbara Morgadinho Regadas",
  },
  {
    empresa: "Sporting Clube de Portugal",
    logo: "/media/sporting-logo_a4e265d2_b6e9f7be.webp",
    citacao: "A parceria com a TEAM 24 visa criar awareness na organização para um tema que ainda tende a ser algo estigmatizado na nossa sociedade.",
    autor: "Henrique Dias Duarte · DRH do Sporting Clube de Portugal",
  },
  {
    empresa: "Adecco",
    logo: "/media/adecco-logo-site-1_d9b28d18_2ca5738d.webp",
    citacao: "A TEAM 24 permite-nos facultar a todos os nossos colaboradores um serviço de psicologia ajustado às necessidades e preferências de cada um. Um serviço que está disponível no telemóvel de forma rápida e quase automática e que não falha.",
    autor: "Vânia Borges",
  },
  {
    empresa: "Cazoo",
    logo: "/media/cazoo-logo_65c02361_c7677910.webp",
    citacao: "Ter a TEAM 24 como parceiro da Cazoo tem superado todas as nossas expectativas. Tem sido uma jornada de autodescoberta que nos tem vindo a permitir, enquanto equipa, crescer através da partilha e da vulnerabilidade.",
    autor: "Mafalda Rebêlo",
  },
  {
    empresa: "Grupo Casais",
    logo: "/media/casais2024_60b931ef_195bb364.jpg",
    citacao: "A parceria do Grupo Casais com a TEAM 24 tem sido uma mais-valia para a organização, é dos serviços na área de bem-estar que os colaboradores mais valorizam. A agilidade e rapidez na resposta às nossas solicitações são dois dos aspetos que mais valorizamos.",
    autor: "Flávia Costa",
  },
  {
    empresa: "Salvador Caetano",
    logo: "/media/salvador-caetano-logo_db9504dc_8d02376e.jpg",
    citacao: "Esta sinergia tem tido um impacto elevado junto dos Colaboradores, ajudando-os nos momentos mais difíceis e ao mesmo tempo demonstrando o cuidado e valorização que as nossas empresas atribuem às suas Pessoas.",
    autor: "Miguel Teixeira",
  },
  {
    empresa: "Uphold",
    logo: "/media/uphold-logo_461415d0_e6217365.webp",
    citacao: "Não só através do acompanhamento como também através de ações de sensibilização e workshops, sentimos que esta parceria é uma mais-valia para a Uphold, uma vez que temos como foco a promoção do bem-estar dos nossos colaboradores.",
    autor: "Sofia Barros",
  },
  {
    empresa: "Clece",
    logo: "/media/clece-logo_7df11c2b_b35dfa7f.webp",
    citacao: "A TEAM 24 ajuda-nos a estar mais próximos dos nossos trabalhadores, com vista a melhorar a sua qualidade de vida profissional e pessoal. Oferece-nos um serviço sempre inovador, personalizado à nossa medida, onde a Saúde Mental está a um passo para todos.",
    autor: "Direção Segurança e Saúde no Trabalho",
  },
  {
    empresa: "Doutor Finanças",
    logo: "/media/doutor-financas-logo-1_6faad454_2e8ae90c.webp",
    citacao: "Esta parceria permite aumentar o bem-estar, tal como diminuir o impacto de situações como burnout, stress e ansiedade no contexto profissional. A app TEAM 24 veio ajudar não só na facilidade de uso como no próprio acompanhamento.",
    autor: "Patrícia Coelho",
  },
  {
    empresa: "Agilidade",
    logo: "/media/agilidade-logo_98efe926_373d6b8e.webp",
    citacao: "A TEAM 24 tem contribuído de forma bastante positiva e inovadora na melhoria do bem-estar físico e emocional dos nossos colaboradores, tendo a garantia que podemos contar com o apoio de uma equipa de profissionais jovem, qualificada, experiente, empática e sempre disponível.",
    autor: "Elsa Sanches",
  },
  {
    empresa: "Gizz",
    logo: "/media/gizz-logo_6c719628_604ab02b.webp",
    citacao: "Tem-se mostrado uma ferramenta muito válida para que possamos expor as diferentes situações do dia-a-dia e aumentar os nossos níveis de bem-estar e felicidade.",
    autor: "Silvia Loureiro",
  },
  {
    empresa: "CEPAC",
    logo: "/media/cepac-logo-site_c7dfde29.webp",
    citacao: "O pacote de serviços disponibilizado pela TEAM 24, o profissionalismo e acompanhamento individualizado tem tido um impacto importante no bem-estar e motivação da nossa equipa.",
    autor: "Ana Mansoa",
  },
  {
    empresa: "WireMaze",
    logo: "/media/wiremaze-logo_1987a1e8_15158e94.webp",
    citacao: "Apostar na parceria com a TEAM 24 traduz-se numa resposta eficaz na importância que atribuímos à saúde mental dos nossos colaboradores. Temos a garantia que somos acompanhados em qualquer momento, fazendo com que as pessoas se sintam mais confiantes e felizes.",
    autor: "Marco Vaz",
  },
  {
    empresa: "Lovys",
    logo: "/media/lovys-logo_150521cc_9aecfc09.webp",
    citacao: "Acreditamos firmemente que a criação de um ambiente de trabalho saudável não poderia ser feita sem ouvir atentamente o coração da empresa. As nossas pessoas não devem lidar com isso a sós.",
    autor: "Suzana Branco",
  },
  {
    empresa: "Compara Já",
    logo: "/media/comparaja-logo_2566c686_43a6931c.webp",
    citacao: "A parceria com a TEAM 24 tem-se revelado uma ótima experiência e mais-valia na promoção de bem-estar. A disponibilidade da equipa, aliada à simplicidade da plataforma e ao profissionalismo, demonstram o caminho de melhoria significativa que estamos a conseguir.",
    autor: "Sofia Croft",
  },
  {
    empresa: "Weezie",
    logo: "/media/weezie-logo_2ca5fb9e_404bc3c1.webp",
    citacao: "Estamos extremamente satisfeitos por ter feito parceria com a TEAM 24. A sua plataforma inovadora proporcionou uma maneira conveniente e eficaz de garantir o bem-estar mental da nossa equipa, 24 horas por dia.",
    autor: "Rui Gomes",
  },
  {
    empresa: "Global International Relocation",
    logo: "/media/global-relocation-logo_bfad5be3_87a6bdba.webp",
    citacao: "A adesão ao programa de apoio psicológico da TEAM 24 tem sido uma experiência extremamente positiva. Temos conseguido antecipar e identificar situações de fragilidade entre os nossos colaboradores, permitindo-nos oferecer a melhor resposta possível.",
    autor: "Fábio Pina",
  },
  {
    empresa: "Latittude",
    logo: "/media/latittude-logo_3a013a01_81d9c371.webp",
    citacao: "Estamos muito satisfeitos com a nossa parceria com a TEAM 24! A TEAM 24 tornou-se sem dúvida vital para a nossa estratégia de potenciar o bem-estar dos nossos colaboradores. O feedback que temos recebido em relação a esta parceria é muito positivo.",
    autor: "Cristiana Pereira",
  },
  {
    empresa: "Antas da Cunha ECIJA",
    logo: "/media/antascunha-logo_06401874_520176a9.webp",
    citacao: "A TEAM 24 é uma plataforma que permite que todos os colaboradores possam aceder, de forma totalmente anónima, a diversos recursos de saúde mental. Recomendamos a TEAM 24 a qualquer empresa que queira disponibilizar ferramentas de saúde mental.",
    autor: "Colaboradora da Antas da Cunha",
  },
  {
    empresa: "Silsa",
    logo: "/media/silsa-logo_ad21084e_39a029f0.webp",
    citacao: "Apostar na parceria com a TEAM 24 é promover a importância que atribuímos à Saúde Mental. A parceria com a TEAM 24 permite-nos oferecer um serviço inovador e personalizado de forma imediata e ao alcance de todos os nossos colaboradores.",
    autor: "Alda Viana",
  },
  {
    empresa: "Bolloré",
    logo: "/media/bollore-logo-new_ef20e749_455dbb8f.webp",
    citacao: "A TEAM 24 disponibiliza de forma simples e rápida profissionais qualificados, através de uma aplicação online, que permite diferentes abordagens de apoio psicológico que vão ao encontro da necessidade de cada trabalhador.",
    autor: "Carolina Silva",
  },
  {
    empresa: "CCA Law Firm",
    logo: "/media/ccalaw_df795732_9febb90e_396536c0.webp",
    citacao: "A parceria com a TEAM 24 reforça o nosso compromisso e permite-nos promover o bem-estar e a saúde mental, mantendo o nosso ambiente de trabalho saudável e humano.",
    autor: "Teresa Rocha",
  },
  {
    empresa: "Nutrium",
    logo: "/media/nutrium-logo_ca2eb42e_3a69044c.webp",
    citacao: "A parceria estabelecida com a TEAM 24 tem sido fundamental para incentivar as nossas pessoas a cuidar do seu bem-estar e encontrámos na TEAM 24 o parceiro ideal para caminhar ao nosso lado.",
    autor: "Margarida Terra",
  },
  {
    empresa: "ACT",
    logo: "/media/act-logo_0e54eb04_4ec9c3de.webp",
    citacao: "Com a disponibilização de um serviço de psicologia online, contamos contribuir para aumentar o bem-estar dos trabalhadores da ACT, nas suas diferentes dimensões, reduzindo expressivamente o impacto de situações como o stress e a ansiedade em contexto de trabalho.",
    autor: "Daniel Alves · Chefe de Divisão de Formação e Recursos Humanos",
  },
  {
    empresa: "CENFIM",
    logo: "/media/cenfim-logo_17799e52_a24af268.webp",
    citacao: "A TEAM 24 reforçou o bem-estar psicológico no CENFIM com avaliações clínicas rigorosas e intervenções breves e eficazes. Garantiram confidencialidade, respostas rápidas e apoio em crise, reduzindo absentismo e melhorando o clima.",
    autor: "Graciete Santos Ribeiro",
  },
  {
    empresa: "TRIDEC",
    logo: "/media/tridec-logo_79cc333b_dc1a2296.webp",
    citacao: "A intervenção da Team 24 trouxe-nos ferramentas práticas, acompanhamento próximo e uma abordagem humana, que se adaptou à nossa realidade industrial. O resultado tem sido visível: maior envolvimento das equipas e ambiente de trabalho mais equilibrado.",
    autor: "Ana Soares",
  },
  {
    empresa: "Mecwide",
    logo: "/media/mecwide-logo_6adc7807_abffb3c3.webp",
    citacao: "Valorizar as nossas pessoas significa garantir que têm acesso a ferramentas que promovem o seu bem-estar, e este apoio tem sido amplamente reconhecido e apreciado pelos nossos colaboradores.",
    autor: "Rita Monteiro",
  },
  {
    empresa: "WEB",
    logo: "/media/web3-logo_494609c1_698c6e79.webp",
    citacao: "A Team24 é um verdadeiro parceiro de negócios: uma equipa em quem confiamos para apoiar qualquer questão relacionada com o bem-estar e o desenvolvimento individual e da equipa.",
    autor: "Sara Loureiro",
  },
  {
    empresa: "W Algarve",
    logo: "/media/walgarve-logo_fe991f6f_8e994dfb.webp",
    citacao: "A forma como isso é realizado pelo Team 24 deixa-me extremamente satisfeita: tudo é conduzido com profissionalismo, sigilo e um cuidado que transmite à empresa a confiança de que estamos a colocar as nossas pessoas em boas mãos.",
    autor: "Fernanda Magri",
  },
  {
    empresa: "Moldetipo",
    logo: "/media/moldetipo-group_bd012873_def61976.webp",
    citacao: "A Moldetipogroup, com a TEAM24, encontrou a solução e o parceiro ideal para apoiar e acompanhar de forma confidencial a nossa equipa de colaboradores na resolução de problemas que possam sentir.",
    autor: "Gonçalo",
  },
  {
    empresa: "Águas de Gondomar",
    logo: "/media/aguasgondomar-logo_16766ff0_fcf5398b.webp",
    citacao: "A colaboração com a TEAM 24 tem-nos permitido promover o bem-estar dos nossos colaboradores de forma consistente, próxima e eficaz, com impacto real no clima organizacional e na motivação das equipas.",
    autor: "Paula Viana",
  },
  {
    empresa: "Shamir",
    logo: "/media/shamir-logo_b979b170_cac823e7.webp",
    citacao: "As pessoas são o principal pilar do nosso sucesso e o cuidado com a sua saúde mental é fundamental. A parceria com a Team24 tem-se revelado muito importante para esse cuidado.",
    autor: "Tiago Portulez",
  },
  {
    empresa: "Opensoft",
    logo: "/media/opensoft-logo_1a404518_659924f2.webp",
    citacao: "O bem-estar dos nossos colaboradores é a nossa principal preocupação! A parceria com a Team24 veio reforçar essa preocupação contribuindo para promover boas práticas a nível de saúde mental e bem-estar. Esta parceria ajuda-nos a consolidar um ambiente saudável dentro da Opensoft.",
    autor: "Filipa Jesus",
  },
  {
    empresa: "Sunrise",
    logo: "/media/sunrise-logo_66d879cb_bba45e16.webp",
    citacao: "Gostaríamos de dar os parabéns à TEAM 24 pelo serviço de apoio psicológico prestado à nossa empresa. A dedicação e a competência desta têm sido fundamentais para promover o bem-estar e a saúde mental dos nossos colaboradores, contribuindo significativamente para um ambiente de trabalho mais saudável e produtivo.",
    autor: "Mário Leitão",
  },
  {
    empresa: "Eurotux",
    logo: "/media/eurotux-logo_ebedf547_a80027b8.webp",
    citacao: "Investir na saúde mental dos nossos colaboradores com o apoio da Team 24 tem sido uma experiência transformadora. Estamos convencidos que cuidar do bem-estar emocional da nossa equipa é essencial para promover um ambiente de trabalho mais harmonioso, com colaboradores mais envolvidos e satisfeitos.",
    autor: "Marlene Silva",
  },
  {
    empresa: "Cork Supply",
    logo: "/media/corksupply-logo_f93a3b59_32f82cf8.webp",
    citacao: "Começámos a utilizar o serviço da TEAM24 este ano, e logo na divulgação deste novo benefício foi visível o interesse por parte das pessoas, principalmente pela possibilidade de terem consultas de psicologia à disposição de forma discreta e conveniente. Tem sido uma ferramenta útil para diversas pessoas na nossa Organização.",
    autor: "Maria de Fátima Gonçalves",
  },
  {
    empresa: "Aubay",
    logo: "/media/aubay-logo_5da60bd7_c0a46000.webp",
    citacao: "Acreditamos que somos responsáveis por criar condições, incentivar e influenciar as nossas pessoas a cuidar do seu bem-estar e a parceria com a TEAM 24 surge com esse objetivo. Na Aubay, fazemos questão que os nossos colaboradores saibam que não estão sozinhos.",
    autor: "Ana Gomes",
  },
  {
    empresa: "Sheraton Lisboa Hotel & Spa",
    logo: "/media/sheraton-logo_6e9c43d1_adeab7ea.webp",
    citacao: "Este benefício foi recebido por toda a nossa equipa como algo muito positivo. A app é de fácil utilização, as consultas são de fácil agendamento e a equipa é de extremo profissionalismo. O focus na saúde mental dos nossos colaboradores é uma prioridade e a TEAM 24 tem sido o parceiro perfeito.",
    autor: "Joana Marques",
  },
  {
    empresa: "BNI",
    logo: "/media/bni-logo_e1d6b68e_7366ff0e.webp",
    citacao: "A interação entre as partes tem sido de crescimento e de preocupação com o nosso capital humano, para a promoção do bem-estar organizacional. A TEAM 24 é uma equipa essencial para promover um ambiente de trabalho mais saudável, resultando em maior produtividade, menor absentismo e de um clima de colaboração e empatia entre todos.",
    autor: "Cláudia Assunção Medeiros",
  },
  {
    empresa: "Penguin Random House",
    logo: "/media/penguin-logo_cd942582_13d32040.webp",
    citacao: "Enquanto organização responsável que se preocupa com as suas pessoas, só poderíamos entender que o investimento na saúde mental dos nossos colaboradores é investir no sucesso da nossa empresa: equipas mais motivadas, produtivas e resilientes constroem negócios mais fortes, sustentáveis e felizes. E a Team24 é o parceiro ideal para isso.",
    autor: "Isabel Gaspar",
  },
  {
    empresa: "Sky Medical",
    logo: "/media/skymedical-logo_588646c8_63b4ecfa.webp",
    citacao: "Possibilitar um canal anónimo, gratuito e imediato pode fazer a diferença para aqueles que atravessam por uma fase de conflitos com eles próprios. Na Skymedical, estamos comprometidos em manter uma cultura organizacional positiva e, por isso, é prioritário continuarmos a cuidar dos nossos em qualquer momento das suas vidas.",
    autor: "Ana Sousa",
  },
  {
    empresa: "Randstad Digital Portugal",
    logo: "/media/randstad-digital-logo_ed037958_a7d1ff19.webp",
    citacao: "Na Randstad Digital Portugal, valorizamos o bem-estar, o equilíbrio entre a vida profissional e pessoal e a felicidade dos nossos colaboradores. A parceria com a TEAM 24 permite-nos reforçar este compromisso, oferecendo apoio especializado que promove um ambiente de trabalho saudável e sustentável.",
    autor: "Patrícia Teixeira",
  },
  {
    empresa: "Smart Consulting",
    logo: "/media/smartconsulting-logo_996b529e_1771a0fa.webp",
    citacao: "Temos tido uma experiência extremamente positiva com a App Team 24. Num momento em que cuidar da saúde mental se tornou uma prioridade, contar com um serviço de qualidade como este, sem os custos normalmente associados, faz toda a diferença. Estamos bastante satisfeitos com o impacto desta iniciativa.",
    autor: "Lúcia Moura",
  },
  {
    empresa: "Konica Minolta",
    logo: "/media/konicaminolta-logo_77562793_752fa3a4.webp",
    citacao: "A parceria com a Team24 tem sido uma peça-chave no reforço do nosso compromisso com as pessoas, permitindo-nos oferecer consultas de psicologia de forma rápida, acessível e absolutamente confidencial. A qualidade dos serviços prestados e a dedicação da sua equipa de profissionais tem superado as nossas expectativas.",
    autor: "Rute Xavier",
  },
  {
    empresa: "STEF",
    logo: "/media/stef-logo_be49f642_31435c85.webp",
    citacao: "Estamos extremamente satisfeitos pela parceria com a TEAM 24. A sua plataforma proporciona uma maneira conveniente e eficaz de garantir o bem-estar mental. Facilidade de acesso aos profissionais de psicologia altamente qualificados, de forma anónima, confidencial e com uma abrangência nacional. A parceria com a TEAM 24 tem-se revelado uma ótima experiência e uma mais-valia na promoção de bem-estar da STEF!",
    autor: "Magda Peralta",
  },
  {
    empresa: "KPMG",
    logo: "/media/kpmg-logo_2483cd03_6ebb8ad7.webp",
    citacao: "A parceria da KPMG com a TEAM 24 tem sido fundamental para promover o bem-estar mental dos nossos colaboradores. O serviço de apoio à saúde mental que nos têm prestado contribui imensamente para um ambiente de trabalho mais saudável e produtivo. Estamos muito satisfeitos com os resultados.",
    autor: "Pedro Sousa",
  },
  {
    empresa: "AstraZeneca",
    logo: "/media/astrazeneca-logo_1e252261_eeba21f4.webp",
    citacao: "A promoção do bem-estar físico e mental é uma prioridade estratégica da nossa política de Recursos Humanos. A TEAM24 é um dos elementos cruciais para o sucesso desta iniciativa. Trata-se de uma ferramenta valorizada por todos, uma vez que a acessibilidade a profissionais especializados permite um acompanhamento em qualquer momento.",
    autor: "Mafalda Visitação",
  },
  {
    empresa: "APAV",
    logo: "/media/apav-logo_d5f13534_f25c4661.webp",
    citacao: "Formalizámos há quase um ano uma parceria com a TEAM 24. Este serviço, 100% online, oferece ferramentas adaptadas às necessidades da nossa equipa, distribuída por diversas áreas geográficas. Destacamos ainda o apoio da equipa da TEAM 24, que tem assegurado a monitorização dos dados da App e prestado suporte contínuo.",
    autor: "Ana Sequeira",
  },
  {
    empresa: "SAMSYS",
    logo: "/media/samsys-logo_2b05eccf_2aba9cf0.webp",
    citacao: "O sucesso de uma organização não vem apenas da inovação ou da tecnologia, mas sim da capacidade de criar um ambiente onde as pessoas se sentem valorizadas, motivadas e, acima de tudo, se sintam bem. Foi isso que nos levou a trabalhar com a TEAM 24. Mais do que um investimento, esta parceria é um compromisso.",
    autor: "Ruben e Samuel Soares",
  },
  {
    empresa: "PDMFC",
    logo: "/media/pdmfc-logo_445f45a5_f8cccfb4.webp",
    citacao: "A TEAM 24 tem sido um recurso essencial na nossa empresa, proporcionando aos nossos colaboradores um apoio psicológico contínuo e acessível. A utilização da app não só tem melhorado o ambiente de trabalho, mas também tem aumentado a produtividade e a satisfação no trabalho, criando uma cultura organizacional mais saudável.",
    autor: "Ana Filipa Carvalho",
  },
  {
    empresa: "Tangível",
    logo: "/media/tangivel-logo_3e000109_c90ba605.webp",
    citacao: "No Grupo Tangível, acreditamos que cuidar das pessoas é essencial para um ambiente de trabalho saudável. A parceria com a TEAM 24 tem-nos permitido disponibilizar aos nossos colaboradores um espaço seguro onde podem procurar apoio psicológico sempre que necessário.",
    autor: "Andreia Roques",
  },
  {
    empresa: "Clínica Santa Madalena",
    logo: "/media/santamadalena-logo_597ec0c8_62abba1f.webp",
    citacao: "Perante os desafios exigentes do dia a dia que todos enfrentamos torna-se urgente olhar pela saúde mental dos nossos. Assim a parceria com a Team 24 foi uma opção simples de fazer. O feedback que recebemos faz-nos acreditar que estamos no caminho certo e que esta parceria torna as nossas equipas mais fortes e preparadas.",
    autor: "Miguel Fernandes Homem",
  },
  {
    empresa: "Royal de Heus",
    logo: "/media/deheus-logo_ce9fbeba_4b0623b3.webp",
    citacao: "O Programa de Apoio Psicológico da Team 24 para os trabalhadores da De Heus é uma iniciativa essencial para promover o bem-estar emocional e mental dos nossos colaboradores. Em suma, o programa não só beneficia os colaboradores, mas também gera impacto positivo para a De Heus, criando um ambiente mais saudável, produtivo e sustentável.",
    autor: "Ricardo Oliveira",
  },
  {
    empresa: "MDS",
    logo: "/media/mds-logo_d426daed_b087b6b7.webp",
    citacao: "A TEAM 24 tem sido, para nós, uma verdadeira parceira de confiança, que caminha ao nosso lado na promoção da saúde emocional dos nossos colaboradores. Mais do que um prestador, a TEAM 24 tem-se afirmado como uma extensão da nossa própria visão de cuidado e bem-estar.",
    autor: "Ana Queiroga",
  },
  {
    empresa: "Eurofirms",
    logo: "/media/eurofirms-logo_6662e6e1_81ed87eb.webp",
    citacao: "A parceria com a TEAM 24 tem sido um verdadeiro pilar no nosso compromisso com o bem-estar das nossas equipas. A abordagem humana, acessível e profissional tem permitido promover conversas abertas e saudáveis no ambiente de trabalho. Acreditamos verdadeiramente que cuidar da saúde mental é cuidar do coração da nossa organização: as pessoas.",
    autor: "Cristina Rosa",
  },
  {
    empresa: "ZOLVE ES",
    logo: "/media/zolvees-logo_d51f40fc_34f9aa61.webp",
    citacao: "En enero de 2024 pusimos en marcha en la compañía TEAM 24, un servicio de ayuda psicológica gratuito para todos los trabajadores. Cada día estamos más contentos con la decisión, porque la evolución en el uso del servicio es notoria, lo que significa que estamos ayudando cada vez más a nuestros trabajadores.",
    autor: "Vanessa Blanco",
  },
  {
    empresa: "FABAMAQ",
    logo: "/media/fabamaq-logo_21392a32_d5b48236.webp",
    citacao: "A parceria com a TEAM 24 veio reforçar o nosso compromisso com o bem-estar e a saúde mental das nossas pessoas. Com este apoio, conseguimos alargar e enriquecer as nossas ações, disponibilizando novos recursos e ferramentas que ajudam as pessoas a lidarem melhor com os desafios do dia a dia.",
    autor: "Sara Carvalho",
  },
  {
    empresa: "TCC Whitstone",
    logo: "/media/tccwhitstone-logo_c6dacf14_3d84b775.webp",
    citacao: "Acreditamos que a saúde mental é um pilar fundamental do bem-estar, e por isso valorizamos a parceria com a Team 24. A plataforma revelou-se intuitiva e fácil de usar, proporcionando uma experiência positiva. Destacamos especialmente a empatia e profissionalismo das equipas envolvidas.",
    autor: "Érica Gama",
  },
  {
    empresa: "Costa Nova",
    logo: "/media/costanova-logo_497127dc_eb99b5ec.webp",
    citacao: "O Grupo COSTA NOVA Industria acredita que o sucesso sustentável começa com as pessoas. Repensar o bem-estar e a promoção da saúde psicológica como uma prática de trabalho, e não apenas como um benefício, tem sido fundamental para potenciar o foco e a produtividade dos nossos colaboradores.",
    autor: "Ana Santana",
  },
];

function FlipCard({ card, isDemo }: { card: CardData; isDemo?: boolean }) {
  const [flipped, setFlipped] = useState(false);

  // Animação de demonstração: vira e reverte automaticamente no primeiro card
  useEffect(() => {
    if (!isDemo) return;
    const t1 = setTimeout(() => setFlipped(true), 1200);
    const t2 = setTimeout(() => setFlipped(false), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isDemo]);

  return (
    <div
      style={{
        perspective: "1200px",
        height: "280px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
      aria-label={`Testemunho de ${card.empresa}`}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Frente — logo ou placeholder */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            backgroundColor: "#ffffff",
            border: "1px solid #E8EEF2",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {card.logo ? (
            <img
              src={card.logo}
              alt={card.empresa}
              loading="lazy"
            style={{
              maxWidth: "85%",
              maxHeight: "120px",
              objectFit: "contain",
            }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#F0F4F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: "36px",
                  color: "#94A3B8",
                  fontWeight: "700",
                }}
              >
                ?
              </div>
              <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#64748B",
                textAlign: "center",
              }}
              >
                {card.empresa}
              </span>
            </div>
          )}
          {card.logo && (
            <span
            style={{
              marginTop: "14px",
              fontSize: "13px",
              color: "#94A3B8",
              fontWeight: "500",
            }}
            >
              {card.empresa}
            </span>
          )}
        </div>

        {/* Verso — testemunho */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "#0A1A2A",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "22px 24px 18px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}
        >
          <p
            style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "#CBD5E1",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 8,
            WebkitBoxOrient: "vertical",
            margin: 0,
            }}
          >
            {card.citacao}
          </p>
          <div           style={{ marginTop: "12px", borderTop: "1px solid #1E3A5F", paddingTop: "10px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span             style={{ fontSize: "12px", fontWeight: "700", color: "#E8572A" }}>
              {card.autor}
            </span>
            <span style={{ fontSize: "12px", color: "#475569" }}>·</span>
            <span style={{ fontSize: "12px", color: "#64748B" }}>
              {card.empresa}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CasosV2() {
  return (
    <>
      <SEO
        title="Casos de Sucesso | TEAM 24"
        description="Mais de 30 empresas portuguesas confiam na TEAM 24 para cuidar do bem-estar dos seus colaboradores. Conheça os seus testemunhos."
        canonicalPath="/casos-v2"
      />
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #0A1A2A 0%, #0F2940 100%)",
          padding: "120px 0 80px",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(232,87,42,0.15)",
              color: "#E8572A",
              border: "1px solid rgba(232,87,42,0.3)",
              borderRadius: "20px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: "600",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            Casos de Sucesso
          </span>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 3rem)",
              fontWeight: "800",
              color: "#FFFFFF",
              lineHeight: 1.2,
              marginBottom: "20px",
            }}
          >
            <span style={{ display: "block", whiteSpace: "nowrap" }}>O que dizem as empresas</span>
            <span style={{ display: "block", whiteSpace: "nowrap" }}>
              <em style={{ color: "#E8572A", fontStyle: "italic" }}>que confiam na TEAM 24</em>
            </span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#94A3B8", maxWidth: "560px", margin: "0 auto" }}>
            Testemunhos reais de responsáveis de RH e líderes de empresas parceiras.
          </p>
        </div>
      </section>

      {/* Grid de cards */}
      <section style={{ background: "#F8FAFC", padding: "80px 0" }}>
        <style>{`
          .casos-grid {
            max-width: 1100px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
          }
          @media (max-width: 900px) {
            .casos-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 560px) {
            .casos-grid { grid-template-columns: 1fr; }
          }
        `}</style>
        <div className="container casos-grid">
          {CARDS.map((card, i) => (
            <FlipCard key={card.empresa} card={card} isDemo={i === 0} />
          ))}
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            fontSize: "13px",
            color: "#94A3B8",
          }}
        >
          Passe o rato sobre cada card para ler o testemunho
        </p>
      </section>

      {/* CTA */}
      <div
        className="container"
        style={{
          marginTop: "5rem",
          paddingTop: "4rem",
          paddingBottom: "5rem",
          borderTop: "2px solid var(--coral)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "1.5rem",
        }}
      >
        <div className="md:flex-row md:items-center md:justify-between" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5rem", width: "100%" }}>
          <div>
            <h3
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                marginBottom: "0.5rem",
              }}
            >
              A sua empresa pode ser o próximo caso de sucesso.
            </h3>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", color: "var(--stone)" }}>
              Comece com uma demo gratuita. Sem compromisso.
            </p>
          </div>
          <Link href="/agendar" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button onClick={() => trackAgendarClick("cases_page")} className="btn-coral">
              Agendar Reunião Gratuita
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
