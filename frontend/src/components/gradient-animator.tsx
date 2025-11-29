"use client"

import { useEffect } from "react"

// Function to generate and set random values
function setRandomGradientValues() {
  const random = (min: number, max: number) => Math.random() * (max - min) + min
  
  // Random movement values - more variation
  const moveX1 = random(-18, 18)
  const moveY1 = random(-18, 18)
  const moveX2 = random(-15, 15)
  const moveY2 = random(-15, 15)
  const moveX3 = random(-10, 10)
  const moveY3 = random(-10, 10)
  const moveX4 = random(-4, 4)
  const moveY4 = random(-4, 4)
  const moveX5 = random(-18, 18)
  const moveY5 = random(-18, 18)
  const moveX6 = random(-15, 15)
  const moveY6 = random(-15, 15)
  const moveX7 = random(-10, 10)
  const moveY7 = random(-10, 10)
  const moveX8 = random(-5, 5)
  const moveY8 = random(-5, 5)
  
  // Random rotation values - more variation
  const rotate1 = random(-10, 10)
  const rotate2 = random(-8, 8)
  const rotate3 = random(-5, 5)
  const rotate4 = random(-2, 2)
  const rotate5 = random(-10, 10)
  const rotate6 = random(-8, 8)
  const rotate7 = random(-5, 5)
  const rotate8 = random(-2, 2)
  
  // Random hue rotation values - more variation
  const hue1 = random(-50, 50)
  const hue2 = random(-40, 40)
  const hue3 = random(-25, 25)
  const hue4 = random(-12, 12)
  const hue5 = random(-50, 50)
  const hue6 = random(-40, 40)
  const hue7 = random(-25, 25)
  const hue8 = random(-12, 12)
  
  // Set CSS variables on document root
  const root = document.documentElement
  root.style.setProperty('--move-x-1', `${moveX1.toFixed(2)}%`)
  root.style.setProperty('--move-y-1', `${moveY1.toFixed(2)}%`)
  root.style.setProperty('--move-x-2', `${moveX2.toFixed(2)}%`)
  root.style.setProperty('--move-y-2', `${moveY2.toFixed(2)}%`)
  root.style.setProperty('--move-x-3', `${moveX3.toFixed(2)}%`)
  root.style.setProperty('--move-y-3', `${moveY3.toFixed(2)}%`)
  root.style.setProperty('--move-x-4', `${moveX4.toFixed(2)}%`)
  root.style.setProperty('--move-y-4', `${moveY4.toFixed(2)}%`)
  root.style.setProperty('--move-x-5', `${moveX5.toFixed(2)}%`)
  root.style.setProperty('--move-y-5', `${moveY5.toFixed(2)}%`)
  root.style.setProperty('--move-x-6', `${moveX6.toFixed(2)}%`)
  root.style.setProperty('--move-y-6', `${moveY6.toFixed(2)}%`)
  root.style.setProperty('--move-x-7', `${moveX7.toFixed(2)}%`)
  root.style.setProperty('--move-y-7', `${moveY7.toFixed(2)}%`)
  root.style.setProperty('--move-x-8', `${moveX8.toFixed(2)}%`)
  root.style.setProperty('--move-y-8', `${moveY8.toFixed(2)}%`)
  
  root.style.setProperty('--rotate-1', `${rotate1.toFixed(2)}deg`)
  root.style.setProperty('--rotate-2', `${rotate2.toFixed(2)}deg`)
  root.style.setProperty('--rotate-3', `${rotate3.toFixed(2)}deg`)
  root.style.setProperty('--rotate-4', `${rotate4.toFixed(2)}deg`)
  root.style.setProperty('--rotate-5', `${rotate5.toFixed(2)}deg`)
  root.style.setProperty('--rotate-6', `${rotate6.toFixed(2)}deg`)
  root.style.setProperty('--rotate-7', `${rotate7.toFixed(2)}deg`)
  root.style.setProperty('--rotate-8', `${rotate8.toFixed(2)}deg`)
  
  root.style.setProperty('--hue-1', `${hue1.toFixed(2)}deg`)
  root.style.setProperty('--hue-2', `${hue2.toFixed(2)}deg`)
  root.style.setProperty('--hue-3', `${hue3.toFixed(2)}deg`)
  root.style.setProperty('--hue-4', `${hue4.toFixed(2)}deg`)
  root.style.setProperty('--hue-5', `${hue5.toFixed(2)}deg`)
  root.style.setProperty('--hue-6', `${hue6.toFixed(2)}deg`)
  root.style.setProperty('--hue-7', `${hue7.toFixed(2)}deg`)
  root.style.setProperty('--hue-8', `${hue8.toFixed(2)}deg`)
}

export function GradientAnimator() {
  useEffect(() => {
    // Set random values on mount
    setRandomGradientValues()
  }, [])
  
  return null
}

// Set random values immediately if running in browser
if (typeof window !== 'undefined') {
  setRandomGradientValues()
}
