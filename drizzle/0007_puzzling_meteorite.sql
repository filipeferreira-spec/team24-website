ALTER TABLE `crm_empresas` ADD `motivoPerda` varchar(500);--> statement-breakpoint
ALTER TABLE `crm_prospecting` ADD `fonte` varchar(50) DEFAULT 'linkedin_agente' NOT NULL;