import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Database, Phone, Zap } from 'lucide-react';
import { DiseaseInfoCards } from './disease-info-cards';

export function InfoPanel() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            About Sabi Health
          </CardTitle>
          <CardDescription className="text-base">
            Proactive Voice AI for Disease Prevention in Nigeria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <strong>Sabi Health</strong> is a proactive health companion that uses real-time
            environmental and epidemiological data to place automated outbound calls to at-risk
            individuals, delivering personalized, culturally resonant voice advice in Nigerian
            Pidgin/English.
          </p>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-lg mb-3 text-blue-900">Key Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Proactive Monitoring:</strong> Tracks weather data and disease hotspots in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>AI-Generated Messages:</strong> Creates culturally appropriate health advice using Gemini 1.5 Flash</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Voice Synthesis:</strong> Natural Nigerian accent using YarnGPT/Spitch API</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Health Center Referral:</strong> Provides nearest facility when symptoms are reported</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>Call Logging:</strong> Tracks all interactions for analysis and reporting</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="text-xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: 'User Registration',
                description: 'Users register with their name, phone number, and Local Government Area (LGA)',
                icon: Database,
              },
              {
                step: 2,
                title: 'Risk Monitoring',
                description: 'System monitors weather data (rainfall) and disease hotspot information for each LGA',
                icon: AlertCircle,
              },
              {
                step: 3,
                title: 'AI Message Generation',
                description: 'When risk is detected, AI generates a culturally appropriate preventive message',
                icon: Zap,
              },
              {
                step: 4,
                title: 'Proactive Call',
                description: 'System places an automated call with personalized health advice and symptom check',
                icon: Phone,
              },
              {
                step: 5,
                title: 'Response & Referral',
                description: 'If symptoms are reported, provides nearest health center information',
                icon: CheckCircle,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-xl">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'React', category: 'Frontend' },
              { name: 'Tailwind CSS', category: 'Styling' },
              { name: 'Gemini 1.5 Flash', category: 'AI' },
              { name: 'YarnGPT/Spitch', category: 'Voice' },
              { name: 'Open-Meteo', category: 'Weather' },
              { name: 'Mock NCDC Data', category: 'Disease' },
            ].map((tech) => (
              <div key={tech.name} className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-sm">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsible AI */}
      <Card className="shadow-xl border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-yellow-900">Responsible AI Disclosure</h3>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Gemini 1.5 Flash</strong> generates culturally appropriate health messages with prompts designed to avoid harmful advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Voice synthesis</strong> uses YarnGPT/Spitch API for authentic Nigerian accents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>All data is from public APIs or mock datasets - no real personal data is stored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Health insights are generated for informational purposes and should not be used for actual medical decisions without local health center consultation</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
