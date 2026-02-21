import { RiskStatus } from '../types';
import { DISEASE_HOTSPOTS } from '../data/lgas';

const getRainfallForLga = (lga: string): number => {
  const rainfallMap: Record<string, number> = {
    'Kano Municipal': 18.5,
    'Nassarawa': 22.3,
    'Oshodi-Isolo': 45.2,
    'Ikeja': 38.7,
    'Lagos Island': 52.1,
    'Alimosho': 41.8,
    'Port Harcourt': 67.3,
    'Obio-Akpor': 58.9,
    'Maiduguri': 2.1,
    'Jere': 3.4,
  };
  return rainfallMap[lga] || Math.random() * 30;
};

export const calculateRisk = (lga: string): RiskStatus => {
  const rainfall = getRainfallForLga(lga);
  const hotspots = DISEASE_HOTSPOTS.filter(h => h.lga === lga);
  const isHotspot = hotspots.length > 0;

  const reasons: string[] = [];

  // Check rainfall threshold
  if (rainfall > 40) {
    reasons.push(`Very heavy rainfall (${rainfall.toFixed(1)}mm) - High malaria risk`);
  } else if (rainfall > 15) {
    reasons.push(`Heavy rainfall (${rainfall.toFixed(1)}mm) - Increased mosquito breeding`);
  }

  // Check disease hotspots
  hotspots.forEach(hotspot => {
    if (hotspot.severity === 'high') {
      reasons.push(`Active ${hotspot.disease} outbreak in your area`);
    } else if (hotspot.severity === 'medium') {
      reasons.push(`${hotspot.disease} cases reported nearby`);
    }
  });

  // Determine risk level
  let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (rainfall > 40 || hotspots.some(h => h.severity === 'high')) {
    level = 'HIGH';
  } else if (rainfall > 15 || isHotspot) {
    level = 'MEDIUM';
  }

  if (reasons.length === 0) {
    reasons.push('No significant health risks detected in your area');
  }

  return {
    level,
    reasons,
    rainfall,
    isHotspot,
  };
};
