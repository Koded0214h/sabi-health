"use client";

import { Navigation } from "@/components/navigation";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { UserTable } from "@/components/dashboard/user-table";
import { SymptomTracker } from "@/components/dashboard/symptom-tracker";
import { MapExplorer } from "@/components/dashboard/map-explorer";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Calendar, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/hooks";
import { MockRainToggle } from "@/components/dashboard/mock-rain-toggle";
import { MiniChat } from "@/components/dashboard/mini-chat";

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good Morning");
  const { data: me } = useMe();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17) setGreeting("Good Evening");
  }, []);

  return (
    <main className="min-h-screen bg-muted/20">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <Badge className="bg-emerald-100 text-emerald-800 border-none rounded-full py-1 px-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                 Personal Guardian Active
               </Badge>
               <span className="text-muted-foreground text-sm font-medium flex items-center gap-1">
                 <Calendar className="w-4 h-4" />
                 Feb 22, 2026
               </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              {greeting}, {me?.user?.name || "Member"}
            </h1>
            <p className="text-muted-foreground text-lg">
              Your personalized health companion is monitoring <strong>{me?.user?.lga}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Identity</p>
                 <p className="text-sm font-bold text-emerald-700">{me?.user?.ai_personality || "Mama Health"}</p>
              </div>
              <MockRainToggle />
              <Settings className="h-6 w-6 text-muted-foreground cursor-pointer hover:rotate-90 transition-transform duration-500" />
          </div>
        </div>

        {/* Stats Section */}
        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Left Col: Symptom Tracker */}
           <div className="lg:col-span-1">
              <SymptomTracker />
           </div>

           {/* Right Col: Logs & Profile */}
           <div className="lg:col-span-2 space-y-10">
              <MapExplorer />
              <UserTable />
           </div>
        </div>
      </div>
      
      <MiniChat />
    </main>
  );
}
