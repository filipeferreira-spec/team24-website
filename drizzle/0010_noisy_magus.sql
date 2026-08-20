CREATE TABLE `equipa` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`area` enum('comercial','psicologos','marketing','administrativo') NOT NULL DEFAULT 'comercial',
	`cargo` varchar(255),
	`email` varchar(320),
	`telefone` varchar(50),
	`linkedin` varchar(500),
	`morada` varchar(500),
	`idade` int,
	`fotoUrl` varchar(500),
	`fotoKey` varchar(500),
	`ferias` text,
	`notas` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipa_id` PRIMARY KEY(`id`)
);
