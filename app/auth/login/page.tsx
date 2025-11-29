"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import LoadingAnimation from "@/components/loading-animation"

declare global {
  interface Window {
    google: any
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          context: "signin",
          ux_mode: "popup",
        })

        const buttonElement = document.getElementById("google-signin-button")
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
          })
        }
      }
    }

    if (!isCheckingAuth) {
      const timer = setTimeout(initializeGoogle, 500)
      return () => clearTimeout(timer)
    }
  }, [isCheckingAuth])

  const handleGoogleSignIn = async (response: any) => {
    if (response.credential) {
      setIsLoading(true)
      setError("")

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        })

        if (res.ok) {
          router.push("/dashboard")
        } else {
          const errorData = await res.json()
          setError(errorData.message || "Sign in failed")
        }
      } catch (err) {
        setError("An error occurred during sign in")
        console.error("Sign in error:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isCheckingAuth) {
    return <LoadingAnimation />
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={() => {
          if (window.google) {
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: handleGoogleSignIn,
            })
          }
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8">
        <div className="glass max-w-md w-full p-8 space-y-8 backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <img 
                src="/logo.png" 
                alt="Expense Tracker" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Sign in to manage your expenses</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-6">
            <div id="google-signin-button" className="w-full flex justify-center"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Secure sign in with Google
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                Privacy Policy
              </a>
            </p>
            
            {isLoading && (
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}