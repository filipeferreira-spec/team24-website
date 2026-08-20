CREATE TABLE `backoffice_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`nome` varchar(255),
	`email` varchar(320),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastLogin` timestamp,
	CONSTRAINT `backoffice_admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `backoffice_admins_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `candidaturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carreiraId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telefone` varchar(50),
	`linkedin` varchar(500),
	`mensagem` text,
	`cvUrl` varchar(500),
	`cvNome` varchar(255),
	`estado` enum('pendente','em_analise','entrevista','rejeitado','aceite') NOT NULL DEFAULT 'pendente',
	`classificacao` int,
	`notasInternas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carreiras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`slug` varchar(255),
	`departamento` varchar(100),
	`localizacao` varchar(255),
	`tipo` enum('full-time','part-time','freelance','estagio') NOT NULL DEFAULT 'full-time',
	`nivel` enum('junior','medio','senior','lead','diretor') DEFAULT 'medio',
	`descricao` text,
	`requisitos` text,
	`beneficios` text,
	`salarioMin` int,
	`salarioMax` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`publicado` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carreiras_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `casos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresa` varchar(255) NOT NULL,
	`setor` varchar(100),
	`logoUrl` varchar(500),
	`imagemUrl` varchar(500),
	`resultado` varchar(255),
	`descricao` text,
	`citacao` text,
	`citacaoAutor` varchar(255),
	`citacaoRole` varchar(255),
	`metrica1Label` varchar(100),
	`metrica1Valor` varchar(50),
	`metrica2Label` varchar(100),
	`metrica2Valor` varchar(50),
	`metrica3Label` varchar(100),
	`metrica3Valor` varchar(50),
	`destaque` boolean NOT NULL DEFAULT false,
	`publicado` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `casos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imprensa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(500) NOT NULL,
	`publicacao` varchar(255) NOT NULL,
	`tipo` enum('artigo','entrevista','comunicado','mencao') NOT NULL DEFAULT 'artigo',
	`resumo` text,
	`url` varchar(500),
	`imagemUrl` varchar(500),
	`dataPublicacao` timestamp,
	`destaque` boolean NOT NULL DEFAULT false,
	`publicado` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imprensa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `outreach_campanhas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`sequenciaId` int NOT NULL,
	`segmento` enum('geral','np4552','outro') NOT NULL DEFAULT 'geral',
	`estado` enum('rascunho','ativa','pausada','concluida') NOT NULL DEFAULT 'rascunho',
	`remetentNome` varchar(255) NOT NULL DEFAULT 'Filipe Ferreira',
	`remetentEmail` varchar(320) NOT NULL DEFAULT 'filipe.ferreira@team24.pt',
	`totalContactos` int NOT NULL DEFAULT 0,
	`lancadaAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_campanhas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_contactos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`empresa` varchar(255),
	`cargo` varchar(255),
	`segmento` enum('geral','np4552','outro') NOT NULL DEFAULT 'geral',
	`odooPartnerId` int,
	`ativo` boolean NOT NULL DEFAULT true,
	`descartado` boolean NOT NULL DEFAULT false,
	`motivoDescarte` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_contactos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenciaId` int NOT NULL,
	`ordem` int NOT NULL,
	`diaCadencia` int NOT NULL,
	`assunto` varchar(500) NOT NULL,
	`corpo` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_envios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campanhaId` int NOT NULL,
	`contactoId` int NOT NULL,
	`emailId` int NOT NULL,
	`estado` enum('pendente','enviado','erro','aberto','clicado','respondido','descartado') NOT NULL DEFAULT 'pendente',
	`enviadoAt` timestamp,
	`erroMsg` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_envios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_sequencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`segmento` enum('geral','np4552','outro') NOT NULL DEFAULT 'geral',
	`ativa` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_sequencias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `perguntas_questionario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionarioId` int NOT NULL,
	`ordem` int NOT NULL DEFAULT 0,
	`texto` text NOT NULL,
	`tipo` enum('texto','escolha_multipla','escala','sim_nao') NOT NULL DEFAULT 'texto',
	`opcoes` text,
	`obrigatoria` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `perguntas_questionario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carreiraId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recursos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('ebook','artigo','webinar','ferramenta','guia','template') NOT NULL DEFAULT 'artigo',
	`tema` varchar(100),
	`imageUrl` varchar(500),
	`downloadUrl` varchar(500),
	`isPremium` boolean NOT NULL DEFAULT false,
	`isNovo` boolean NOT NULL DEFAULT false,
	`publicado` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recursos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_questionario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`perguntaId` int NOT NULL,
	`resposta` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_questionario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tokens_questionario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(128) NOT NULL,
	`candidaturaId` int NOT NULL,
	`questionarioId` int NOT NULL,
	`emailEnviado` boolean NOT NULL DEFAULT false,
	`emailEnviadoAt` timestamp,
	`lembreteEnviado` boolean NOT NULL DEFAULT false,
	`lembreteEnviadoAt` timestamp,
	`respondido` boolean NOT NULL DEFAULT false,
	`respondidoAt` timestamp,
	`expiraAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokens_questionario_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokens_questionario_token_unique` UNIQUE(`token`)
);
