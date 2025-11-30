"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import DashboardHeader from "@/components/dashboard/header"
import ExpenseSummary from "@/components/dashboard/expense-summary"
import ExpenseList from "@/components/dashboard/expense-list"
import ExportList from "@/components/dashboard/export-list"
import AddExpenseModal from "@/components/dashboard/add-expense-modal"
import DateRangeFilter from "@/components/dashboard/date-range-filter"
import type { Expense } from "@/lib/types"
import { Plus, TrendingUp, Calendar, Download } from "lucide-react"
import LoadingAnimation from "@/components/loading-animation"

interface UserProfile {
  name: string
  userId: string
}

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const increment = end / (duration * 60)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

function AnimatedCurrency({ value, currency = "PKR", duration = 2 }: { value: number; currency?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const increment = end / (duration * 60)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const currencySymbols: { [key: string]: string } = {
    PKR: "₨",
    USD: "$",
    EUR: "€",
    GBP: "£"
  }

  const symbol = currencySymbols[currency] || currency

  return <span>{symbol} {formatCurrency(displayValue)}</span>
}

export default function DashboardPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    averageExpense: 0,
    thisPeriod: 0
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          router.push("/auth/login")
          return
        }
        await fetchProfile()
        fetchExpenses()
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (userProfile) {
      fetchExpenses()
    }
  }, [startDate, endDate, searchQuery, userProfile])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const fetchExpenses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate.toISOString())
      if (endDate) params.append("endDate", endDate.toISOString())
      if (searchQuery) params.append("q", searchQuery)

      const response = await fetch(`/api/expenses?${params}`)

      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])

        const totalAmount = data.expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0)
        const averageExpense = data.expenses.length > 0 ? totalAmount / data.expenses.length : 0

        setStats({
          totalExpenses: data.totalExpenses || data.expenses.length,
          totalAmount,
          averageExpense,
          thisPeriod: data.expenses.length
        })
      } else if (response.status === 401) {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = () => {
    setShowAddModal(false)
    fetchExpenses()
  }

  if (isLoading && expenses.length === 0) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome back, <span className="bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">{userProfile?.name}</span>!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Manage your expenses and track your spending</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedNumber value={stats.totalExpenses} duration={1.5} />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">This Period</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedNumber value={stats.thisPeriod} duration={1.5} />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Active Filters</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(startDate || endDate || searchQuery) ? "Active" : "None"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ExpenseSummary expenses={expenses} />
        </motion.div>

        {/* Filters and Export Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
          <div className="flex items-end">
            <ExportList expenses={expenses} userName={userProfile?.name || "User"} />
          </div>
        </motion.div>

        {/* Expenses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ExpenseList expenses={expenses} isLoading={isLoading} onRefresh={fetchExpenses} />
        </motion.div>

        {/* Floating Add Button */}
        <AnimatePresence>
          {!showAddModal && (
            <motion.button
              onClick={() => setShowAddModal(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-8 right-8 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-2xl transition-all duration-300 shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 backdrop-blur-sm z-40"
              aria-label="Add new expense"
            >
              <Plus className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} onSuccess={handleAddExpense} />}
      </AnimatePresence>
    </div>
  )
}