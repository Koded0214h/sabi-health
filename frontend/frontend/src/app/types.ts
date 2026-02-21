export interface User {
  id: string;
  name: string;
  phone: string;
  lga: string;
  registeredAt: string;
}

export interface RiskStatus {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  rainfall: number;
  isHotspot: boolean;
}

export interface CallLog {
  id: string;
  userId: string;
  userName: string;
  lga: string;
  timestamp: string;
  triggerType: 'automatic' | 'manual';
  fullScript: string;
  userResponse: string;
}

export interface LGAData {
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface DiseaseHotspot {
  lga: string;
  disease: string;
  severity: 'low' | 'medium' | 'high';
}
