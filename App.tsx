import React from 'react';
import ChatPage from './pages/ChatPage';
import ToastContainer from './components/ToastContainer';

const App: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <ChatPage />
    </>
  );
};

export default App;
