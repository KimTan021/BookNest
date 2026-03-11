import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getCart } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Cart } from "../types/api";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {}
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, isAdmin } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || isAdmin || !token) {
      setCartCount(0);
      return;
    }
    try {
      const cartData: Cart = await getCart(token);
      const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  }, [isAuthenticated, isAdmin, token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
