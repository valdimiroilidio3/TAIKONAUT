import { NextResponse } from "next/server";
import { db } from "@/db";
import { communitySubscribers } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const subscribers = await db
      .select()
      .from(communitySubscribers)
      .orderBy(desc(communitySubscribers.createdAt))
      .limit(25);
    return NextResponse.json({ ok: true, subscribers });
  } catch {
    return NextResponse.json({ ok: true, subscribers: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name = "",
      email = "",
      whatsapp = "",
      language = "pt",
    } = body as {
      name?: string;
      email?: string;
      whatsapp?: string;
      language?: string;
    };

    if (!email?.trim() && !whatsapp?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            language === "en"
              ? "Enter an email or WhatsApp number to join."
              : "Insere o teu email ou WhatsApp para entrar na órbita.",
        },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(communitySubscribers)
      .values({
        name: name?.trim() || null,
        email: email?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        language,
      })
      .returning();

    return NextResponse.json({ ok: true, subscriber: created });
  } catch (error) {
    console.error("Error saving community subscriber:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao registar subscrição." },
      { status: 500 }
    );
  }
}
