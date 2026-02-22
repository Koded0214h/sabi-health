"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLogSymptoms } from "@/lib/hooks";
import { Thermometer, Wind, Brain, Battery, Send, Loader2, Droplets, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ExternalLink, MapPin, ShieldAlert, X } from "lucide-react";

const HospitalMap = dynamic(() => import("./hospital-map"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground">Loading map...</div>
});

export function SymptomTracker() {
  const logSymptoms = useLogSymptoms();
  const [formData, setFormData] = useState({
    fever: 0,
    cough: 0,
    headache: 0,
    fatigue: 0,
    diarrhea: 0,
    vomiting: 0,
    notes: ""
  });
  const [hospital, setHospital] = useState<any>(null);
  const [userCoords, setUserCoords] = useState<{lat?: number, lon?: number}>({});

  const toggleSymptom = (key: keyof typeof formData) => {
    if (key === "notes") return;
    setFormData(prev => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logSymptoms.mutate(formData, {
      onSuccess: (res: any) => {
        if (res.data.hospital) {
          setHospital(res.data.hospital);
          if (res.data.lat && res.data.lon) {
            setUserCoords({ lat: res.data.lat, lon: res.data.lon });
          }
        } else {
          setFormData({ fever: 0, cough: 0, headache: 0, fatigue: 0, diarrhea: 0, vomiting: 0, notes: "" });
        }
      }
    });
  };

  const symptoms = [
    { id: "fever", label: "Fever", icon: Thermometer, color: "text-red-500", bg: "bg-red-50" },
    { id: "cough", label: "Cough", icon: Wind, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "headache", label: "Headache", icon: Brain, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "fatigue", label: "Fatigue", icon: Battery, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "diarrhea", label: "Diarrhea", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "vomiting", label: "Vomiting", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <Card className="glass-morphism border-none shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Thermometer className="h-5 w-5 text-primary" />
           </div>
           How are you feeling today?
        </CardTitle>
        <CardDescription>Log your symptoms to help Sabi Guardian protect you better.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {symptoms.map((s) => {
              const Icon = s.icon;
              const isActive = (formData as any)[s.id] === 1;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleSymptom(s.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
                    isActive 
                      ? "border-emerald-500 bg-emerald-50/50 shadow-inner scale-95" 
                      : "border-transparent bg-white/5 hover:bg-white/10"
                  )}
                >
                  <div className={cn("p-3 rounded-xl mb-3", isActive ? s.bg : "bg-muted")}>
                    <Icon className={cn("h-6 w-6", isActive ? s.color : "text-muted-foreground")} />
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Self-Report Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="e.g. Headache started this morning..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-white/5 border-white/10"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-2xl shadow-xl" 
            variant="premium"
            disabled={logSymptoms.isPending || !!hospital}
          >
            {logSymptoms.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Update Health Status
          </Button>
        </form>

        {hospital && (
          <div className="mt-8 pt-8 border-t border-white/10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-500" />
                Sabi Recommendation
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setHospital(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed italic">
                "{hospital.recommendation}"
              </p>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Nearest Health Center
                </span>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-emerald-600 font-bold"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`, "_blank")}
                >
                  Navigate Now <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <HospitalMap 
                lat={hospital.lat} 
                lon={hospital.lon} 
                name={hospital.name} 
                address={hospital.address} 
                userLat={userCoords.lat}
                userLon={userCoords.lon}
              />
              <p className="text-[10px] text-center text-muted-foreground">
                {hospital.name} — {hospital.address}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
