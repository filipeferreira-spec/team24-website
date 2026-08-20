CREATE TABLE `outreach_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`envioId` int NOT NULL,
	`campanhaId` int NOT NULL,
	`contactoId` int NOT NULL,
	`emailId` int NOT NULL,
	`tipo` enum('abertura','clique','resposta') NOT NULL,
	`url` varchar(2048),
	`userAgent` varchar(512),
	`ip` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outreach_tracking_id` PRIMARY KEY(`id`)
);
