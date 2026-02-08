'use client';

import { motion } from 'framer-motion';
import { Users, DollarSign, Target, Star } from 'lucide-react';

const stats = [
  { number: '50K+', label: 'Active Creators', icon: Users },
  { number: '$2.5M+', label: 'Paid Out', icon: DollarSign },
  { number: '15K+', label: 'Daily Gigs', icon: Target },
  { number: '4.9★', label: 'Platform Rating', icon: Star }
];

export function StatsBar() {
  return (
    <section className="py-16 relative z-10 flex justify-center px-6">
      <div className="w-full max-w-[1400px] bg-gradient-to-b from-[#8fb622] to-[#7a9e1d] rounded-3xl px-8 py-12 shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-2">{stat.number}</div>
                <div className="text-white/90 font-semibold">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
