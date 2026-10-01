import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStorageService } from '../services/localStorageService';
import { STORAGE_KEYS } from '../utils/constants';

const ParticipantContext = createContext(null);

export function ParticipantProvider({ children }) {
  const [participant, setParticipant] = useState(() => {
    return localStorageService.get(STORAGE_KEYS.PARTICIPANT, null);
  });

  const registerParticipant = (details) => {
    const data = {
      ...details,
      registeredAt: new Date().toISOString(),
    };
    localStorageService.set(STORAGE_KEYS.PARTICIPANT, data);
    setParticipant(data);
    return data;
  };

  const clearParticipant = () => {
    localStorageService.remove(STORAGE_KEYS.PARTICIPANT);
    setParticipant(null);
  };

  return (
    <ParticipantContext.Provider
      value={{
        participant,
        isRegistered: !!participant && !!participant.participantId,
        registerParticipant,
        clearParticipant,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
}

export function useParticipant() {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
}
