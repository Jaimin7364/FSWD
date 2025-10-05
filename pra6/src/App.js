import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
    } else {
      alert('Speech Recognition is not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const addTodo = () => {
    if (input.trim() === '') return;

    if (editIndex !== null) {
      const updatedTodos = todos.map((todo, index) =>
        index === editIndex ? { ...todo, text: input } : todo
      );
      setTodos(updatedTodos);
      setEditIndex(null);
    } else {
      setTodos([...todos, { text: input, completed: false }]);
    }

    setInput('');
  };

  const deleteTodo = (index) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
  };

  const editTodo = (index) => {
    setInput(todos[index].text);
    setEditIndex(index);
  };

  const completeTodo = (index) => {
    const taskToComplete = todos[index];
    setCompleted([...completed, taskToComplete]);
    deleteTodo(index);
  };

  return (
    <div className="container">
      <h1>Get Things Done!</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="What is the task today?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTodo}>
          {editIndex !== null ? 'Update' : 'Add Task'}
        </button>
        <button onClick={startListening}>🎤 Speak</button>
      </div>

      <div className="task-list">
        {todos.map((task, index) => (
          <div className="task-item" key={index}>
            <span>{task.text}</span>
            <div className="icons">
              <button onClick={() => completeTodo(index)}>✅</button>
              <button onClick={() => editTodo(index)}>✏️</button>
              <button onClick={() => deleteTodo(index)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <div className="completed-section">
          <h2>Completed Tasks</h2>
          <div className="task-list">
            {completed.map((task, index) => (
              <div className="task-item completed" key={index}>
                <span>{task.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
