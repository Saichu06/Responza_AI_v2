// src/data/userStorage.js

const STORAGE_KEY = "responza_user";
const USERS_LIST_KEY = "responza_users";

// Save current logged-in user (singleton for demo)
export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Also add to users list for future multiple accounts
  const users = getUsersList();
  const existingIndex = users.findIndex(u => u.account.email === user.account.email);
  if (existingIndex !== -1) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
};

// Get current logged-in user
export const getUser = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

// Get all registered users
export const getUsersList = () => {
  const data = localStorage.getItem(USERS_LIST_KEY);
  return data ? JSON.parse(data) : [];
};

// Check if email already exists
export const emailExists = (email) => {
  const users = getUsersList();
  return users.some(user => user.account.email === email);
};

// Login validation
export const validateLogin = (email, password) => {
  const users = getUsersList();
  const user = users.find(u => u.account.email === email && u.account.password === password);
  if (user) {
    saveUser(user); // set as current user
    return true;
  }
  return false;
};

// Clear current user (logout)
export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};