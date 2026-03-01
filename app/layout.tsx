import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: {
    default: "SportsChatPlus",
    template: "%s | SportsChatPlus",
  },
  description:
    "Real-time sports scores, AI-powered insights, community chat, and betting odds — all in one dashboard.",
  keywords: ["sports", "scores", "NFL", "NBA", "MLB", "NCAA", "AI insights", "odds"],
  authors: [{ name: "SportsChatPlus" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sportschatplus.com",
    title: "SportsChatPlus",
    description: "Your all-in-one sports intelligence platform.",
    siteName: "SportsChatPlus",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${oswald.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
