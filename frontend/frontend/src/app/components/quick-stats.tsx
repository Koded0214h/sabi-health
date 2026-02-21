import { Card, CardContent } from './ui/card';
import { TrendingUp, Users, Phone, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  bgColor: string;
  iconColor: string;
}

function StatsCard({ title, value, icon, trend, bgColor, iconColor }: StatsCardProps) {
  return (
    <Card className={`${bgColor} shadow-lg border-0`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`${iconColor} p-3 rounded-full bg-white/20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  totalUsers: number;
  highRisk: number;
  totalCalls: number;
  feverReports: number;
}

export function QuickStats({ totalUsers, highRisk, totalCalls, feverReports }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Users"
        value={totalUsers}
        icon={<Users className="h-6 w-6" />}
        bgColor="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        iconColor="text-white"
      />
      <StatsCard
        title="High Risk Areas"
        value={highRisk}
        icon={<AlertTriangle className="h-6 w-6" />}
        trend={highRisk > 0 ? "Requires attention" : "All clear"}
        bgColor="bg-gradient-to-br from-red-500 to-red-600 text-white"
        iconColor="text-white"
      />
      <StatsCard
        title="Total Calls"
        value={totalCalls}
        icon={<Phone className="h-6 w-6" />}
        bgColor="bg-gradient-to-br from-green-500 to-green-600 text-white"
        iconColor="text-white"
      />
      <StatsCard
        title="Fever Reports"
        value={feverReports}
        icon={<AlertTriangle className="h-6 w-6" />}
        trend={feverReports > 0 ? `${feverReports} require follow-up` : "No reports"}
        bgColor="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
        iconColor="text-white"
      />
    </div>
  );
}
