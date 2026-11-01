CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`table_label` text NOT NULL,
	`cart` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'Queued' NOT NULL,
	`created_at` integer NOT NULL
);
