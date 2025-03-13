import { useState } from 'react';

interface Profile {
  id: string;
  paid: boolean;
  images_generated: number;
}

export const useUser = () => {
  const [user] = useState({
    id: 'mock-user-id',
    email: 'mock@example.com',
  });

  const [profile] = useState<Profile>({
    id: 'mock-user-id',
    paid: true, // Set to true to enable unlimited generations
    images_generated: 0,
  });

  return {
    user,
    profile,
  };
};
