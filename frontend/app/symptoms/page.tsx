"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Clock, FileText, ChevronRight } from "lucide-react";
import { useMe } from "@/lib/hooks";
import { format } from "date-fns";

export default function SymptomsPage() {
  const { data: me, isLoading } = useMe();
  const symptoms = me?.symptoms || [];

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      <Navigation />
      
      <div className="pt-32 px-4 md:px-8 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Your Health History</h1>
            <p className="text-muted-foreground text-lg">
              Detailed breakdown of all symptoms you've reported.
            </p>
          </div>
          <Badge className="w-fit bg-emerald-100 text-emerald-800 border-none rounded-full py-1.5 px-4 text-sm font-medium">
            {symptoms.length} Records Found
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading your health history...</p>
          </div>
        ) : symptoms.length === 0 ? (
          <Card className="border-dashed py-20 dark:bg-slate-900/50">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <HeartPulse className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">No symptoms logged yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Once you start logging your health status, they will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {symptoms.map((symptom) => (
              <Card key={symptom.id} className="overflow-hidden glass-morphism border-white/10 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-foreground/90">
                      {symptom.timestamp ? format(new Date(symptom.timestamp), "PPP p") : "Unknown Date"}
                    </span>
                  </div>
                  <Badge variant="outline" className="rounded-full bg-white/10">Record ID: {symptom.id?.substring(0, 8) || "N/A"}</Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <SymptomBadge label="Fever" active={symptom.fever > 0} />
                    <SymptomBadge label="Cough" active={symptom.cough > 0} />
                    <SymptomBadge label="Headache" active={symptom.headache > 0} />
                    <SymptomBadge label="Fatigue" active={symptom.fatigue > 0} />
                  </div>
                  
                  {symptom.notes && (
                    <div className="bg-muted/30 rounded-2xl p-5 border border-white/5 shadow-inner">
                      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        Patient Notes
                      </div>
                      <p className="text-foreground/80 leading-relaxed italic">
                        "{symptom.notes}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SymptomBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`
      flex items-center justify-between px-5 py-3 rounded-2xl border transition-all duration-300
      ${active 
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold" 
        : "bg-muted/50 border-white/5 text-muted-foreground font-medium opacity-60"}
    `}>
      <span>{label}</span>
      {active ? (
        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
      ) : (
        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      )}
    </div>
  );
}
