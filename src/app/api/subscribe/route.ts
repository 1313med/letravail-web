import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const citySlug = body.citySlug ? String(body.citySlug) : null;
    const sectorSlug = body.sectorSlug ? String(body.sectorSlug) : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    await prisma.subscriber.upsert({
      where: { email },
      create: { email, citySlug, sectorSlug, source: "alert_signup" },
      update: { citySlug: citySlug ?? undefined, sectorSlug: sectorSlug ?? undefined },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
