'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

const creatorSteps = [
  {
    number: '01',
    icon: '📝',
    title: 'List Your Services',
    description: 'Create your profile and showcase what you do best',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    benefits: ['Portfolio builder', 'Instant verification', 'SEO optimized'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    number: '02',
    icon: '💰',
    title: 'Get Offers',
    description: 'Brands bid on your services - you pick the best deal',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
    benefits: ['Real-time bidding', 'Smart matching', 'Price transparency'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    number: '03',
    icon: '🎯',
    title: 'Deliver & Earn',
    description: 'Complete work, get paid instantly in Zaryo tokens',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop',
    benefits: ['Instant payouts', 'Secure escrow', 'Build reputation'],
    color: 'from-green-500 to-emerald-500'
  }
];

const brandSteps = [
  {
    number: '01',
    icon: '🔍',
    title: 'Find Creators',
    description: 'Browse thousands of verified content creators',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
    benefits: ['Advanced filters', 'Verified profiles', 'Portfolio reviews'],
    color: 'from-orange-500 to-red-500'
  },
  {
    number: '02',
    icon: '🤝',
    title: 'Place Bids',
    description: 'Make competitive offers on creator services',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop',
    benefits: ['Flexible pricing', 'Negotiate terms', 'Quick responses'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    number: '03',
    icon: '📊',
    title: 'Track Results',
    description: 'Monitor campaigns and measure ROI in real-time',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    benefits: ['Analytics dashboard', 'Performance metrics', 'ROI tracking'],
    color: 'from-teal-500 to-green-500'
  }
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'creators' | 'brands'>('creators');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentSteps = activeTab === 'creators' ? creatorSteps : brandSteps;

  return (
    <section className="py-32 px-6 relative overflow-hidden" id="how-it-works">
      {/* Animated Background with Shapes and Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 -left-40 w-80 h-80 bg-gradient-to-br from-[#A7D129] to-[#95c51f] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 -right-40 w-96 h-96 bg-gradient-to-br from-[#6A7B92] to-[#5a6a7e] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#A7D129] to-[#6A7B92] rounded-full blur-3xl"
        />

        {/* Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {/* Circles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 border-4 border-[#A7D129] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 border-4 border-[#6A7B92] rounded-full"
          />
          
          {/* Squares */}
          <motion.div
            animate={{ rotate: 45, scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 right-1/3 w-48 h-48 border-4 border-[#A7D129] rounded-3xl"
          />
          <motion.div
            animate={{ rotate: -45, scale: [1, 1.2, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/3 w-56 h-56 border-4 border-[#6A7B92] rounded-3xl"
          />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(to right, #6A7B92 1px, transparent 1px),
              linear-gradient(to bottom, #6A7B92 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating Dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#A7D129] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #6A7B92,
              #6A7B92 2px,
              transparent 2px,
              transparent 40px
            )`
          }} />
        </div>

        {/* Glowing Corner Accents */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#A7D129]/30 to-transparent rounded-bl-full"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#6A7B92]/30 to-transparent rounded-tr-full"
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-5 py-2.5 rounded-full mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-[#A7D129]" />
            <span className="text-sm font-bold text-gray-700">3-Step Process</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-black text-gray-900 mb-6">
            How <span className="bg-gradient-to-r from-[#A7D129] to-[#6A7B92] bg-clip-text text-transparent">Zariel</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and built for your success. Get started in minutes.
          </p>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-20"
        >
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-2 gap-2 shadow-2xl border border-gray-200">
            {/* Animated Background Slider */}
            <motion.div
              className={`absolute top-2 h-[calc(100%-1rem)] rounded-2xl ${
                activeTab === 'creators' 
                  ? 'bg-gradient-to-r from-[#A7D129] to-[#95c51f]' 
                  : 'bg-gradient-to-r from-[#6A7B92] to-[#5a6a7e]'
              }`}
              initial={false}
              animate={{
                left: activeTab === 'creators' ? '0.5rem' : '50%',
                width: activeTab === 'creators' ? 'calc(50% - 0.75rem)' : 'calc(50% - 0.75rem)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            <div className="relative flex gap-2">
              <button
                onClick={() => setActiveTab('creators')}
                className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                  activeTab === 'creators'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <span>For Creators</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={`relative px-10 py-5 rounded-2xl font-bold text-lg transition-all ${
                  activeTab === 'brands'
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  <span>For Brands</span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Steps - Modern Card Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {currentSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredIndex(idx)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                {/* Connecting Arrow - Desktop Only */}
                {idx < 2 && (
                  <div className="hidden lg:block absolute top-24 -right-4 z-20">
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 0.3 }}
                      className="w-8 h-8"
                    >
                      <ArrowRight className="w-8 h-8 text-[#A7D129]" strokeWidth={3} />
                    </motion.div>
                  </div>
                )}

                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative h-full"
                >
                  {/* Card */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden border-2 border-gray-200 hover:border-[#A7D129] shadow-xl hover:shadow-2xl transition-all h-full">
                    {/* Gradient Overlay on Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Gradient Overlays */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Step Number - 3D Style */}
                      <div className="absolute top-6 right-6">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-xl opacity-50`} />
                          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-2xl border border-white/50">
                            <span className={`text-3xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                              {step.number}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Large Emoji Icon - Bottom Left */}
                      <div className="absolute bottom-4 left-4">
                        <motion.div
                          animate={hoveredIndex === idx ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="text-7xl drop-shadow-2xl"
                        >
                          {step.icon}
                        </motion.div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-[#A7D129] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Benefits List */}
                      <div className="space-y-3">
                        {step.benefits.map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 + i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3"
                          >
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-3xl`}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >

          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="relative group bg-gradient-to-r from-[#A7D129] via-[#95c51f] to-[#A7D129] hover:from-[#95c51f] hover:via-[#A7D129] hover:to-[#95c51f] text-white font-bold px-12 py-7 rounded-2xl text-xl shadow-2xl overflow-hidden">
                {/* Animated Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'linear'
                  }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  {activeTab === 'creators' ? 'Start as a Creator' : 'Post Your First Gig'}
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </motion.div>
          </Link>
          
          <p className="mt-6 text-gray-500 font-semibold">
            ✨ No credit card required • Get started in 60 seconds
          </p>
        </motion.div>
      </div>
    </section>
  );
}