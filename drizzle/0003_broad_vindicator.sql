CREATE TABLE `crm_actividades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`empresaId` int,
	`criadoPorId` int,
	`tipo` enum('chamada','email','reuniao','nota','proposta','contrato','outro') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`resultado` varchar(500),
	`dataActividade` timestamp NOT NULL,
	`duracao` int,
	`concluida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_actividades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('lead_sem_actividade','proposta_sem_resposta','contrato_renovacao','nova_lead','reuniao_proxima','follow_up','outro') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`prioridade` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`estado` enum('pendente','enviado','resolvido','ignorado') NOT NULL DEFAULT 'pendente',
	`leadId` int,
	`empresaId` int,
	`responsavelId` int,
	`emailEnviado` boolean NOT NULL DEFAULT false,
	`emailEnviadoAt` timestamp,
	`resolvidoAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_contactos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empresaId` int,
	`odooPartnerId` int,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(255),
	`departamento` varchar(100),
	`email` varchar(320),
	`telefone` varchar(50),
	`telemovel` varchar(50),
	`linkedin` varchar(500),
	`decisor` boolean NOT NULL DEFAULT false,
	`influenciador` boolean NOT NULL DEFAULT false,
	`notas` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_contactos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`odooId` int,
	`nome` varchar(255) NOT NULL,
	`nif` varchar(20),
	`cae` varchar(20),
	`sector` varchar(100),
	`subSector` varchar(100),
	`numColaboradores` int,
	`numColaboradoresRange` varchar(50),
	`website` varchar(500),
	`linkedin` varchar(500),
	`morada` varchar(500),
	`cidade` varchar(100),
	`codigoPostal` varchar(20),
	`pais` varchar(100) DEFAULT 'Portugal',
	`telefone` varchar(50),
	`email` varchar(320),
	`segmento` enum('pme','grande_empresa','multinacional','setor_publico','ong','outro') DEFAULT 'pme',
	`score` int DEFAULT 0,
	`fonte` varchar(100),
	`tags` text,
	`notas` text,
	`clienteAtivo` boolean NOT NULL DEFAULT false,
	`dataInicioContrato` timestamp,
	`dataFimContrato` timestamp,
	`valorMensalidade` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`odooId` int,
	`empresaId` int,
	`contactoId` int,
	`responsavelId` int,
	`titulo` varchar(500) NOT NULL,
	`fase` enum('leads','em_tratamento','reuniao_agendada','proposta_enviada','proposta_adjudicada','won','renovacoes_pendente','contratos_renovados','contratos_terminados','servicos_isolados','lost') NOT NULL DEFAULT 'leads',
	`valorEstimado` int,
	`probabilidade` int DEFAULT 10,
	`origem` varchar(100),
	`mensalidade` int,
	`mensalidadeComEap` int,
	`valorTotal` int,
	`tipoEap` varchar(255),
	`videoconsultas` varchar(100),
	`workshops` varchar(100),
	`avaliacaoRiscos` varchar(100),
	`dataFechamento` timestamp,
	`dataInicioContrato` timestamp,
	`dataRenovacao` timestamp,
	`ativo` boolean NOT NULL DEFAULT true,
	`motivoPerda` varchar(500),
	`notas` text,
	`ultimaActividade` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_propostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`empresaId` int,
	`criadaPorId` int,
	`titulo` varchar(255) NOT NULL,
	`versao` int NOT NULL DEFAULT 1,
	`estado` enum('rascunho','enviada','visualizada','aceite','rejeitada','expirada') NOT NULL DEFAULT 'rascunho',
	`valor` int,
	`pdfUrl` varchar(500),
	`pdfKey` varchar(500),
	`trackingToken` varchar(128),
	`dataEnvio` timestamp,
	`dataAbertura` timestamp,
	`dataValidade` timestamp,
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_propostas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_reunioes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`empresaId` int,
	`organizadorId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp NOT NULL,
	`tipo` enum('teams','presencial','telefone') NOT NULL DEFAULT 'teams',
	`linkTeams` varchar(1000),
	`microsoftEventId` varchar(255),
	`estado` enum('agendada','confirmada','realizada','cancelada','nao_compareceu') NOT NULL DEFAULT 'agendada',
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_reunioes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255),
	`role` enum('admin','gestor_comercial','psicologo') NOT NULL DEFAULT 'gestor_comercial',
	`microsoftId` varchar(255),
	`microsoftAccessToken` text,
	`microsoftRefreshToken` text,
	`microsoftTokenExpiry` timestamp,
	`avatarUrl` varchar(500),
	`telefone` varchar(50),
	`ativo` boolean NOT NULL DEFAULT true,
	`ultimoLogin` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `crm_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `outreach_campanhas` MODIFY COLUMN `segmento` enum('geral','np4552','outro','clientes','em_tratamento','reuniao_agendada','proposta_enviada','proposta_adjudicada','won','renovacoes_pendente','contratos_renovados','contratos_terminados','servicos_isolados','perdido','teste') NOT NULL DEFAULT 'geral';--> statement-breakpoint
ALTER TABLE `outreach_contactos` MODIFY COLUMN `segmento` enum('geral','np4552','outro','clientes','em_tratamento','reuniao_agendada','proposta_enviada','proposta_adjudicada','won','renovacoes_pendente','contratos_renovados','contratos_terminados','servicos_isolados','perdido','teste') NOT NULL DEFAULT 'geral';--> statement-breakpoint
ALTER TABLE `outreach_sequencias` MODIFY COLUMN `segmento` enum('geral','np4552','outro','clientes','em_tratamento','reuniao_agendada','proposta_enviada','proposta_adjudicada','won','renovacoes_pendente','contratos_renovados','contratos_terminados','servicos_isolados','perdido','teste') NOT NULL DEFAULT 'geral';--> statement-breakpoint
ALTER TABLE `outreach_contactos` ADD `numColaboradores` int;--> statement-breakpoint
ALTER TABLE `outreach_contactos` ADD `motivoPerda` varchar(255);