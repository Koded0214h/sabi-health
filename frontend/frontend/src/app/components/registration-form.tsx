import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../types';
import { LGAS } from '../data/lgas';
import { UserPlus, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationFormProps {
  onRegister: (user: User) => void;
}

export function RegistrationForm({ onRegister }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lga, setLga] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !lga) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API delay
    setTimeout(() => {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        phone,
        lga,
        registeredAt: new Date().toISOString(),
      };

      onRegister(newUser);
      setShowSuccess(true);
      toast.success('Registration successful!');

      // Reset form
      setTimeout(() => {
        setName('');
        setPhone('');
        setLga('');
        setIsSubmitting(false);
        setShowSuccess(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-2 border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-xl">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Register for Sabi Health</CardTitle>
              <CardDescription className="text-base">
                Get proactive health alerts for your area
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-green-700 mb-2">
                Registration Successful!
              </h3>
              <p className="text-gray-600">
                You will receive health alerts when risks are detected in your area.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 XXX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-base"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga">Local Government Area (LGA)</Label>
                <Select value={lga} onValueChange={setLga} disabled={isSubmitting}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select your LGA" />
                  </SelectTrigger>
                  <SelectContent>
                    {LGAS.map((lgaData) => (
                      <SelectItem key={lgaData.name} value={lgaData.name}>
                        {lgaData.name}, {lgaData.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>What you'll get:</strong>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Proactive health alerts when risks are detected</li>
                  <li>Personalized advice in Nigerian Pidgin/English</li>
                  <li>Nearest health center information when needed</li>
                  <li>Weather-based disease prevention tips</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register Now'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Data Privacy Notice</p>
              <p>
                Your data is stored securely and used exclusively by Sabi Health
                for disease monitoring and prevention alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
