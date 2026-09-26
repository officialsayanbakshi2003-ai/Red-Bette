import { ImageResponse } from "next/og";

export const alt = "Red Betta. Flow your way.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(circle at 78% 45%, #7a0a0e 0%, #0a0a0b 55%)",
          color: "#efede8",
        }}
      >
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, fontStyle: "italic", color: "#e3141b", letterSpacing: -4 }}>
          RED
        </div>
        <div style={{ display: "flex", fontSize: 44, letterSpacing: 28, marginTop: 4 }}>BETTA</div>
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 10, marginTop: 56, color: "#a1a1aa" }}>FLOW YOUR WAY.</div>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, marginTop: 18, color: "#6e6e76" }}>
          FROM THE HOUSE OF RETAILJINNY
        </div>
      </div>
    ),
    size,
  );
}
