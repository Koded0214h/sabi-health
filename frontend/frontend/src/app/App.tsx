import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { RegistrationForm } from './components/registration-form';
import { Dashboard } from './components/dashboard';
import { CallSimulation } from './components/call-simulation';
import { ActivityLog } from './components/activity-log';
import { FileReport } from './components/file-report';
import { InfoPanel } from './components/info-panel';
import { WelcomeBanner } from './components/welcome-banner';
import { ActiveOutbreakBanner } from './components/active-outbreak-banner';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Phone, Users, Activity, Database, Sparkles, Info, FileText } from 'lucide-react';
import { User, CallLog, RiskStatus } from './types';
import { SEED_USERS } from './data/demo-users';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeCall, setActiveCall] = useState<{
    user: User;
    script: string;
    audioUrl: string;
  } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Load demo data
  useEffect(() => {
    if (demoMode) {
      setUsers(SEED_USERS);
    } else {
      setUsers([]);
      setCallLogs([]);
    }
  }, [demoMode]);

  const handleLoadDemo = () => {
    setDemoMode(true);
    setShowWelcome(false);
  };

  const handleRegisterUser = (user: User) => {
    setUsers([...users, user]);
  };

  const handleTriggerCall = (user: User, script: string, audioUrl: string) => {
    setActiveCall({ user, script, audioUrl });
    // Switch to call tab
    setTimeout(() => {
      const callTab = document.querySelector('[value="call"]') as HTMLElement;
      callTab?.click();
    }, 100);
  };

  const handleCallResponse = (response: string) => {
    if (activeCall) {
      const log: CallLog = {
        id: `log-${Date.now()}`,
        userId: activeCall.user.id,
        userName: activeCall.user.name,
        lga: activeCall.user.lga,
        timestamp: new Date().toISOString(),
        triggerType: 'manual',
        fullScript: activeCall.script,
        userResponse: response,
      };
      setCallLogs([log, ...callLogs]);
      // Note: We don't automatically clear activeCall so the user can see the response details.
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Sabi Health
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">Your automated neighbor that calls before sickness catches you</p>
              </div>
            </div>
            <Button
              onClick={() => setDemoMode(!demoMode)}
              variant={demoMode ? "default" : "outline"}
              className={demoMode ? "bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" : "w-full sm:w-auto"}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {demoMode ? 'Test Data Loaded' : 'Load Test Data'}
            </Button>
          </div>
        </div>
      </header>

      <ActiveOutbreakBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showWelcome && (
          <WelcomeBanner
            onClose={() => setShowWelcome(false)}
            onLoadDemo={handleLoadDemo}
          />
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-2 md:grid-cols-6 bg-white shadow-md h-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 px-2 py-3">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2 px-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Register</span>
            </TabsTrigger>
            <TabsTrigger value="call" className="flex items-center gap-2 px-2 py-3">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 px-2 py-3">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 px-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2 px-2 py-3">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              users={users}
              onTriggerCall={handleTriggerCall}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegistrationForm onRegister={handleRegisterUser} />
          </TabsContent>

          <TabsContent value="call">
            <CallSimulation
              activeCall={activeCall}
              onResponse={handleCallResponse}
            />
          </TabsContent>

          <TabsContent value="logs">
            <ActivityLog logs={callLogs} />
          </TabsContent>

          <TabsContent value="reports">
            <FileReport users={users} logs={callLogs} />
          </TabsContent>

          <TabsContent value="info">
            <InfoPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Sabi Health v1.0 - Proactive Health Alerts
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Local Development Environment
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
