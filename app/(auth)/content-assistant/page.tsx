'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Copy } from 'lucide-react'

export default function AIContentAssistant() {
  const [vehicleType, setVehicleType] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setGeneratedContent(`Here's a compelling description for your ${vehicleType}:

${prompt}

This stunning vehicle combines power and elegance, featuring cutting-edge technology and unparalleled comfort. With its sleek design and impressive performance, this ${vehicleType} is sure to turn heads and provide an unforgettable driving experience.`)
      setIsLoading(false)
    }, 2000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        AI Content Assistant
      </h1>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Generate Vehicle Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setVehicleType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="sports-car">Sports Car</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Enter details about the vehicle (year, make, model, features, etc.)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
          />
          <Button 
            onClick={handleGenerate} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
            disabled={isLoading || !vehicleType || !prompt}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Generate Content
          </Button>
        </CardContent>
      </Card>
      {generatedContent && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedContent}
              readOnly
              className="min-h-[200px] bg-gray-700 border-gray-600 text-white"
            />
            <Button 
              onClick={handleCopy}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}