import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BRAND = "#0B1F3A";
const ACCENT = "#00D4AA";
const MUTED = "#94A3B8";

function ogLayout(title: string, subtitle: string, badge?: string) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: `linear-gradient(135deg, ${BRAND} 0%, #132d52 100%)`,
        padding: "56px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: ACCENT,
          }}
        />
        <span style={{ color: MUTED, fontSize: "28px", fontWeight: 600 }}>
          Letravail.ma
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {badge && (
          <span
            style={{
              color: ACCENT,
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {badge}
          </span>
        )}
        <span
          style={{
            color: "white",
            fontSize: "56px",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "1000px",
          }}
        >
          {title}
        </span>
        <span style={{ color: MUTED, fontSize: "30px", maxWidth: "900px" }}>
          {subtitle}
        </span>
      </div>
      <span style={{ color: MUTED, fontSize: "22px" }}>
        Emploi & salaires au Maroc
      </span>
    </div>
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { searchParams } = req.nextUrl;
  const type = params.type;

  let title = searchParams.get("title") ?? "Letravail.ma";
  let subtitle = searchParams.get("subtitle") ?? "Offres d'emploi au Maroc";
  let badge = searchParams.get("badge") ?? undefined;

  switch (type) {
    case "job":
      badge = badge ?? "Offre d'emploi";
      break;
    case "company":
      badge = badge ?? "Recrutement";
      break;
    case "city":
      badge = badge ?? "Emploi par ville";
      break;
    case "profession":
      badge = badge ?? "Emploi par métier";
      break;
    case "salary":
      badge = badge ?? "Salaire Maroc";
      break;
    default:
      return new Response("Invalid type", { status: 400 });
  }

  title = title.slice(0, 80);
  subtitle = subtitle.slice(0, 120);

  return new ImageResponse(ogLayout(title, subtitle, badge), {
    width: 1200,
    height: 630,
  });
}
