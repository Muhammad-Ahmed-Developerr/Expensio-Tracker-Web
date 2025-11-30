"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon, LogOut, User, Settings, Bell, Search, X } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  profileImage?: string
}

export default function DashboardHeader() {
  const router = useRouter()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }

    const fetchNotificationCount = async () => {
      try {
        const savedNotifications = JSON.parse(localStorage.getItem('expenseNotifications') || '[]')
        const readStatus = JSON.parse(localStorage.getItem('notificationReadStatus') || '{}')
        
        const unreadCount = savedNotifications.filter((notification: any) => !readStatus[notification.id]).length
        setUnreadNotifications(unreadCount)
      } catch (error) {
        console.error("Failed to fetch notification count:", error)
      }
    }

    fetchProfile()
    fetchNotificationCount()
    
    const interval = setInterval(fetchNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu &&
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout failed:", error)
      router.push("/auth/login")
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const closeMenu = () => {
    setShowMenu(false)
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  if (!mounted) {
    return (
      <header className="glass sticky top-0 z-40 backdrop-blur-xl bg-white/5 dark:bg-slate-900/5 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="w-32 h-8 bg-slate-300 dark:bg-slate-700 rounded-xl animate-pulse"></div>
          <div className="w-10 h-10 rounded-xl bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="glass sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25"
          >
            <img 
              src="/logo.png" 
              alt="Expense Tracker" 
              className="w-8 h-8 object-contain"
            />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
              Expensio Tracker Web
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">Manage your finances with ease</p>
          </div>
        </motion.div>

        {/* Search Bar - Hidden on mobile */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-1 max-w-md mx-8"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </motion.div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 backdrop-blur-sm"
            aria-label="Toggle theme"
          >
            {currentTheme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            onClick={() => router.push("/notifications")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 backdrop-blur-sm relative"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </motion.button>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              ref={buttonRef}
              onClick={toggleMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              {profile?.profileImage ? (
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-cyan-500/50 shadow-lg"
                />
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                >
                  {profile?.name?.charAt(0) || "U"}
                </motion.div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{profile?.email}</p>
              </div>
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-64 glass rounded-2xl py-3 shadow-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl z-50"
                >
                  {/* Header with close button */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{profile?.email}</p>
                    </div>
                    <motion.button
                      onClick={closeMenu}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                      aria-label="Close menu"
                    >
                      <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </motion.button>
                  </div>
                  
                  <motion.a
                    href="/profile"
                    onClick={closeMenu}
                    whileHover={{ backgroundColor: "rgba(6,182,212,0.1)" }}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </motion.a>
                  
                  <motion.a
                    href="/settings"
                    onClick={closeMenu}
                    whileHover={{ backgroundColor: "rgba(6,182,212,0.1)" }}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    App Settings
                  </motion.a>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                  
                  <motion.button
                    onClick={() => {
                      closeMenu()
                      handleLogout()
                    }}
                    whileHover={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
          />
        </div>
      </div>
    </header>
  )
}