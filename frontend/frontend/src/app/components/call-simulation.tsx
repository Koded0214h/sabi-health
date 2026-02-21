import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, PhoneOff, User, MapPin, Hospital, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { HEALTH_CENTERS } from '../data/lgas';
import { motion } from 'motion/react';

interface CallSimulationProps {
  activeCall: {
    user: {
      id: string;
      name: string;
      lga: string;
    };
    script: string;
    audioUrl: string;
  } | null;
  onResponse: (response: string) => void;
}

export function CallSimulation({ activeCall, onResponse }: CallSimulationProps) {
  const [callState, setCallState] = useState<'incoming' | 'active' | 'ended' | null>(null);
  const [showHealthCenter, setShowHealthCenter] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    if (activeCall) {
      setCallState('incoming');
      setShowHealthCenter(false);
      setHasResponded(false);
    }
  }, [activeCall]);

  const handleAnswer = () => {
    setCallState('active');
    // Simulate audio playback
    setPlayingAudio(true);
    setTimeout(() => {
      setPlayingAudio(false);
    }, 3000);
  };

  const handleResponse = (response: string) => {
    setHasResponded(true);
    if (response === 'fever') {
      setShowHealthCenter(true);
    } else {
      setTimeout(() => setCallState('ended'), 2000);
    }
    onResponse(response === 'fever' ? 'I have fever' : 'I\'m fine');
  };

  const handleDecline = () => {
    setCallState(null);
    onResponse('Call declined');
  };

  if (!activeCall && !callState) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Phone className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Active Calls
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Trigger a health call from the Dashboard to see the automated call in action.
            </p>
            <Button
              onClick={() => {
                const dashboardTab = document.querySelector('[value="dashboard"]') as HTMLElement;
                dashboardTab?.click();
              }}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeCall) return null;

  const healthCenter = HEALTH_CENTERS[activeCall.user.lga] || 'Nearest Primary Health Center';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Incoming Call */}
      {callState === 'incoming' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <Card className="shadow-2xl border-4 border-green-500 bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex justify-center"
                >
                  <div className="bg-gradient-to-br from-green-500 to-blue-600 p-6 rounded-full">
                    <Phone className="h-16 w-16 text-white" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Incoming Health Call
                  </h2>
                  <p className="text-lg text-gray-600">Sabi Health Alert System</p>
                </div>

                <div className="bg-white rounded-lg p-4 inline-block">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div className="text-left">
                      <p className="font-semibold text-lg">{activeCall.user.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {activeCall.user.lga}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    onClick={handleDecline}
                    variant="destructive"
                    size="lg"
                    className="rounded-full w-20 h-20"
                  >
                    <PhoneOff className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={handleAnswer}
                    className="rounded-full w-20 h-20 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Call */}
      {callState === 'active' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="shadow-2xl border-2 border-green-500">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{activeCall.user.name}</CardTitle>
                    <CardDescription className="text-green-100">
                      {activeCall.user.lga}
                    </CardDescription>
                  </div>
                </div>
                {playingAudio && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Volume2 className="h-6 w-6 text-white" />
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Script Display */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 p-2 rounded-full mt-1">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Automated Health Advisory</p>
                    <p className="text-lg leading-relaxed text-gray-800">
                      {activeCall.script}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio Playback */}
              {playingAudio && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Volume2 className="h-5 w-5 text-green-600" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex gap-1">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-green-600 rounded-full"
                            animate={{ height: [10, 30, 10] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.8,
                              delay: i * 0.05,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Response Buttons */}
              {!hasResponded ? (
                <div className="space-y-3">
                  <p className="text-center font-semibold text-gray-700">
                    How would you like to respond?
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleResponse('fever')}
                      variant="destructive"
                      size="lg"
                      className="py-6 text-lg"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      I have fever
                    </Button>
                    <Button
                      onClick={() => handleResponse('fine')}
                      className="bg-green-600 hover:bg-green-700 py-6 text-lg"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      I'm fine
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-blue-800">Response Recorded</h3>
                  <p className="text-blue-600">The health log has been updated.</p>
                </div>
              )}

              {/* Health Center Info */}
              {showHealthCenter && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-red-50 border-2 border-red-300 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-red-500 p-3 rounded-full">
                      <Hospital className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-red-900 mb-2">
                        Please Visit a Health Center
                      </h3>
                      <p className="text-red-800 mb-3">
                        Based on your symptoms, we recommend visiting a health facility immediately.
                      </p>
                      <div className="bg-white rounded-md p-3">
                        <p className="text-sm text-gray-600 mb-1">Nearest Health Center:</p>
                        <p className="font-semibold text-gray-900">{healthCenter}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Call Ended */}
      {callState === 'ended' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <PhoneOff className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                Call Ended
              </h3>
              <p className="text-gray-500">
                Response has been logged successfully.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
