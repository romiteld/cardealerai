'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: '$29',
    features: [
      '100 AI-enhanced images per month',
      '50 AI-generated descriptions',
      'Basic social media scheduling',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$79',
    features: [
      'Unlimited AI-enhanced images',
      'Unlimited AI-generated descriptions',
      'Advanced social media scheduling',
      'Priority email support',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'All Pro features',
      'Dedicated account manager',
      'Custom AI model training',
      'On-premise deployment options',
      '24/7 phone support',
    ],
  },
]

export default function Subscription() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
        <p className="mt-2 text-gray-400">Select the plan that best fits your needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="relative bg-white/5 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
              <CardDescription className="text-2xl font-bold text-white">
                {plan.price}
                {plan.price !== 'Custom' && <span className="text-sm font-normal text-gray-400">/month</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Get Started
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}