import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    revalidatePath("/", "layout");
    revalidatePath("/emplois");
    revalidatePath("/emploi/[slug]", "page");
    revalidatePath("/emplois/[city]", "page");
    revalidatePath("/entreprise/[slug]", "page");

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
