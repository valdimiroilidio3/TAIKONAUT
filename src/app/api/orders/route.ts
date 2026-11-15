import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, type OrderItemRecord } from "@/db/schema";
import { SITE_CONFIG, formatPrice, type Currency } from "@/lib/catalog";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(25);
    return NextResponse.json({ ok: true, orders: recentOrders });
  } catch (error) {
    console.error("Failed to load orders:", error);
    return NextResponse.json({ ok: true, orders: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerWhatsapp,
      deliveryMethod = "popup_pickup",
      deliveryAddress = "",
      paymentMethod = "mpesa",
      currency = "EUR",
      items = [],
      notes = "",
    } = body as {
      customerName: string;
      customerEmail: string;
      customerWhatsapp: string;
      deliveryMethod: string;
      deliveryAddress?: string;
      paymentMethod: string;
      currency: Currency;
      items: OrderItemRecord[];
      notes?: string;
    };

    if (!customerName?.trim() || !customerWhatsapp?.trim() || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Preenche o nome, WhatsApp e adiciona pelo menos 1 artigo." },
        { status: 400 }
      );
    }

    const subtotalEur = items.reduce(
      (sum, item) => sum + Number(item.unitPriceEur) * Number(item.quantity),
      0
    );

    let shippingEur = 0;
    if (deliveryMethod === "popup_pickup") {
      shippingEur = 0;
    } else if (subtotalEur >= SITE_CONFIG.store.freeShippingThresholdEur) {
      shippingEur = 0;
    } else if (deliveryMethod === "maputo_express") {
      shippingEur = SITE_CONFIG.store.maputoShippingEur;
    } else {
      shippingEur = SITE_CONFIG.store.internationalShippingEur;
    }

    const totalEur = subtotalEur + shippingEur;
    const rate = SITE_CONFIG.store.eurToMznRate;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const prefix = deliveryMethod === "popup_pickup" ? "TKN-POPUP" : "TKN-ORD";
    const orderCode = `${prefix}-${randomDigits}`;

    const [created] = await db
      .insert(orders)
      .values({
        orderCode,
        customerName: customerName.trim(),
        customerEmail: (customerEmail || "cliente@taikonautmaputo.com").trim(),
        customerWhatsapp: customerWhatsapp.trim(),
        deliveryMethod,
        deliveryAddress: deliveryAddress?.trim() || null,
        paymentMethod,
        currency,
        exchangeRateMzn: rate.toFixed(2),
        subtotalEur: subtotalEur.toFixed(2),
        shippingEur: shippingEur.toFixed(2),
        totalEur: totalEur.toFixed(2),
        items,
        notes: notes?.trim() || null,
        status: deliveryMethod === "popup_pickup" ? "reserved_for_popup" : "confirmed",
      })
      .returning();

    const deliveryLabelMap: Record<string, string> = {
      popup_pickup: "Reserva & Levanta no Homecoming Pop-Up (12 Dez · Restaurante Spazio)",
      maputo_express: "Entrega Rápida em Maputo (24–48h)",
      international: "Envio Nacional / Internacional DHL",
    };

    const paymentLabelMap: Record<string, string> = {
      mpesa: "M-Pesa",
      emola: "e-Mola",
      cash_popup: "Dinheiro / POS no Pop-Up",
      bank_transfer: "Transferência Bancária (BIM)",
      card: "Cartão / PayPal",
    };

    const lines = items.map(
      (i) =>
        `• ${i.quantity}x ${i.name} [${i.size}] — ${formatPrice(
          i.unitPriceEur * i.quantity,
          currency,
          rate
        )}`
    );

    const whatsappText = [
      `🚀 *NOVO PEDIDO TAIKONAUT MAPUTO*`,
      `Código: *${orderCode}*`,
      ``,
      `👤 Cliente: ${customerName.trim()}`,
      `📱 WhatsApp: ${customerWhatsapp.trim()}`,
      `📍 Entrega: ${deliveryLabelMap[deliveryMethod] || deliveryMethod}`,
      deliveryAddress ? `🏠 Morada: ${deliveryAddress}` : null,
      `💳 Pagamento: ${paymentLabelMap[paymentMethod] || paymentMethod}`,
      ``,
      `🛍️ *Peças:*`,
      ...lines,
      ``,
      `💰 *Total:* ${formatPrice(totalEur, "EUR", rate)} (${formatPrice(
        totalEur,
        "MZN",
        rate
      )})`,
      notes ? `📝 Nota: ${notes}` : null,
      ``,
      `25.9692° S, 32.5732° E · Wear your story.`,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = `https://wa.me/${SITE_CONFIG.store.whatsappNumber}?text=${encodeURIComponent(
      whatsappText
    )}`;

    return NextResponse.json({
      ok: true,
      order: created,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao registar o pedido. Tenta novamente." },
      { status: 500 }
    );
  }
}
