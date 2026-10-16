// app/layout.js
import "./globals.css";

export const metadata = {
  title: "TerraTrace | Agricultural Life Cycle Carbon & Telemetry Platform",
  description: "Real-time crop carbon footprint intelligence from soil cultivation to cold-chain transport, packaging, and retail. Powered by IoT telemetry and Life Cycle Assessment (LCA).",
  keywords: ["agricultural carbon footprint", "tomato LCA", "cold chain emissions", "crop lifecycle CO2", "real-time telemetry", "ESG report"],
  authors: [{ name: "TerraTrace Agronomy Labs" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
