"use client";

import { useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CloudRain, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  HeartPulse
} from "lucide-react";
import { useMe, useMessages, usePredictWeekly, useGenerateCulturalTip } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function MessagesPage() {
  const { data: me } = useMe();
  const { data: messages, isLoading } = useMessages(me?.user?.id);
  const predictWeekly = usePredictWeekly();
  const generateTip = useGenerateCulturalTip();

  const handlePredict = () => {
    if (me?.user?.id) {
       predictWeekly.mutate(me.user.id);
    }
  };

  const latestTip = messages?.find(m => m.type === "tip");

  useEffect(() => {
    if (me?.user?.id && messages && !messages.some(m => m.type === "tip")) {
      generateTip.mutate(me.user.id);
    }
  }, [me?.user?.id, messages]);

  const getIcon = (type: string) => {
    switch (type) {
      case "rain": return <CloudRain className="w-5 h-5 text-blue-500" />;
      case "outbreak": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "prediction": return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "tip": return <HeartPulse className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "rain": return "bg-blue-50 border-blue-100";
      case "outbreak": return "bg-red-50 border-red-100";
      case "prediction": return "bg-purple-50 border-purple-100";
      case "tip": return "bg-emerald-50 border-emerald-100";
      default: return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <main className="min-h-screen bg-muted/20 pb-20">
      <Navigation />
      
      <div className="pt-32 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Messages</h1>
            <p className="text-muted-foreground mt-1">Real-time alerts, environmental logs, and AI predictions.</p>
          </div>
          <Button 
            onClick={handlePredict} 
            disabled={predictWeekly.isPending}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
          >
            {predictWeekly.isPending ? "Predicting..." : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Weekly Prediction
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : messages?.length === 0 ? (
            <Card className="border-dashed py-20">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-slate-100 p-4 rounded-full">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">No messages yet</h3>
                  <p className="text-muted-foreground">We'll alert you to outbreaks or environmental risks in {me?.user?.lga || "your area"}.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="relative space-y-4">
              {/* Timeline Connector */}
              <div className="absolute left-[26px] top-4 bottom-4 w-[2px] bg-slate-200" />
              
              {messages?.map((msg) => (
                <div key={msg.id} className="relative pl-14 group">
                  {/* Timeline Node */}
                  <div className={cn(
                    "absolute left-0 top-1 w-[52px] h-[52px] rounded-2xl border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 duration-300",
                    getBg(msg.type)
                  )}>
                    {getIcon(msg.type)}
                  </div>
                  
                  <Card className="overflow-hidden transition-all hover:shadow-md border-white/40 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-slate-500 rounded-full">
                          {msg.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{msg.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips Section */}
        <Card className="bg-emerald-900 text-white border-none shadow-xl overflow-hidden relative">
           <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
           <CardHeader>
             <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {latestTip ? latestTip.title : "Community Health Tip"}
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <p className="text-emerald-50/80 italic">
               "{latestTip ? latestTip.content : "Health is wealth, my pikin. Keeping your surroundings clean is the first step to a long life."}" 
               <span className="block mt-2 font-bold">— {me?.user?.ai_personality || "Mama Health"}</span>
             </p>
             {!latestTip && (
               <div className="flex gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl flex-1">
                    <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Environmental</p>
                    <p className="text-sm">Clear standing water to stop mosquito breeding.</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl flex-1">
                     <p className="text-xs font-bold text-emerald-300 uppercase mb-1">Hygiene</p>
                     <p className="text-sm">Boil drinking water, especially during rainy season.</p>
                  </div>
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </main>
  );
}
