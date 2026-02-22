"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, MapPin, Zap, PhoneCall, Sparkles, Activity, HeartPulse } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
} as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/30 relative overflow-hidden bg-grid-pattern">

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-8 text-left"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Monitoring. Nigeria-First.
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-[5.5rem] font-extrabold tracking-tight text-foreground leading-[1.1]"
            >
              The neighbors <br />
              <span className="text-emerald-600 dark:text-emerald-500 italic font-bold">
                who call before <br /> sickness strikes.
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium"
            >
              We don't just send alerts, we create proactive health guardians that build family safety, serving communities across Nigeria with results that matter.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 text-lg font-bold w-full">
                  Start Protecting Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950 text-lg font-bold transition-all w-full">
                  Explore Dashboard
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="pt-8 flex flex-wrap gap-6 text-sm font-medium text-muted-foreground/70"
            >
              <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" /> 774 LGAs</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" /> Real-time</div>
              <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-400" /> AI Diagnostic</div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-teal-500/20" />
              {/* Fallback pattern while image is missing */}
              <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay opacity-60" />
                <div className="relative z-10 flex flex-col items-center gap-4 text-center p-12">
                   <div className="w-20 h-20 bg-white/90 dark:bg-slate-900/90 rounded-3xl flex items-center justify-center shadow-xl">
                      <HeartPulse className="w-10 h-10 text-emerald-600" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-sm font-bold text-emerald-600 drop-shadow-sm">Nigeria Health Guardian</p>
                      <p className="text-2xl font-bold text-foreground drop-shadow-sm">Protecting Nigerian Communities</p>
                   </div>
                </div>
              </div>
              
              {/* Location Tag Overlay */}
              <div className="absolute bottom-8 left-8 right-8 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Location</p>
                    <p className="text-sm font-bold text-foreground">Ikeja, Lagos, Nigeria 🇳🇬</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-600 uppercase">
                  Active
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Sabi Health?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">We combine local wisdom with global technology to save lives.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-emerald-500" />}
              title="Proactive Protection"
              description="Our system analyzes rainfall and sanitation trends to warn you days before a potential outbreak."
              delay={0.1}
            />
            <FeatureCard 
              icon={<PhoneCall className="w-10 h-10 text-emerald-500" />}
              title="Voice-First Pidgin AI"
              description="Culturally resonant health advice delivered via friendly voice calls in authentic Pidgin English."
              delay={0.2}
            />
            <FeatureCard 
              icon={<MapPin className="w-10 h-10 text-emerald-500" />}
              title="LGA-Specific Insights"
              description="Every alert is hyper-local, giving you advice specific to your immediate neighborhood."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Dashboard Teaser */}
      <section className="py-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-muted/30 rounded-[32px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-16 overflow-hidden border border-emerald-100/50 relative"
        >
          
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-5xl font-bold tracking-tight leading-tight">Monitor your community in real-time.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our live dashboard visualize risk hotspots across Nigeria. 
              Get deeper insights into disease patterns and environmental factors affecting your health.
            </p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="premium" className="h-12 px-8 rounded-xl text-md">
                  Open the Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden border border-emerald-100/50 bg-white/50 dark:bg-slate-900/50 p-1">
             <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-emerald-100/50 shadow-sm"
                  >
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-600">Active Monitoring</p>
                    <p className="text-xl font-bold">Nigeria Health Map</p>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-emerald-500/5 bg-background/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-2">
            <p className="text-2xl font-bold sabi-gradient text-transparent bg-clip-text">Sabi Health</p>
            <p className="text-sm text-muted-foreground">Proactive disease prevention for every Nigerian.</p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Contact Us</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Sabi Health. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="h-full"
    >
      <Card className="h-full border border-emerald-100/50 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 rounded-[24px] overflow-hidden group">
        <CardContent className="p-10 flex flex-col h-full">
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50 transition-colors">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-lg font-normal flex-grow">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

