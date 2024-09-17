import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Schedule from './components/schedule';
import Nav from './components/nav';
import Landing from './components/landing';


function App() {
  return (
    <Router>
      <div>
        <Nav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
