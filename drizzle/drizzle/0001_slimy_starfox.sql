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
CREATE TABLE `carreiras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
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
