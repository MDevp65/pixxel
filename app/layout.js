import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import FloatingShapes from "@/components/custom/FloatingShapes";
import Header from "@/components/custom/Header";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Pixxel",
  description: "AI Image Editor",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple
      }}
    >

      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className}`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>

              <Header />

              <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                <FloatingShapes />
                <Toaster richColors />
                {children}
              </main>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
