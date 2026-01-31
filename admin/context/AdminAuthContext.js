import { createContext, useContext } from 'react';

export const AdminAuthContext = createContext({
  adminUser: null,
  setAdminUser: () => {},
  logout: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
