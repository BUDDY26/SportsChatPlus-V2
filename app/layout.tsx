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
    "AI-powered sports analytics, real-time scores, odds, and community discussion across professional and NCAA leagues.",
  keywords: ["sports", "scores", "NFL", "NBA", "MLB", "NCAA", "AI insights", "odds"],
  authors: [{ name: "SportsChatPlus" }],
  icons: {
    icon: [{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sportschatplus.com",
    title: "SportsChatPlus",
    description:
      "AI-powered sports analytics, real-time scores, odds, and community discussion across professional and NCAA leagues.",
    siteName: "SportsChatPlus",
    images: [{ url: "/images/logo.png", width: 1792, height: 1024, alt: "SportsChatPlus" }],
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
