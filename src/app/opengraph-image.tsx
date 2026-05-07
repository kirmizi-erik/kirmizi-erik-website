import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kırmızı Erik — 360° Kreatif Reklam Ajansı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(220,14,24,0.18), transparent 70%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(107,27,69,0.18), transparent 70%), #0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#DC0E18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            🍑
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>
            Kırmızı Erik
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              color: "rgba(250,250,250,0.6)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            360° Kreatif Reklam Ajansı
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div>Bir fikir,</div>
            <div>dokuz hizmet,</div>
            <div style={{ color: "#DC0E18" }}>sıfır sınır.</div>
          </div>
        </div>

        <div
          style={{
            fontSize: 22,
            color: "rgba(250,250,250,0.6)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Video · Foto · Dijital · Web · App · AI · Grafik · 3D</span>
          <span>kirmizierik.com.tr</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
