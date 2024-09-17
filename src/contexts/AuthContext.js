import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, getUserData } from '../firebase';
import { User } from '../Classes/User';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      console.log("Auth state changed. User:", user);
      setCurrentUser(user);
      if (user) {
        try {
          const data = await getUserData(user.uid);
          console.log("User data:", data);
          if (data) {
            setUserData({
              ...data,
              isAdmin: data.isAdmin || false // Ensure isAdmin is always defined
            });
          } else {
            console.log("No user data found");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (formData) => {
    try {
      // Extract email and password from formData
      const { email, password, ...otherData } = formData;

      // Create user with Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create user document in Firestore using the User class
      const newUser = User(user.uid);
      Object.assign(newUser, otherData);
      newUser.email = email; // Ensure email is set correctly

      await db.collection('users').doc(user.uid).set(newUser);

      // Fetch the newly created user data
      const userData = await getUserData(user.uid);
      setUserData(userData);

      return user;
    } catch (error) {
      console.error("Error during signup:", error);
      throw error;
    }
  };

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = () => {
    return auth.signOut();
  };

  const resetPassword = (email) => {
    return auth.sendPasswordResetEmail(email);
  };

  const value = {
    currentUser,
    userData,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
