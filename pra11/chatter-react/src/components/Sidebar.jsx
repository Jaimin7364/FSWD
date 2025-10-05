import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
// import { auth, db } from '../firebase';
// After
import { auth, db } from "../firebase.js";
const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
};

const Sidebar = ({ user, onSelectChat, isSidebarOpen }) => {
  const [recentChats, setRecentChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {

    const q = query(collection(db, 'userChats', user.uid, 'items'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats = querySnapshot.docs.map(doc => doc.data());
      setRecentChats(chats);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }
    const usersRef = collection(db, 'users');
    const q = await getDocs(usersRef);
    const allUsers = q.docs.map(doc => doc.data());
    const filtered = allUsers.filter(u => 
        u.uid !== user.uid && 
        (u.name.toLowerCase().includes(term.toLowerCase()) || u.email.toLowerCase().includes(term.toLowerCase()))
    );
    setSearchResults(filtered);
  };
  
  const startChatWith = async (otherUser) => {
      const composeChatId = (a, b) => a < b ? `${a}_${b}` : `${b}_${a}`;
      const chatId = composeChatId(user.uid, otherUser.uid);
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
          await setDoc(chatRef, { participants: [user.uid, otherUser.uid], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      }

      const meUserChatsRef = doc(db, 'userChats', user.uid, 'items', chatId);
      await setDoc(meUserChatsRef, { chatId, otherUid: otherUser.uid, otherName: otherUser.name, otherPhoto: otherUser.photoURL, updatedAt: serverTimestamp() }, { merge: true });

      const otherUserChatsRef = doc(db, 'userChats', otherUser.uid, 'items', chatId);
      await setDoc(otherUserChatsRef, { chatId, otherUid: user.uid, otherName: user.displayName, otherPhoto: user.photoURL, updatedAt: serverTimestamp() }, { merge: true });

      onSelectChat({ chatId, otherUser });
      setSearchTerm('');
      setSearchResults([]);
  };

  const handleInvite = () => {
    const url = window.location.href;
    window.location.href = `mailto:?subject=Join me on Chatter&body=Let’s chat here: ${url}`;
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="logo"><span className="dot"></span><span>Chatter</span></div>
      <div className="card user-card">
        <img src={user.photoURL || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.uid}`} alt="me" />
        <div>
          <div style={{ fontWeight: 600 }}>{user.displayName || 'Anonymous'}</div>
          <div className="muted">{user.email}</div>
        </div>
      </div>

      <div className="card search">
        <input value={searchTerm} onChange={(e) => handleSearch(e.target.value)} placeholder="Search users by name/email" />
        <button className="btn" onClick={handleInvite}>+</button>
      </div>
      
      <div className="card" style={{ padding: '8px', flex: 1, overflow: 'auto' }}>
        <div className="muted" style={{ padding: '8px 8px 0' }}>{searchResults.length > 0 ? 'Search Results' : 'Recent chats'}</div>
        <div className="chats">
          {searchResults.length > 0 ? (
            searchResults.map(u => (
                <div key={u.uid} className="chat-row" onClick={() => startChatWith(u)}>
                    <img src={u.photoURL} alt={u.name} />
                    <div>
                        <div className="name">{u.name}</div>
                        <div className="last">{u.email}</div>
                    </div>
                </div>
            ))
          ) : (
            recentChats.map(chat => (
                <div key={chat.chatId} className="chat-row" onClick={() => onSelectChat({ chatId: chat.chatId, otherUser: { uid: chat.otherUid, name: chat.otherName, photoURL: chat.otherPhoto }})}>
                    <img src={chat.otherPhoto} alt={chat.otherName} />
                    <div>
                        <div className="name">{chat.otherName}</div>
                        <div className="last">{chat.lastMessage || 'Say hi 👋'}</div>
                    </div>
                    <div className="muted">{timeAgo(chat.updatedAt?.toDate())}</div>
                </div>
            ))
          )}
        </div>
      </div>

      <div className="nav card">
          <div className="item active">💬 Chats</div>
          <div className="item" onClick={() => signOut(auth)}>🚪 Logout</div>
      </div>
    </aside>
  );
};

export default Sidebar;