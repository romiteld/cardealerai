'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { CalendarIcon, Clock, Facebook, Instagram, Twitter } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import Image from 'next/image'

export default function SocialMediaPosting() {
  const [date, setDate] = useState<Date>()
  const [platform, setPlatform] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSchedule = () => {
    console.log('Scheduled post:', { date, platform, content, image })
    // Here you would typically send this data to your backend
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Social Media Posting
      </h1>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-0 rounded-lg overflow-hidden shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Schedule a Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-[240px] justify-start text-left font-normal ${
                    !date && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                />
              </PopoverContent>
            </Popover>
            <Input type="time" className="flex-1" />
          </div>
          <Select onValueChange={setPlatform}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facebook">
                <div className="flex items-center">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </div>
              </SelectItem>
              <SelectItem value="instagram">
                <div className="flex items-center">
                  <Instagram className="mr-2 h-4 w-4" />
                  Instagram
                </div>
              </SelectItem>
              <SelectItem value="twitter">
                <div className="flex items-center">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Enter your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
          />
          <div>
            <Input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {image && (
              <Image 
                src={image} 
                alt="Upload preview" 
                className="mt-2 max-w-full h-auto rounded-lg" 
                width={500}
                height={500}
              />
            )}
          </div>
          <Button 
            onClick={handleSchedule} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
          >
            <Clock className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}