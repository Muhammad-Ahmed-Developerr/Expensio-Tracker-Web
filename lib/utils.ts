import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  const actualAmount = amount / 100

  const isWholeNumber = actualAmount % 1 === 0
  
  let formattedAmount: string
  
  if (isWholeNumber) {
    formattedAmount = actualAmount.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })
  } else {

    formattedAmount = actualAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const currencySymbols: { [key: string]: string } = {
    'PKR': '₨',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED ',
    'SAR': 'SAR ',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$'
  }
  
  const symbol = currencySymbols[currency] || currency
  
  return `${symbol} ${formattedAmount}`
}

export function formatCurrencyWithoutSymbol(amount: number): string {
  const actualAmount = amount / 100
  const isWholeNumber = actualAmount % 1 === 0
  
  if (isWholeNumber) {
    return actualAmount.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })
  } else {
    return actualAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
}

export function getCurrencySymbol(currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'PKR': '₨',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'AED': 'AED',
    'SAR': 'SAR',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$'
  }
  
  return currencySymbols[currency] || currency
}