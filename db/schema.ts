import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const members = sqliteTable('members', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), memberId: text('member_id').notNull(),
 month: text('month').notNull(), name: text('name').notNull(), status: text('status').notNull(), note: text('note').notNull().default(''),
 tenureOverride: integer('tenure_override'),
 hope: text('hope').notNull().default(''),
});
