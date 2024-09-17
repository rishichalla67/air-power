import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/Authentication/PrivateRoute';
import PrivateAdminRoute from './components/Authentication/PrivateAdminRoute';
import Nav from './components/nav';
import Landing from './components/landing';
import Login from './components/login';
import Signup from './components/signup';
import Schedule from './components/schedule';
import Profile from './components/profile';
import ForgotPassword from './components/forgotPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/signup" 
            element={
              <PrivateAdminRoute>
                <Signup />
              </PrivateAdminRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <PrivateRoute>
                <Schedule />
              </PrivateRoute>
            } 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
