PRAGMA foreign_keys = OFF;
PRAGMA legacy_alter_table = ON;
--> statement-breakpoint
CREATE TABLE `__new_places` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`summary` text,
	`description` text NOT NULL,
	`isPublic` integer DEFAULT true NOT NULL,
	`link` text NOT NULL,
	`votes` integer DEFAULT 0 NOT NULL,
	`tag` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
INSERT INTO
	`__new_places` (
		"id",
		"user_id",
		"name",
		"image",
		"summary",
		"description",
		"isPublic",
		"link",
		"votes",
		"tag",
		"created_at"
	)
SELECT
	"id",
	"user_id",
	"name",
	"image",
	"summary",
	"description",
	"isPublic",
	"link",
	"votes",
	"tag",
	"created_at"
FROM
	`places`;

--> statement-breakpoint
DROP TABLE `places`;

--> statement-breakpoint
ALTER TABLE `__new_places`
RENAME TO `places`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;