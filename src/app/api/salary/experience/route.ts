import { NextRequest, NextResponse } from "next/server";
import { getSalaryByExperience } from "@/lib/salary-intelligence";

export const dynamic = "force-dynamic";

const VALID_EXPERIENCE = new Set(["junior", "mid", "senior"]);

export async function GET(req: NextRequest) {
  const professionSlug = req.nextUrl.searchParams.get("profession");
  const experience = req.nextUrl.searchParams.get("experience") as
    | "junior"
    | "mid"
    | "senior"
    | null;

  if (!professionSlug || !experience || !VALID_EXPERIENCE.has(experience)) {
    return NextResponse.json(
      { error: "profession and experience (junior|mid|senior) required" },
      { status: 400 }
    );
  }

  const data = await getSalaryByExperience(professionSlug, experience);

  if (data.observationCount === 0) {
    return NextResponse.json(
      { error: "Insufficient observations", professionSlug, experience },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}
