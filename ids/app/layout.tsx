import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import {ThemeProvider} from "@/components/theme-provider";
import {Navbar} from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";
import {Footer} from "@/components/ui/footer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vZME IDS",
  description: "Virtual Information Display System (vIDS) made for the virtual Memphis ARTCC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <Navbar />
          {children}
          <Footer />

      </ThemeProvider>
      <Toaster position="top-right" richColors/>
      </body>
    </html>
  );
}

