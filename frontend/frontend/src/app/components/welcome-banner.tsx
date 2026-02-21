import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Sparkles, Phone, Users, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeBannerProps {
  onClose: () => void;
  onLoadDemo: () => void;
}

export function WelcomeBanner({ onClose, onLoadDemo }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="shadow-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 mb-6">
        <CardContent className="pt-6 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-2xl shadow-lg">
              <Phone className="h-12 w-12 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Sabi Health! 🎉
              </h2>
              <p className="text-gray-700 mb-4">
                Your proactive community health companion for disease prevention. Get started by exploring
                the demo or registering your first user.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onLoadDemo}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Load Demo Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const registerTab = document.querySelector('[value="register"]') as HTMLElement;
                    registerTab?.click();
                    onClose();
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Register New User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const infoTab = document.querySelector('[value="info"]') as HTMLElement;
                    infoTab?.click();
                    onClose();
                  }}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
