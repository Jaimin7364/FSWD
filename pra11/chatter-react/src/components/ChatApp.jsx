import { useState } from 'react';
import Sidebar from './Sidebar';
import Main from './Main';

const ChatApp = ({ user }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectChat = (chatInfo) => {
    setActiveChat(chatInfo);
    setIsSidebarOpen(false); 
  };

  return (
    <div className="app">
      <Sidebar 
        user={user} 
        onSelectChat={handleSelectChat}
        isSidebarOpen={isSidebarOpen}
      />
      <Main 
        user={user} 
        activeChat={activeChat}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
};

export default ChatApp;