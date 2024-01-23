import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext({
  userData: null,
  setUserData: () => {},
});

export const UserContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    // Check for existing user data in localStorage
    const storedUserData = localStorage.getItem('userData');
    return storedUserData ? JSON.parse(storedUserData) : null;
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
