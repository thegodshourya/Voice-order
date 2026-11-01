import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const orders=sqliteTable('orders',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),table:text('table_label').notNull(),
 cart:text('cart').notNull(),total:integer('total').notNull(),status:text('status').notNull().default('Queued'),createdAt:integer('created_at').notNull()
});
