'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Wand2 } from 'lucide-react'
import Image from 'next/image'

export default function ImageEnhancement() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setSelectedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleEnhanceImage = () => {
    // Simulating image enhancement process
    // In a real application, you would send the image and prompt to your backend
    // and receive the enhanced image from DALL-E 3
    setTimeout(() => {
      setEnhancedImage('/placeholder.svg?height=300&width=400')
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Image Enhancement
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
            {selectedImage && (
              <div className="mt-4 relative h-[300px] w-full">
                <Image 
                  src={selectedImage} 
                  alt="Selected" 
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Enhance Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe the new background (e.g., 'A luxury car showroom with modern decor and soft lighting')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
            />
            <Button 
              onClick={handleEnhanceImage} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
              disabled={!selectedImage || !prompt}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Enhance Image
            </Button>
            {enhancedImage && (
              <div className="mt-4 relative h-[300px] w-full">
                <Image 
                  src={enhancedImage} 
                  alt="Enhanced" 
                  fill
                  className="rounded-lg object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}