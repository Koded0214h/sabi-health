import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface User {
  id: string;
  name: string;
  phone: number;
  lga: string;
  ai_personality: string;
}


export interface Log {
  id: string;
  user_id: string;
  timestamp: string;
  risk_type: string;
  script: string;
  audio_url: string | null;
  response: string | null;
}

export interface RiskCheckResponse {
  user_id: string;
  risk: "HIGH" | "MEDIUM" | "LOW";
  rainfall_mm: number;
}

export interface MeResponse {
  user: User;
  logs: Log[];
  symptoms: SymptomLog[];
  health_score: number;
  current_risk: string;
  rainfall_mm: number;
}

export interface SymptomLog {
  id?: string;
  user_id: string;
  timestamp?: string;
  fever: number;
  cough: number;
  headache: number;
  fatigue: number;
  notes?: string;
}


