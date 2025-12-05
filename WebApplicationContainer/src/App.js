import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import GraphEditor from './app/GraphEditor';
import ShortcutsOverlay from './components/ShortcutsOverlay';

// PUBLIC_INTERFACE
function App() {
  /** Root-level theme and read-only toggle to be accessible app-wide */
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App">
      <BrowserRouter>
        <header className="App-header" style={{ minHeight: 'auto', padding: 16, gap: 8 }}>
          <nav style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link className="App-link" to="/">Graph Editor</Link>
            <Link className="App-link" to="/shortcuts">Shortcuts</Link>
            <div style={{ marginLeft: 'auto' }} />
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<GraphEditor />} />
          <Route path="/shortcuts" element={<ShortcutsOverlay standalone />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
