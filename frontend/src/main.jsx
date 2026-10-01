import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './context/AuthContext';
import { ChallengeProvider } from './context/ChallengeContext';
import App from './App';
import './styles/globals.css';
import './styles/editor.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ChallengeProvider>
          <App />
        </ChallengeProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
