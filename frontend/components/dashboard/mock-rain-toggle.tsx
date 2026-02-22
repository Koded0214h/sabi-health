"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CloudRain, CloudOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function MockRainToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/mock-rain`)
      .then((res) => {
        setEnabled(res.data.enabled);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (checked: boolean) => {
    try {
      setEnabled(checked);
      const storedUser = localStorage.getItem("sabi_user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const res = await api.post(`/mock-rain`, { 
        enabled: checked,
        user_id: userId
      });
      
      if (res.status === 200) {
        toast.success(checked ? "Mock Rain Enabled" : "Mock Rain Disabled", {
          description: checked ? "Environmental risks are now simulated." : "Real-time weather restored.",
        });
        // Refresh the page or use a global state/swr to update other components
        window.location.reload(); 
      }
    } catch (error) {
      toast.error("Failed to toggle mock rain");
      setEnabled(!checked);
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-100 shadow-sm transition-all hover:bg-white/80">
      {enabled ? (
        <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" />
      ) : (
        <CloudOff className="w-5 h-5 text-slate-400" />
      )}
      <div className="flex flex-col">
        <Label htmlFor="mock-rain" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">
          Simulate Rain
        </Label>
        <Switch
          id="mock-rain"
          checked={enabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-blue-500 scale-75 -ml-1"
        />
      </div>
    </div>
  );
}
