CREATE TABLE `crm_regras_alerta` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('renovacao_contrato','lead_sem_actividade','proposta_sem_resposta','cliente_aniversario','lead_nova_website','reuniao_sem_followup','contrato_expirado','lead_fase_parada','mensalidade_alta_sem_contacto','personalizado') NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`diasAntecedencia` int DEFAULT 30,
	`prioridade` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`destinatarioId` int,
	`limiarMensalidade` int,
	`ultimaExecucao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_regras_alerta_id` PRIMARY KEY(`id`)
);
