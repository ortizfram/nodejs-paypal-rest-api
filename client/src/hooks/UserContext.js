import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext({
  userData: null,
  setUserData: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    try {
      // Check for existing user data in localStorage
      const storedUserData = localStorage.getItem('userData');
      return storedUserData ? JSON.parse(storedUserData) : null;
    } catch (error) {
      // Handle the case where parsing fails (e.g., invalid JSON)
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};
