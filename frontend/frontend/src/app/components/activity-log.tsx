import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CallLog } from '../types';
import { Activity, Phone, User, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLogProps {
  logs: CallLog[];
}

export function ActivityLog({ logs }: ActivityLogProps) {
  if (logs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Activity className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Activity Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Call logs will appear here once you trigger health calls from the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Activity Log</CardTitle>
              <CardDescription className="text-base">
                Complete history of all health calls and user responses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Calls</p>
                  <p className="text-2xl font-bold text-blue-800">{logs.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Fever Reports</p>
                  <p className="text-2xl font-bold text-red-800">
                    {logs.filter(l => l.userResponse.includes('fever')).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Healthy Reports</p>
                  <p className="text-2xl font-bold text-green-800">
                    {logs.filter(l => l.userResponse.includes('fine')).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Log Entries */}
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className={`border-l-4 rounded-lg p-5 shadow-sm transition-all hover:shadow-md ${log.userResponse.includes('fever')
                  ? 'border-red-500 bg-red-50'
                  : log.userResponse.includes('fine')
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-500 bg-gray-50'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="bg-white text-base">
                        #{logs.length - index}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(log.timestamp), 'MMM dd, yyyy · h:mm a')}</span>
                      </div>
                      <Badge className="bg-purple-600">
                        {log.triggerType}
                      </Badge>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium mr-2">Script snippet:</span>
                        <span className="italic">"{log.fullScript.substring(0, 100)}..."</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{log.lga}</span>
                      </div>
                    </div>

                    {/* Script Snippet */}
                    <div className="bg-white rounded-md p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Automated Message Snippet:</p>
                      <p className="text-sm text-gray-800 italic">"{log.fullScript.substring(0, 100)}..."</p>
                    </div>

                    {/* User Response */}
                    <div
                      className={`rounded-md p-3 border-2 ${log.userResponse.includes('fever')
                        ? 'border-red-300 bg-red-100'
                        : log.userResponse.includes('fine')
                          ? 'border-green-300 bg-green-100'
                          : 'border-gray-300 bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <p className="text-xs font-semibold text-gray-600">User Response:</p>
                      </div>
                      <p
                        className={`text-sm font-semibold mt-1 ${log.userResponse.includes('fever')
                          ? 'text-red-900'
                          : log.userResponse.includes('fine')
                            ? 'text-green-900'
                            : 'text-gray-900'
                          }`}
                      >
                        {log.userResponse}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export/Analysis Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Analytics & Insights</h3>
              <p className="text-sm text-gray-600 mb-4">
                In a production system, this data would be analyzed to:
              </p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Identify disease hotspots and outbreak patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Track preventive call effectiveness and user engagement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Generate reports for public health authorities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Optimize automated messaging based on user responses</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
