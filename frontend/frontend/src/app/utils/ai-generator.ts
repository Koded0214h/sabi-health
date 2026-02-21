import { RiskStatus } from '../types';

export const generateHealthScript = (
  name: string,
  lga: string,
  riskStatus: RiskStatus
): string => {
  const greetings = [
    `Good evening ${name}!`,
    `Hello ${name}, how you dey?`,
    `${name}, good day o!`,
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  if (riskStatus.level === 'HIGH') {
    const scripts = [
      `${greeting} I dey call you from Sabi Health. We don see say ${lga} dey inside serious health alert now. ${riskStatus.reasons.join('. ')}. Make you take extra care o! Cover your food well well so rat no go touch am. Use mosquito net every night. Make you wash hand regularly with soap. Anybody for your house dey show sign of sickness - like fever, body pain, or vomiting?`,

      `${greeting} This na Sabi Health calling. We get important health message for you. For ${lga} now, ${riskStatus.reasons.join(', ')}. You need to dey very careful. Make sure say you boil water before you drink am. Sleep under treated mosquito net. If you see rat for your house, chase am comot and cover all your food. You or anybody for house dey feel sick at all?`,

      `${greeting} Sabi Health here with urgent message. ${lga} dey face some health challenge now - ${riskStatus.reasons.join(' and ')}. Please, take these steps: Clean your environment well, use mosquito repellent, cover all food containers, and boil drinking water. Tell me, anybody for your house dey complain of fever or body pain?`,
    ];
    return scripts[Math.floor(Math.random() * scripts.length)];
  }

  if (riskStatus.level === 'MEDIUM') {
    const scripts = [
      `${greeting} I dey call from Sabi Health to give you small health update. For ${lga}, ${riskStatus.reasons.join('. ')}. Make you use mosquito net when you wan sleep and cover your food properly. E no too serious, but prevention better pass cure. You dey alright? Anybody for house dey sick?`,

      `${greeting} This na Sabi Health. We just wan remind you say ${riskStatus.reasons.join(' and ')}. Make you dey careful small: wash hand regularly, use net for night, and keep your compound clean. Everything dey okay for your side?`,

      `${greeting} Quick health reminder from Sabi Health: ${lga} get ${riskStatus.reasons.join(', ')}. Nothing too serious, but make you just stay alert. Use your mosquito net and maintain good hygiene. You and family dey fine?`,
    ];
    return scripts[Math.floor(Math.random() * scripts.length)];
  }

  return `${greeting} This na your regular health check from Sabi Health. Good news - no major health threat for ${lga} right now! Just continue to maintain good hygiene, use mosquito net, and keep your environment clean. You dey okay? Everybody for house dey fine?`;
};

export const generateAudioUrl = (script: string): string => {
  // In a real implementation, this would send the script to a TTS service
  // For demo purposes, we'll return a placeholder
  return `data:audio/mp3;base64,${btoa(script.substring(0, 100))}`;
};
