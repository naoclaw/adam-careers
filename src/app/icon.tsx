import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          color: "#fff",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -1.4,
          borderRadius: 7,
        }}
      >
        a
        <span style={{ fontSize: 22, lineHeight: 0.6, marginLeft: -2 }}>.</span>
      </div>
    ),
    size,
  );
}
