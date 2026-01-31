import { createContext, useContext } from 'react';

export const OrdersContext = createContext({
  pendingCount: 0,
  setPendingCount: () => {},
});

export function useOrders() {
  return useContext(OrdersContext);
}
