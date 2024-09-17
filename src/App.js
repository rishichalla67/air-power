import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Schedule from './components/schedule';
import Nav from './components/nav';
import Landing from './components/landing';
import PrivateRoute from './components/Authentication/PrivateRoute';
import LoginPage from './components/login';

function App() {
  return (
    <Router>
      <AuthProvider>
      <div>
        <Nav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/schedule" element={<PrivateRoute><Schedule /></PrivateRoute >} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
