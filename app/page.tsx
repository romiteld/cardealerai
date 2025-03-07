'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Image as ImageIcon, MessageSquare, Palette, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
          {/* Hero Background - Add a nice gradient or image here */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/90 z-0"></div>
          
          {/* Content */}
          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center">
              <motion.h1 
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Transform Your Dealership with AI
              </motion.h1>
              <motion.p 
                className="mx-auto max-w-[700px] text-gray-300 md:text-xl dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Enhance your vehicle images, create engaging social media content, and generate professional descriptions - all powered by AI.
              </motion.p>
              <motion.div 
                className="space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link 
                  href="/sign-up" 
                  className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-sm font-medium text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                >
                  Get Started
                </Link>
                <Link 
                  href="/sign-in" 
                  className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-gray-800 to-gray-900 px-8 text-sm font-medium text-white shadow-lg shadow-gray-900/30 transition-all hover:scale-105 hover:shadow-gray-900/40 border border-gray-700 hover:border-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-600"
                >
                  Sign In
                </Link>
              </motion.div>
              
              {/* Demo Image */}
              <motion.div
                className="w-full max-w-3xl mx-auto mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="p-4 text-white text-center">
                    <div className="flex items-center justify-center py-12 px-4">
                      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-lg">
                        <h3 className="text-xl font-semibold text-white mb-6">AI-Enhanced Vehicle Images</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-full h-32 bg-gray-700 rounded-md mb-2 flex items-center justify-center text-gray-400 text-xs">
                              Original Image
                            </div>
                            <span className="text-gray-400 text-xs">Before</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-full h-32 bg-purple-900/30 rounded-md mb-2 flex items-center justify-center text-purple-400 text-xs">
                              Enhanced Image
                            </div>
                            <span className="text-gray-400 text-xs">After</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div 
              className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div 
                className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="p-3 rounded-full bg-purple-600/10">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Image Enhancement</h3>
                <p className="text-gray-400 text-center">Professional-grade AI image enhancement with background removal and replacement.</p>
              </motion.div>

              <motion.div 
                className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="p-3 rounded-full bg-pink-600/10">
                  <MessageSquare className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Content Assistant</h3>
                <p className="text-gray-400 text-center">AI-powered content generation for vehicle descriptions and marketing copy.</p>
              </motion.div>

              <motion.div 
                className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="p-3 rounded-full bg-purple-600/10">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Social Media</h3>
                <p className="text-gray-400 text-center">Engaging social media content creation with AI-optimized visuals and captions.</p>
              </motion.div>

              <motion.div 
                className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg hover:scale-105 transition-transform"
                whileHover={{ y: -5 }}
              >
                <div className="p-3 rounded-full bg-pink-600/10">
                  <Palette className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Branding</h3>
                <p className="text-gray-400 text-center">Consistent brand identity across all your dealership's digital presence.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Ready to Transform Your Dealership?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl">
                  Join the future of automotive retail with our AI-powered solutions.
                </p>
              </motion.div>
              <motion.div 
                className="flex flex-col gap-2 min-[400px]:flex-row justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-medium text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-105 hover:shadow-purple-600/40"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}