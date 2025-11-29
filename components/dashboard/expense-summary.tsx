"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatCurrency, formatCurrencyWithoutSymbol } from "@/lib/utils"

interface ExpenseSummaryProps {
  expenses: any[]
}

interface CurrencySummary {
  currency: string
  total: number
  count: number
  average: number
}

// Animated Number Component for Summary
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

// Animated Currency Component for Summary
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
    'PKR': '₨',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  }

  const symbol = currencySymbols[currency] || currency

  return <span>{symbol} {formatCurrency(displayValue)}</span>
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  // Calculate totals by currency
  const currencySummaries: { [key: string]: CurrencySummary } = {}

  expenses.forEach(expense => {
    const currency = expense.currency || 'PKR'
    
    if (!currencySummaries[currency]) {
      currencySummaries[currency] = {
        currency,
        total: 0,
        count: 0,
        average: 0
      }
    }
    
    currencySummaries[currency].total += expense.amount
    currencySummaries[currency].count += 1
  })

  // Calculate averages
  Object.keys(currencySummaries).forEach(currency => {
    const summary = currencySummaries[currency]
    summary.average = summary.count > 0 ? summary.total / summary.count : 0
  })

  const summaries = Object.values(currencySummaries)

  if (summaries.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Expenses</p>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">₨ 0</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Number of Expenses</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Average Expense</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">₨ 0</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Expenses</p>
          <div className="space-y-1">
            {summaries.map((summary, index) => (
              <motion.p 
                key={`total-${summary.currency}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-2xl font-bold text-cyan-600 dark:text-cyan-400"
              >
                <AnimatedCurrency 
                  value={Math.round(summary.total / 100)} 
                  currency={summary.currency} 
                  duration={2}
                />
              </motion.p>
            ))}
          </div>
        </motion.div>

        {/* Number of Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Number of Expenses</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            <AnimatedNumber value={expenses.length} duration={1.5} />
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
            {summaries.map(summary => (
              <div key={`count-${summary.currency}`} className="flex justify-between">
                <span>{summary.currency}:</span>
                <span>{summary.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Average Expense */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 space-y-2 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Average Expense</p>
          <div className="space-y-1">
            {summaries.map((summary, index) => (
              <motion.p 
                key={`average-${summary.currency}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-xl font-bold text-purple-600 dark:text-purple-400"
              >
                <AnimatedCurrency 
                  value={Math.round(summary.average / 100)} 
                  currency={summary.currency} 
                  duration={2}
                />
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Currency Breakdown */}
      {summaries.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Currency Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaries.map((summary, index) => (
              <motion.div 
                key={`breakdown-${summary.currency}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                  <AnimatedCurrency 
                    value={Math.round(summary.total / 100)} 
                    currency={summary.currency} 
                    duration={2}
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {summary.currency} • {summary.count} expenses
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Avg: {formatCurrency(summary.average, summary.currency)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}