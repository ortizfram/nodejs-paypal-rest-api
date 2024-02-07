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

  // Function to update userData and also update localStorage
  const updateUserAndLocalStorage = (newUserData) => {
    setUserData(newUserData);
    localStorage.setItem('userData', JSON.stringify(newUserData));
  };

  return (
    <UserContext.Provider value={{ userData, setUserData: updateUserAndLocalStorage  }}>
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
