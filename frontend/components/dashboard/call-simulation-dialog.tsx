"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PhoneIncoming, Volume2, User as UserIcon, Check, X, ShieldAlert } from "lucide-react";

import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CallSimulationDialog({ data, onClose }: { data: any, onClose: () => void }) {
  const [status, setStatus] = useState<"incoming" | "connected" | "completed">("incoming");
  const [audioPlayed, setAudioPlayed] = useState(false);

  const handleAnswer = () => {
    setStatus("connected");
    if (data.audio_url) {
      let audioUrl = data.audio_url;
      // Handle relative paths if any, though backend sends full URLs
      if (audioUrl.startsWith("/audio")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        audioUrl = `${baseUrl}${audioUrl}`;
      }
      
      const audio = new Audio(audioUrl);
      audio.play().then(() => {
        setAudioPlayed(true);
      }).catch(e => {
        console.error("Audio playback failed", e);
        toast.error("AI Voice failed to play. Check your speaker permissions.");
      });
    } else {
      setAudioPlayed(true);
    }
  };

  const submitResponse = async (response: "fever" | "fine") => {
    try {
      await api.post(`/respond/${data.call_id}`, { response });
      toast.success(`Response recorded: ${response}`);
      setStatus("completed");
      setTimeout(onClose, 2000);
    } catch (error) {
      toast.error("Failed to record response");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass-morphism border-none shadow-3xl p-0 overflow-hidden">
        <div className={cn(
          "p-8 flex flex-col items-center text-center space-y-6 transition-all duration-500",
          status === "incoming" ? "bg-emerald-600/10" : "bg-card"
        )}>
          {status === "incoming" && (
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="bg-emerald-500 p-6 rounded-full shadow-2xl relative">
                <PhoneIncoming className="w-10 h-10 text-white" />
              </div>
            </div>
          )}

          {status === "connected" && (
             <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full shadow-inner">
                <Volume2 className="w-10 h-10 text-emerald-600 animate-pulse" />
             </div>
          )}

          {status === "completed" && (
             <div className="bg-emerald-500 p-6 rounded-full shadow-2xl">
                <Check className="w-10 h-10 text-white" />
             </div>
          )}

          <div className="space-y-1">
            <h2 className="text-2xl font-bold">
               {status === "incoming" ? "Incoming Sabi Alert" : 
                status === "connected" ? "Call Connected" : "Alert Recorded"}
            </h2>
            <p className="text-muted-foreground">ID: {data.call_id.substring(0, 8)}</p>
          </div>

          <Card className="w-full bg-white/5 border-white/10 p-4 rounded-2xl">
             <div className="flex items-center gap-3 mb-3">
                <Badge variant="destructive" className="rounded-full">{data.risk} RISK</Badge>
                <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground italic">Powered by Gemini AI</span>
             </div>
             <p className="text-sm italic leading-relaxed text-foreground/90">
               "{data.script}"
             </p>
          </Card>

          {status === "incoming" && (
            <div className="flex gap-4 w-full">
              <Button variant="destructive" className="flex-1 h-14 rounded-2xl" onClick={onClose}>
                <X className="mr-2" /> Decline
              </Button>
              <Button variant="premium" className="flex-1 h-14 rounded-2xl" onClick={handleAnswer}>
                <PhoneIncoming className="mr-2" /> Answer
              </Button>
            </div>
          )}

          {status === "connected" && (
            <div className="space-y-4 w-full">
               <p className="text-sm font-medium">User Response:</p>
               <div className="flex gap-4">
                  <Button variant="destructive" className="flex-1 h-14 rounded-2xl" onClick={() => submitResponse("fever")}>
                    I have Fever
                  </Button>
                  <Button variant="secondary" className="flex-1 h-14 rounded-2xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={() => submitResponse("fine")}>

                    I am Fine
                  </Button>
               </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
