import { Geist_Mono, Figtree } from "next/font/google"

import "./globals.css"
import { ThemeProvider, Sidebar, ErrorBoundary } from "@/app/components"
import { Toaster } from "@/app/components/ui/sonner"
import { cn } from "@/app/lib/utils"
import { AuthProvider } from "@/app/contexts"

import { Metadata } from "next"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FastCamp Dashboard",
  description: "Plataforma Administrativa FastCamp",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        figtree.variable
      )}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>
            <div className="flex h-screen w-full bg-secondary">
              <ErrorBoundary>
                <Sidebar />
              </ErrorBoundary>

              <main className="flex h-full flex-1 flex-col overflow-auto p-6 transition-all md:p-10">
                {/* Mobile Header Spacing - Common to all screens */}
                <div className="h-16 shrink-0 md:hidden" />
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
