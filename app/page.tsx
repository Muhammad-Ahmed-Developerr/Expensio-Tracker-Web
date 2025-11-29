"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import LoadingAnimation from "@/components/loading-animation"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        
        if (response.ok) {
          setIsAuthenticated(true)
          router.push("/dashboard")
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading || isAuthenticated === null) {
    return <LoadingAnimation />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="glass max-w-md w-full p-8 text-center space-y-8 backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <img 
              src="/logo.png" 
              alt="Expense Tracker" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
            Expensio Tracker Web
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your finances with ease</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-xl space-y-3 border border-white/30 dark:border-slate-700/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track your daily expenses, categorize spending, and export detailed reports with our intuitive expense tracker.
            </p>
            <div className="flex justify-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
              <span>✓ Secure</span>
              <span>✓ Fast</span>
              <span>✓ Free</span>
            </div>
          </div>

          <Link href="/auth/login" className="block">
            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}