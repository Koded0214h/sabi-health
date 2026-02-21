import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { FileText, Download, TrendingUp, AlertCircle, FileArchive } from 'lucide-react';
import { CallLog, User } from '../types';
import { toast } from 'sonner';

interface FileReportProps {
    users: User[];
    logs: CallLog[];
}

export function FileReport({ users, logs }: FileReportProps) {
    const handleDownload = () => {
        toast.success("Downloading File Report (PDF)...");
        setTimeout(() => toast.info("Download completed."), 1500);
    };

    const handleExportCSV = () => {
        toast.success("Exporting data to CSV...");
        setTimeout(() => toast.info("CSV exported successfully."), 1500);
    };

    const totalCalls = logs.length;
    const totalFevers = logs.filter(l => l.userResponse === 'I have fever').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <FileText className="h-6 w-6 text-blue-600" />
                                Comprehensive File Report
                            </CardTitle>
                            <CardDescription>Generated analytical report of proactive health campaigns</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleExportCSV} variant="outline" className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50">
                                <FileArchive className="h-4 w-4 mr-2" />
                                Export Data
                            </Button>
                            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-2" />
                                Save Report PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 flex items-start gap-3">
                            <TrendingUp className="h-8 w-8 text-blue-500 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Automated Calls</p>
                                <h3 className="text-3xl font-bold text-gray-800">{totalCalls}</h3>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-5 border border-red-100 flex items-start gap-3">
                            <AlertCircle className="h-8 w-8 text-red-500 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Sickness Reported</p>
                                <h3 className="text-3xl font-bold text-red-700">{totalFevers}</h3>
                                <p className="text-xs text-red-600 mt-1">Users referred to Health Centers</p>
                            </div>
                        </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4">Detailed Breakdown</h4>
                    {logs.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-300">
                            <p className="text-gray-500">No data available for report generation yet. Trigger some calls!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="flex flex-col p-4 bg-gray-50 border rounded-md">
                                    <div className="flex flex-col sm:flex-row justify-between border-b pb-2 mb-2">
                                        <div>
                                            <p className="font-medium text-gray-800">{log.userName}</p>
                                            <p className="text-sm text-gray-500">{log.lga} &nbsp;•&nbsp; {new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="mt-2 sm:mt-0">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${log.userResponse === 'I have fever' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {log.userResponse}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-2">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Health Advisory Delivered:</span>
                                            <p className="text-sm text-gray-700 italic mt-1 bg-white p-2 rounded border">"{log.fullScript}"</p>
                                        </div>

                                        {log.userResponse === 'I have fever' && (
                                            <div className="bg-red-50 p-2 rounded border border-red-100">
                                                <span className="text-xs font-bold text-red-700 uppercase">Action Taken:</span>
                                                <p className="text-sm text-red-800 mt-1">Referred to nearest Primary Health Center in {log.lga}.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
