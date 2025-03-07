'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Save } from 'lucide-react'
import Image from 'next/image'

export default function Branding() {
  const [logo, setLogo] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [slogan, setSlogan] = useState('')

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor)
    document.documentElement.style.setProperty('--secondary-color', secondaryColor)
  }, [primaryColor, secondaryColor])

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setLogo(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    console.log('Saving branding:', { logo, primaryColor, secondaryColor, slogan })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Branding
      </h1>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Customize Your Brand
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-upload" className="block text-sm font-medium text-gray-300 mb-2">Logo</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="logo-upload"
                type="file"
                onChange={handleLogoUpload}
                accept="image/*"
                className="bg-gray-700 border-gray-600 text-white"
              />
              {logo && (
                <div className="relative h-12 w-12">
                  <Image
                    src={logo}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="primary-color" className="block text-sm font-medium text-gray-300 mb-2">Primary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-12 h-12 p-1 bg-gray-700 border-gray-600"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="secondary-color" className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-12 h-12 p-1 bg-gray-700 border-gray-600"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="slogan" className="block text-sm font-medium text-gray-300 mb-2">Slogan</Label>
            <Textarea
              id="slogan"
              placeholder="Enter your dealership's slogan"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
            />
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Branding
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Brand Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="brand-preview">
            <div className="flex items-center space-x-4 mb-4">
              {logo && (
                <div className="relative h-12 w-12">
                  <Image
                    src={logo}
                    alt="Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="dealership-name">Your Dealership Name</h2>
            </div>
            <p className="dealership-slogan">{slogan || "Your slogan here"}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}