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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidaturas_id` PRIMARY KEY(`id`)
);
