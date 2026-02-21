import { User } from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'seed-1',
    name: 'Amina Yusuf',
    phone: '+234 803 456 7890',
    lga: 'Kano Municipal',
    registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Chukwudi Okonkwo',
    phone: '+234 805 123 4567',
    lga: 'Oshodi-Isolo',
    registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Fatima Bello',
    phone: '+234 701 987 6543',
    lga: 'Maiduguri',
    registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
