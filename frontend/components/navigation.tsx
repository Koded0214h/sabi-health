"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import * as NextNavigation from "next/navigation";
import { useEffect, useState } from "react";
import { HeartPulse, Activity } from "lucide-react";
import { useMe } from "@/lib/hooks";
import { Badge } from "./ui/badge";

export function Navigation() {
  const pathname = NextNavigation.usePathname();
  const router = NextNavigation.useRouter();
  const [user, setUser] = useState<any>(null);
  const { data: me } = useMe();

  useEffect(() => {
    const storedUser = localStorage.getItem("sabi_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sabi_user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-morphism mx-auto mt-4 max-w-5xl rounded-3xl border border-white/10 shadow-2xl">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Sabi<span className="text-primary">Health</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">

        {user && (
          <>
            <Link 
              href="/dashboard" 
              className={cn(
                "hover:text-primary transition-colors flex items-center gap-2",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
          
            {me && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className={cn(
                    "w-4 h-4",
                    me.health_score > 70 ? "text-emerald-500" : me.health_score > 40 ? "text-yellow-500" : "text-red-500"
                  )} />
                  <span className="text-xs font-bold">{me.health_score}%</span>
                </div>
                <div className="h-4 w-[1px] bg-white/10" />
                <Badge variant={me.current_risk === "HIGH" ? "destructive" : "success"} className="h-5 text-[10px] px-2">
                  {me.current_risk} RISK
                </Badge>
              </div>
            )}

            <Link 
              href="/symptoms" 
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/symptoms" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Symptoms
            </Link>

            <Link 
              href="/logs" 
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/logs" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Calls
            </Link>

            <Link 
              href="/messages" 
              className={cn(
                "hover:text-primary transition-colors",
                pathname === "/messages" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Messages
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Button variant="ghost" size="sm" className="rounded-full" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="premium" size="sm" className="rounded-full px-6">
                Join Sabi
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
