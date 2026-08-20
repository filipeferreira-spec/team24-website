CREATE TABLE `actividade_comercial` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` varchar(10) NOT NULL,
	`comercialId` int,
	`comercialNome` varchar(150) NOT NULL,
	`leadsContactadas` int NOT NULL DEFAULT 0,
	`reunioesAgendadas` int NOT NULL DEFAULT 0,
	`reunioesRealizadas` int NOT NULL DEFAULT 0,
	`propostasEnviadas` int NOT NULL DEFAULT 0,
	`contratosFechados` int NOT NULL DEFAULT 0,
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actividade_comercial_id` PRIMARY KEY(`id`)
);
