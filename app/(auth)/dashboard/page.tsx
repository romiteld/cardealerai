'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Image, Share, PenTool, Zap } from 'lucide-react'
import Link from 'next/link'

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
]

const stats = [
  { title: 'Total Images', value: '1,234', icon: Image },
  { title: 'Social Posts', value: '56', icon: Share },
  { title: 'AI Descriptions', value: '789', icon: PenTool },
  { title: 'Backgrounds Removed', value: '432', icon: Zap },
]

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6 text-white"
    >
      <h1 className="text-4xl font-bold text-white">
        Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-200">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: 'white' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Bar dataKey="value" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/image-enhancement">
                <Image className="mr-2 h-4 w-4" /> Enhance Image
              </Link>
            </Button>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/social-media">
                <Share className="mr-2 h-4 w-4" /> Create Social Post
              </Link>
            </Button>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/content-assistant">
                <PenTool className="mr-2 h-4 w-4" /> Generate Description
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                { action: 'Image enhanced', time: '2 minutes ago' },
                { action: 'Social post created', time: '1 hour ago' },
                { action: 'Description generated', time: '3 hours ago' },
                { action: 'New image uploaded', time: '5 hours ago' },
              ].map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.action}</span>
                  <span className="text-gray-500 text-sm">{item.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}