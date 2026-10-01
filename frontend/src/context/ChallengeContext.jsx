import React, { createContext, useContext, useState } from 'react';

const ChallengeContext = createContext(null);

export const ChallengeProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);

  return (
    <ChallengeContext.Provider value={{ activeSession, setActiveSession, currentChallenge, setCurrentChallenge }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallengeContext = () => useContext(ChallengeContext);
