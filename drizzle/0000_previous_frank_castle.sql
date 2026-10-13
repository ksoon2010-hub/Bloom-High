CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`member_id` text NOT NULL,
	`month` text NOT NULL,
	`name` text NOT NULL,
	`status` text NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
