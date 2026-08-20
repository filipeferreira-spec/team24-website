CREATE TABLE `crm_automacao_fila` (
	`id` int AUTO_INCREMENT NOT NULL,
	`automacaoId` int NOT NULL,
	`estado` enum('pendente','processando','concluido','cancelado') NOT NULL DEFAULT 'pendente',
	`triggerEntidade` enum('lead','empresa','contacto','prospecting','newsletter'),
	`triggerEntidadeId` int,
	`triggerEntidadeNome` varchar(255),
	`triggerPayload` json,
	`agendadoPara` timestamp NOT NULL,
	`tentativas` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_automacao_fila_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_automacao_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`automacaoId` int NOT NULL,
	`estado` enum('sucesso','erro','pendente','ignorado') NOT NULL,
	`triggerEntidade` enum('lead','empresa','contacto','prospecting','newsletter'),
	`triggerEntidadeId` int,
	`triggerEntidadeNome` varchar(255),
	`acaoExecutada` text,
	`erro` text,
	`agendadoPara` timestamp,
	`executadoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_automacao_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_automacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativa` boolean NOT NULL DEFAULT true,
	`triggerTipo` enum('lead_criada','lead_fase_alterada','lead_sem_actividade','proposta_enviada','proposta_sem_resposta','cliente_criado','contrato_a_expirar','newsletter_subscricao','ebook_download','reuniao_agendada','reuniao_sem_followup','lead_perdida','cliente_perdido','aniversario_contrato') NOT NULL,
	`triggerCondicoes` json,
	`delayHoras` int NOT NULL DEFAULT 0,
	`acaoTipo` enum('enviar_email','criar_alerta','criar_actividade','mover_fase','notificar_responsavel','enviar_email_interno','criar_reuniao') NOT NULL,
	`acaoConfig` json NOT NULL,
	`emailAssunto` varchar(500),
	`emailCorpo` text,
	`maxExecucoes` int,
	`totalExecucoes` int NOT NULL DEFAULT 0,
	`ultimaExecucao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`criadoPor` int,
	CONSTRAINT `crm_automacoes_id` PRIMARY KEY(`id`)
);
