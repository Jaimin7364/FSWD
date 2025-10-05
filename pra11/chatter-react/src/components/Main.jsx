import Messages from './Messages';
import Composer from './Composer';

const Main = ({ user, activeChat, toggleSidebar }) => {
  return (
    <main className="main">
      <div className="topbar">
        <div className="title">
          <div className="menu">
            <button className="btn ghost" onClick={toggleSidebar}>☰</button>
          </div>
          <div>
            <strong>{activeChat ? activeChat.otherUser.name : 'Welcome'}</strong>
            <div className="muted" style={{ fontSize: '.9rem' }}>
              {activeChat ? 'Chatting with ' + activeChat.otherUser.name : 'Select a conversation to begin.'}
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        {activeChat ? (
          <>
            <Messages user={user} chatId={activeChat.chatId} />
            <Composer user={user} activeChat={activeChat} />
          </>
        ) : (
          <div className="empty">
            <div className="pill">No chat selected</div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Main;