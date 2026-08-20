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
	`respondido` boolean NOT NULL DEFAULT false,
	`respondidoAt` timestamp,
	`expiraAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokens_questionario_id` PRIMARY KEY(`id`),
	CONSTRAINT `tokens_questionario_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `carreiras` ADD `slug` varchar(255);