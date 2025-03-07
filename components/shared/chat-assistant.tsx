'use client'

import { useState, useEffect } from 'react'
import { PanelRightOpen, PanelRightClose, SendHorizontal, Bot } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '../ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your CarDealerAI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSendMessage = async () => {
    if (message.trim() === '') return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setLoading(true)

    try {
      // Call API for AI response here
      // For demo purposes, just add a simulated response
      setTimeout(() => {
        const aiResponse: Message = {
          role: 'assistant',
          content: `I received your message: "${userMessage.content}". This is a placeholder response from the AI assistant.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error getting AI response:', error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isAuthenticated ? (
        <>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg p-0"
            aria-label={isOpen ? 'Close chat' : 'Open chat'}
          >
            {isOpen ? (
              <PanelRightClose className="h-6 w-6" />
            ) : (
              <PanelRightOpen className="h-6 w-6" />
            )}
          </Button>

          {isOpen && (
            <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center p-3 bg-purple-600 text-white">
                <Bot className="h-5 w-5 mr-2" />
                <h3 className="font-medium">CarDealerAI Assistant</h3>
              </div>
              
              <div className="h-96 overflow-y-auto p-4 flex flex-col space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {format(msg.timestamp, 'p')}
                    </span>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t dark:border-gray-700">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button
                    type="submit"
                    disabled={loading || message.trim() === ''}
                    className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <Button
          onClick={() => window.location.href = '/sign-in'}
          className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg p-0"
          aria-label="Login to chat"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
