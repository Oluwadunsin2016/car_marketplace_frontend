import { serial, varchar } from "drizzle-orm/mysql-core";
import { pgTable } from "drizzle-orm/pg-core";

export const carListing=pgTable('carListing',{
id:serial('id').primaryKey(),
listingtitle: varchar('listingTitle').notNull(),
tagLine: varchar('tagLine'),
originalPrice: varchar('originalPrice'),
sellingPrice: varchar('sellingPrice').notNull(),
category: varchar('category').notNull(),
condition: varchar('condition').notNull(),
type: varchar('type').notNull(),
make: varchar('make').notNull(),
model: varchar('model').notNull(),
year: varchar('year').notNull(),
driveType: varchar('driveType').notNull(),
transmission: varchar('transmission').notNull(),
fuelType: varchar('fuelType').notNull(),
mileage: varchar('mileage').notNull(),
engineSize: varchar('engineSize'),
cylinder: varchar('cylinder'),
color: varchar('color').notNull(),
door: varchar('door').notNull(),
offerType: varchar('offerType'),
vin: varchar('vin'),
listingDescription: varchar('listingDescription').notNull(),
})