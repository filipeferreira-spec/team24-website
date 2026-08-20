CREATE TABLE `crm_prospecting` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`urlLinkedin` varchar(500),
	`cargo` varchar(255),
	`email` varchar(255),
	`telefone` varchar(50),
	`empresa` varchar(255),
	`sectore` varchar(255),
	`nFuncionarios` varchar(50),
	`website` varchar(500),
	`estado` enum('identificado','pedido_enviado','ligado','mensagem_1','mensagem_2','mensagem_3','resposta_positiva','resposta_negativa','reuniao_agendada','sem_resposta','descartado') NOT NULL DEFAULT 'identificado',
	`duplicadoTipo` enum('nenhum','lead_existente','empresa_existente','ambos') NOT NULL DEFAULT 'nenhum',
	`duplicadoLeadId` int,
	`duplicadoEmpresaId` int,
	`agenteNome` varchar(255),
	`notas` text,
	`ultimaActualizacao` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`ativo` boolean NOT NULL DEFAULT true,
	CONSTRAINT `crm_prospecting_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_prospecting_mensagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prospectingId` int NOT NULL,
	`tipo` enum('enviada','recebida','nota_interna') NOT NULL DEFAULT 'enviada',
	`conteudo` text NOT NULL,
	`canal` enum('linkedin','email','whatsapp','telefone','outro') NOT NULL DEFAULT 'linkedin',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_prospecting_mensagens_id` PRIMARY KEY(`id`)
);
