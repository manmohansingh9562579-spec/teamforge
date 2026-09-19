import type { Metadata } from "next";
import { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamForge — Find people. Build teams. Ship projects.",
  description:
    "TeamForge helps developers, designers and builders find teammates for hackathons, college projects and side projects using transparent, skill-based matching.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <MotionConfig reducedMotion="user">
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </MotionConfig>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
