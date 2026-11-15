import { NextResponse } from "next/server";
import { db } from "@/db";
import { restockAlerts } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alerts = await db
      .select()
      .from(restockAlerts)
      .orderBy(desc(restockAlerts.createdAt))
      .limit(25);
    return NextResponse.json({ ok: true, alerts });
  } catch {
    return NextResponse.json({ ok: true, alerts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productSlug,
      productName,
      preferredSize = "M",
      email = "",
      whatsapp = "",
      language = "pt",
    } = body as {
      productSlug: string;
      productName: string;
      preferredSize?: string;
      email?: string;
      whatsapp?: string;
      language?: string;
    };

    if (!productSlug || (!email?.trim() && !whatsapp?.trim())) {
      return NextResponse.json(
        {
          ok: false,
          error:
            language === "en"
              ? "Please enter your email or WhatsApp number."
              : "Indica o teu email ou número de WhatsApp.",
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(restockAlerts)
      .values({
        productSlug,
        productName: productName || productSlug,
        preferredSize,
        email: email?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        language,
      })
      .returning();

    return NextResponse.json({ ok: true, alert: created });
  } catch (error) {
    console.error("Error saving restock alert:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao guardar alerta de reposição." },
      { status: 500 }
    );
  }
}
