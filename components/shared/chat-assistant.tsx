'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { X, Send, MessageSquare } from 'lucide-react'

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'ai'
    }
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I'm processing your request. This is a placeholder response.",
        sender: 'ai'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 flex justify-between items-center">
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
