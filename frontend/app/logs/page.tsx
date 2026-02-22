"use client";

import { Navigation } from "@/components/navigation";
import { useLogs } from "@/lib/hooks";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Loader2,
  Volume2
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function LogsPage() {
  const { data: logs, isLoading } = useLogs();

  return (
    <main className="min-h-screen bg-muted/20">
      <Navigation />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-2">
           <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <History className="w-10 h-10 text-primary" />
              Alert History
           </h1>
           <p className="text-muted-foreground text-lg">
              Detailed record of all health messages sent and community feedback received.
           </p>
        </div>

        <Card className="glass-morphism border-none shadow-2xl overflow-hidden">
           <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-7">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Live feed of outbound calls and responses.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      placeholder="Search logs..." 
                      className="bg-white/50 dark:bg-slate-900/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64"
                    />
                 </div>
                 <Badge variant="outline" className="rounded-full px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors">
                    <Filter className="w-3 h-3 mr-2" />
                    Filter
                 </Badge>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                       <thead>
                        <tr className="border-b border-white/10 text-muted-foreground bg-white/5 text-left">
                          <th className="px-8 py-4 font-medium">Timestamp</th>
                          <th className="px-8 py-4 font-medium">Risk Layer</th>
                          <th className="px-8 py-4 font-medium">AI Script Snippet</th>
                          <th className="px-8 py-4 font-medium">Playback</th>
                          <th className="px-8 py-4 font-medium">Member Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {logs?.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4 whitespace-nowrap">
                               <div className="flex flex-col">
                                  <span className="font-medium">{format(new Date(log.timestamp), "MMM dd, yyyy")}</span>
                                  <span className="text-xs text-muted-foreground">{format(new Date(log.timestamp), "HH:mm:ss")}</span>
                               </div>
                            </td>
                            <td className="px-8 py-4">
                               <Badge 
                                 variant={log.risk_type === "HIGH" ? "destructive" : "warning"}
                                 className="rounded-full"
                               >
                                 {log.risk_type}
                               </Badge>
                            </td>
                            <td className="px-8 py-4 max-w-xs truncate">
                               <span className="text-muted-foreground italic">"{log.script.substring(0, 60)}..."</span>
                            </td>
                            <td className="px-8 py-4">
                               {log.audio_url ? (
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="rounded-full h-8 w-8 p-0 hover:bg-emerald-500/20 hover:text-emerald-600"
                                   onClick={() => {
                                     let url = log.audio_url!;
                                     if (url.startsWith("/audio")) {
                                       const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
                                       url = `${baseUrl}${url}`;
                                     }
                                     new Audio(url).play().catch(e => console.error(e));
                                   }}
                                 >
                                   <Volume2 className="h-4 w-4" />
                                 </Button>
                               ) : (
                                 <span className="text-xs text-muted-foreground opacity-50">N/A</span>
                               )}
                            </td>
                            <td className="px-8 py-4">
                               {log.response === "fever" ? (
                                  <div className="flex items-center gap-2 text-red-500 font-medium">
                                     <XCircle className="w-4 h-4" />
                                     Symptomatic (Referral)
                                  </div>
                               ) : log.response === "fine" ? (
                                  <div className="flex items-center gap-2 text-emerald-500 font-medium">
                                     <CheckCircle2 className="w-4 h-4" />
                                     Verified Safe
                                  </div>
                               ) : (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                     <HelpCircle className="w-4 h-4" />
                                     No Response
                                  </div>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </main>
  );
}
