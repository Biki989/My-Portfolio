import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = (process.env.SITE_URL ?? "https://biki-portfolio.vercel.app").replace(/\/$/, "");

// ─── Default site-wide SEO ───
// The public portfolio overrides title/description at request time via
// generateMetadata() in src/app/page.tsx (using DB-stored values).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Biki Kalita — ML Engineer & Software Engineer | Machine Learning, Data Science",
    template: "%s · Biki Kalita",
  },
  description:
    "Biki Kalita is an ML Engineer and Software Engineer specializing in machine learning, data science, predictive modeling, and production-ready ML APIs. Available for select ML and software engineering work.",
  keywords: [
    // Primary role keywords
    "ML Engineer",
    "Machine Learning Engineer",
    "Software Engineer",
    "Data Scientist",
    // Skill keywords
    "Machine Learning",
    "Data Science",
    "Predictive Modeling",
    "Regression",
    "Classification",
    "XGBoost",
    "Scikit-learn",
    "Feature Engineering",
    "EDA",
    "Exploratory Data Analysis",
    // Stack keywords
    "Python",
    "FastAPI",
    "Flask",
    "REST APIs",
    "Backend",
    "Docker",
    "Pandas",
    "NumPy",
    // Domain keywords
    "ML workflows",
    "Inference APIs",
    "Model Deployment",
    "Data Readiness",
    // Location / name
    "Biki Kalita",
    "ML Engineer portfolio",
  ],
  authors: [{ name: "Biki Kalita", url: SITE_URL }],
  creator: "Biki Kalita",
  publisher: "Biki Kalita",
  applicationName: "Biki Kalita — Portfolio",
  category: "Technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Biki Kalita — ML Engineer",
    title: "Biki Kalita — ML Engineer & Software Engineer",
    description:
      "Machine Learning engineer building production-ready ML workflows, predictive models, and inference APIs. Available for select ML and software engineering work.",
    firstName: "Biki",
    lastName: "Kalita",
    username: "Biki989",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Biki Kalita — ML Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Biki Kalita — ML Engineer & Software Engineer",
    description:
      "Machine Learning engineer building production-ready ML workflows, predictive models, and inference APIs.",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F2F3F5",
  width: "device-width",
  initialScale: 1,
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
