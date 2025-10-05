import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase';
// After
import { db } from "../firebase.js";
const Messages = ({ user, chatId }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="messages">
      {messages.map(msg => (
        <div key={msg.id} className={`bubble ${msg.senderId === user.uid ? 'me' : 'you'}`}>
          {msg.text}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;