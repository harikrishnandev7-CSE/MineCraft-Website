import React from 'react';
import ReactDOM from 'react-dom/client';
import { ParticipantProvider } from './context/ParticipantContext';
import { ChallengeProvider } from './context/ChallengeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ParticipantProvider>
      <ChallengeProvider>
        <App />
      </ChallengeProvider>
    </ParticipantProvider>
  </React.StrictMode>
);
