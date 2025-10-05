import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
// import { db } from '../firebase';
// After
import { db } from "../firebase.js";
const Composer = ({ user, activeChat }) => {
  const [text, setText] = useState('');

  const sendMessage = async () => {
    if (text.trim() === '' || !activeChat) return;
    const { chatId, otherUser } = activeChat;
    
    setText(''); // Clear input immediately
    
    // 1. Add message to the messages subcollection
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });

    // 2. Update the lastMessage and timestamp on the main chat document
    await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
    });
    
    // 3. Update the lastMessage for both users' "userChats" entry for the sidebar
    await updateDoc(doc(db, 'userChats', user.uid, 'items', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'userChats', otherUser.uid, 'items', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="composer">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
      />
      <button className="btn primary" onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Composer;