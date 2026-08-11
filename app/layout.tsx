import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prado Fleet | Streamlined Telematics & Fleet Assets",
    template: "%s | Prado Fleet",
  },
  description:
    "The all-in-one fleet operations workspace for managing vehicles, telematics, maintenance, compliance, and team workflows seamlessly.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prado Fleet",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#facc15",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${robotoSans.variable} ${robotoMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
