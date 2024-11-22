'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Share2, Search } from 'lucide-react'

const images = [
  { id: 1, src: '/placeholder.svg?height=200&width=300', alt: 'Sedan 1', type: 'sedan' },
  { id: 2, src: '/placeholder.svg?height=200&width=300', alt: 'SUV 1', type: 'suv' },
  { id: 3, src: '/placeholder.svg?height=200&width=300', alt: 'Truck 1', type: 'truck' },
  { id: 4, src: '/placeholder.svg?height=200&width=300', alt: 'Sedan 2', type: 'sedan' },
  { id: 5, src: '/placeholder.svg?height=200&width=300', alt: 'SUV 2', type: 'suv' },
  { id: 6, src: '/placeholder.svg?height=200&width=300', alt: 'Truck 2', type: 'truck' },
]

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredImages = images.filter(image => 
    image.alt.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || image.type === filterType)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Image Gallery
      </h1>
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search images..."
            className="pl-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sedan">Sedan</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
              <CardContent className="p-4">
                <img src={image.src} alt={image.alt} className="w-full h-48 object-cover rounded-lg mb-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{image.alt}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}