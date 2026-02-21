import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Droplet, Bug, Waves } from 'lucide-react';

interface DiseaseInfo {
  name: string;
  icon: React.ReactNode;
  symptoms: string[];
  prevention: string[];
  color: string;
  bgColor: string;
}

const diseases: DiseaseInfo[] = [
  {
    name: 'Lassa Fever',
    icon: <AlertTriangle className="h-6 w-6" />,
    symptoms: ['High fever', 'Headache', 'Sore throat', 'Muscle pain', 'Chest pain'],
    prevention: [
      'Store food in rat-proof containers',
      'Keep homes clean and rat-free',
      'Dispose of garbage properly',
      'Avoid contact with rats',
    ],
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    name: 'Malaria',
    icon: <Bug className="h-6 w-6" />,
    symptoms: ['Fever and chills', 'Headache', 'Fatigue', 'Nausea', 'Muscle pain'],
    prevention: [
      'Sleep under treated mosquito nets',
      'Use mosquito repellent',
      'Eliminate standing water',
      'Wear long sleeves at dusk/dawn',
    ],
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  {
    name: 'Cholera',
    icon: <Waves className="h-6 w-6" />,
    symptoms: ['Severe diarrhea', 'Vomiting', 'Dehydration', 'Muscle cramps', 'Rapid heart rate'],
    prevention: [
      'Drink only boiled or treated water',
      'Wash hands with soap regularly',
      'Eat only cooked food',
      'Improve sanitation',
    ],
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    name: 'Typhoid',
    icon: <Droplet className="h-6 w-6" />,
    symptoms: ['Prolonged fever', 'Weakness', 'Abdominal pain', 'Headache', 'Loss of appetite'],
    prevention: [
      'Drink clean, safe water',
      'Maintain good hygiene',
      'Get vaccinated',
      'Avoid street food',
    ],
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
];

export function DiseaseInfoCards() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Disease Information & Prevention
        </h2>
        <p className="text-gray-600">
          Learn about common diseases and how to protect yourself
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diseases.map((disease) => (
          <Card key={disease.name} className={`${disease.bgColor} border-2 shadow-lg`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`${disease.color} bg-white p-2 rounded-lg`}>
                  {disease.icon}
                </div>
                <CardTitle className="text-xl">{disease.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Symptoms</Badge>
                </h4>
                <ul className="space-y-1">
                  {disease.symptoms.map((symptom, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className={`${disease.color} mt-1`}>•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-green-600 text-white">Prevention</Badge>
                </h4>
                <ul className="space-y-1">
                  {disease.prevention.map((tip, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2 text-yellow-900">
                When to Seek Medical Help
              </h3>
              <p className="text-sm text-yellow-900 mb-3">
                Visit a health center immediately if you experience:
              </p>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>High fever</strong> that lasts more than 2 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Severe headache</strong> with neck stiffness</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Persistent vomiting</strong> or severe diarrhea</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Difficulty breathing</strong> or chest pain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Signs of dehydration</strong> (extreme thirst, dry mouth, little or no urination)</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
