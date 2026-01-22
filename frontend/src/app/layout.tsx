import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stock.AI | Advanced Prediction",
  description: "AI-powered stock prediction dashboard using Gradient Boosting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen font-sans bg-[#020617]`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-8 transition-all duration-300 relative z-10">
            {children}
          </main>
          {/* Ambient Background Glow */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
          </div>
        </div>
      </body>
    </html>
  );
}
