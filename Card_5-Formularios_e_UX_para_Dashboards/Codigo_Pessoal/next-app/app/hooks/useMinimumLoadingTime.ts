"use client"

import { useState, useEffect } from "react"

export function useMinimumLoadingTime(isLoading: boolean, minimumTime: number) {
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (!isLoading) {
      timer = setTimeout(() => {
        setShowLoading(false)
      }, minimumTime)
    } else {
      setTimeout(() => setShowLoading(true), 0)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isLoading, minimumTime])

  return showLoading
}
