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
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[100px] rounded-full" 
        />
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-10"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="success" className="py-2.5 px-5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse" />
              AI-Powered Health Guardian for Nigeria
            </Badge>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold tracking-tight text-foreground max-w-5xl leading-[1.05]"
          >
            The neighbors who call <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              before sickness strikes.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-light"
          >
            Sabi Health protects your family with predictive AI. We monitor environment risks 
            and send proactive voice alerts in Pidgin that everyone understands.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-5 pt-4"
          >
            <Link href="/register">
              <Button size="lg" variant="premium" className="h-14 px-8 rounded-2xl group shadow-xl shadow-emerald-500/20 text-lg">
                Start Protecting Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-2 text-lg hover:bg-muted/50 transition-colors">
                Explore Dashboard
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
          >
            <div className="flex items-center gap-2"><Zap className="w-5 h-5" /> 774 LGAs</div>
            <div className="flex items-center gap-2"><Activity className="w-5 h-5" /> Real-time</div>
            <div className="flex items-center gap-2"><HeartPulse className="w-5 h-5" /> AI Diagnostic</div>
            <div className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Nigeria-First</div>
          </motion.div>
        </motion.div>
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto glass-morphism rounded-[48px] p-8 md:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden border-white/10 relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="flex-1 space-y-8 relative z-10">
            <h2 className="text-5xl font-bold tracking-tight leading-tight">Monitor your community in real-time.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our live dashboard visualize risk hotspots across Nigeria. 
              Get deeper insights into disease patterns and environmental factors affecting your health.
            </p>
            <div className="pt-4">
              <Link href="/dashboard">
                <Button variant="premium" className="h-14 px-10 rounded-2xl text-lg shadow-xl shadow-emerald-500/10">
                  Open the Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 relative w-full aspect-[4/3] lg:aspect-square rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/90 to-teal-500/90 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <div className="text-white flex flex-col items-center gap-6 text-center p-10">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
                  >
                    <Activity className="w-10 h-10" />
                  </motion.div>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0 py-1 px-3">Active Monitoring</Badge>
                    <p className="text-3xl font-bold">Nigeria Health Map</p>
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
      <Card className="h-full border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-[32px] overflow-hidden group">
        <CardContent className="p-10 flex flex-col h-full">
          <div className="mb-8 p-6 bg-emerald-500/5 w-24 h-24 rounded-3xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors border border-emerald-500/10">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-muted-foreground leading-relaxed text-lg font-light flex-grow">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

