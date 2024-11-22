'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
            Transform Your Dealership with AI
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Enhance your vehicle images, create engaging social media content, and generate professional descriptions - all powered by AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </motion.div>

        {/* Feature Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'AI Image Enhancement',
              description: 'Automatically enhance vehicle photos with professional-grade quality.'
            },
            {
              title: 'Social Media Management',
              description: 'Create and schedule engaging social media content with AI assistance.'
            },
            {
              title: 'Content Generation',
              description: 'Generate compelling vehicle descriptions and marketing copy instantly.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className="p-6 bg-gray-800 rounded-lg"
            >
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}