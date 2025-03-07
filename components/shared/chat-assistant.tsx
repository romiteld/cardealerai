'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs';

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  status?: 'sending' | 'error'
}

interface ChatResponse {
  message: string;
  error?: string;
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
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageTimestamp = useRef<number>(Date.now())

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    // Rate limiting - 1 second between messages
    const now = Date.now()
    if (now - lastMessageTimestamp.current < 1000) {
      return
    }
    lastMessageTimestamp.current = now

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: messages.map(m => ({ text: m.text, sender: m.sender }))
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiResponse: Message = {
        id: messages.length + 2,
        text: data.message,
        sender: 'ai'
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        status: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('Chat error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <ClerkProvider>
        <SignedOut>
          {/* Redirect logic */}
          {/* Redirect logic should be handled at the page level or within a component that is part of the page */}
        </SignedOut>
        <SignedIn>
          <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg z-50"
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
                className="fixed bottom-20 right-4 w-96 h-[600px] bg-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden z-50"
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
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      disabled={isProcessing}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isProcessing || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SignedIn>
      </ClerkProvider>
    </>
  )
}
