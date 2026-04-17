import React, { createContext, useContext, useMemo, useState } from 'react';
import { DOG_PROFILES, type DogProfile } from '@/constants/dog-profiles';

type DogProfileContextValue = {
  selectedProfile: DogProfile;
  setSelectedProfile: (profile: DogProfile) => void;
};

const DogProfileContext = createContext<DogProfileContextValue | null>(null);

export function DogProfileProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfile, setSelectedProfile] = useState<DogProfile>(DOG_PROFILES[0]);

  const value = useMemo(
    () => ({
      selectedProfile,
      setSelectedProfile,
    }),
    [selectedProfile]
  );

  return <DogProfileContext.Provider value={value}>{children}</DogProfileContext.Provider>;
}

export function useDogProfile() {
  const context = useContext(DogProfileContext);
  if (!context) {
    throw new Error('useDogProfile must be used within DogProfileProvider');
  }

  return context;
}