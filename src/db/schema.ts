import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export interface OrderItemRecord {
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceEur: number;
  reserveForPopup?: boolean;
}

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerWhatsapp: text("customer_whatsapp").notNull(),
  deliveryMethod: text("delivery_method").notNull(), // 'popup_pickup' | 'maputo_express' | 'mozambique_national' | 'international'
  deliveryAddress: text("delivery_address"),
  paymentMethod: text("payment_method").notNull(), // 'mpesa' | 'emola' | 'bank_transfer' | 'cash_popup' | 'card'
  currency: text("currency").notNull().default("EUR"),
  exchangeRateMzn: numeric("exchange_rate_mzn", { precision: 10, scale: 2 }).notNull(),
  subtotalEur: numeric("subtotal_eur", { precision: 10, scale: 2 }).notNull(),
  shippingEur: numeric("shipping_eur", { precision: 10, scale: 2 }).notNull(),
  totalEur: numeric("total_eur", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").$type<OrderItemRecord[]>().notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const restockAlerts = pgTable("restock_alerts", {
  id: serial("id").primaryKey(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  preferredSize: text("preferred_size").default("M"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  language: text("language").default("pt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communitySubscribers = pgTable("community_subscribers", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  interest: text("interest").default("drops_and_popup"),
  language: text("language").default("pt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productStockOverrides = pgTable("product_stock_overrides", {
  id: serial("id").primaryKey(),
  productSlug: text("product_slug").notNull().unique(),
  stockCount: integer("stock_count").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
