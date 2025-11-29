"use client"

import { useState } from "react"

interface DateRangeFilterProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchQuery,
  onSearchChange,
}: DateRangeFilterProps) {
  const [filterMode, setFilterMode] = useState<"all" | "today" | "month" | "year" | "custom">("all")

  const setDateRange = (mode: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (mode) {
      case "today":
        onStartDateChange(today)
        onEndDateChange(today)
        break
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)
        onStartDateChange(monthStart)
        onEndDateChange(monthEnd)
        break
      case "year":
        const yearStart = new Date(today.getFullYear(), 0, 1)
        const yearEnd = new Date(today.getFullYear(), 11, 31)
        yearEnd.setHours(23, 59, 59, 999)
        onStartDateChange(yearStart)
        onEndDateChange(yearEnd)
        break
      default:
        onStartDateChange(null)
        onEndDateChange(null)
    }
    setFilterMode(mode as any)
  }

  return (
    <div className="glass p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
        />
      </div>

      {/* Date Range Presets */}
      <div className="flex flex-wrap gap-2">
        {[
          { mode: "all", label: "All" },
          { mode: "today", label: "Today" },
          { mode: "month", label: "This Month" },
          { mode: "year", label: "This Year" },
          { mode: "custom", label: "Custom" }
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setDateRange(mode)}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm ${
              filterMode === mode
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {filterMode === "custom" && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate?.toISOString().split("T")[0] || ""}
              onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              value={endDate?.toISOString().split("T")[0] || ""}
              onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}