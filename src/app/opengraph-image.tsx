import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Changing Room — virtual try-on, free demo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
        color: "#FFFFFF",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: "#D4AF37",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMTExMTExIj48cGF0aCBkPSJNMTIgMmwyLjkgNi4yNiA2LjYuNzItNC45MyA0LjUxIDEuMzYgNi41MUwxMiAxNi45IDYuMDcgMjBsMS4zNi02LjUxTDIuNSA4Ljk4bDYuNi0uNzJ6Ii8+PC9zdmc+"
            }
            alt=""
            width={32}
            height={32}
          />
        </div>
        <div style={{ fontSize: 40, fontWeight: 700 }}>AI Changing Room</div>
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        See it on you,
        <br />
        before you buy.
      </div>
      <div style={{ fontSize: 28, marginTop: 24, color: "#D4AF37" }}>
        Upload a photo · Pick a garment · AI dresses you in seconds
      </div>
    </div>,
    size
  );
}
