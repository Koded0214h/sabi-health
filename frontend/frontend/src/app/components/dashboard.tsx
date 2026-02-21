import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../types';
import { calculateRisk } from '../utils/risk-engine';
import { generateHealthScript, generateAudioUrl } from '../utils/ai-generator';
import { Users, Phone, AlertTriangle, CheckCircle, CloudRain, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardProps {
  users: User[];
  onTriggerCall: (user: User, script: string, audioUrl: string) => void;
}

export function Dashboard({ users, onTriggerCall }: DashboardProps) {
  const [triggeringCall, setTriggeringCall] = useState<string | null>(null);

  const handleTriggerCall = (user: User) => {
    setTriggeringCall(user.id);

    // Calculate risk
    const riskStatus = calculateRisk(user.lga);

    // Generate script
    const script = generateHealthScript(user.name, user.lga, riskStatus);

    // Generate audio URL
    const audioUrl = generateAudioUrl(script);

    // Simulate processing delay
    setTimeout(() => {
      onTriggerCall(user, script, audioUrl);
      setTriggeringCall(null);
      toast.success(`Call initiated to ${user.name}`);
    }, 1000);
  };

  const getRiskBadge = (level: string) => {
    const variants = {
      HIGH: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600', animation: 'animate-pulse-fast' },
      MEDIUM: { variant: 'default' as const, icon: Activity, color: 'text-yellow-600', animation: '' },
      LOW: { variant: 'secondary' as const, icon: CheckCircle, color: 'text-green-600', animation: '' },
    };

    const config = variants[level as keyof typeof variants];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.animation}`}>
        <Icon className="h-3 w-3" />
        {level}
      </Badge>
    );
  };

  const overallStats = {
    total: users.length,
    highRisk: users.filter(u => calculateRisk(u.lga).level === 'HIGH').length,
    mediumRisk: users.filter(u => calculateRisk(u.lga).level === 'MEDIUM').length,
    lowRisk: users.filter(u => calculateRisk(u.lga).level === 'LOW').length,
  };

  if (users.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Users className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Users Registered Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Register your first user to start monitoring health risks and sending proactive alerts.
            </p>
            <Button
              onClick={() => {
                const registerTab = document.querySelector('[value="register"]') as HTMLElement;
                registerTab?.click();
              }}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Go to Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{overallStats.total}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg animate-pulse-fast hover:animate-none transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">High Risk</p>
                <p className="text-3xl font-bold">{overallStats.highRisk}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Medium Risk</p>
                <p className="text-3xl font-bold">{overallStats.mediumRisk}</p>
              </div>
              <Activity className="h-12 w-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Low Risk</p>
                <p className="text-3xl font-bold">{overallStats.lowRisk}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registered Users */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registered Users & Risk Status
          </CardTitle>
          <CardDescription>
            Monitor health risks and trigger preventive calls
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {users.map((user) => {
              const riskStatus = calculateRisk(user.lga);
              const isTriggering = triggeringCall === user.id;

              return (
                <div
                  key={user.id}
                  className={`border rounded-lg p-4 transition-all ${riskStatus.level === 'HIGH'
                      ? 'border-red-200 bg-red-50'
                      : riskStatus.level === 'MEDIUM'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-green-200 bg-green-50'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-white">
                          {user.lga}
                        </Badge>
                        {getRiskBadge(riskStatus.level)}
                      </div>

                      <div className="bg-white rounded-md p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CloudRain className="h-4 w-4" />
                          <span>Rainfall: {riskStatus.rainfall.toFixed(1)}mm</span>
                        </div>
                        {riskStatus.reasons.map((reason, idx) => (
                          <p key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{reason}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleTriggerCall(user)}
                      disabled={isTriggering}
                      className={`${riskStatus.level === 'HIGH'
                          ? 'bg-red-600 hover:bg-red-700'
                          : riskStatus.level === 'MEDIUM'
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {isTriggering ? 'Calling...' : 'Trigger Call'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
