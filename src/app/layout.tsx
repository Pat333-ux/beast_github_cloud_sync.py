import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BEAST System 3.0 | Digital Constitution Engine",
  description:
    "Autonomous governance, resource allocation, and digital civic infrastructure for New World Order Private Government DAO LLC.",
  keywords: [
    "BEAST System",
    "Digital Constitution Engine",
    "LUCR Token",
    "DAO Governance",
    "Pat Tarwater Jr",
    "Cloud Run",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white`}
      >
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
