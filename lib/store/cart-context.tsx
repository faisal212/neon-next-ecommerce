'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useTransition,
  type ReactNode,
} from 'react';
import { storeFetch } from './api';
import type { CartItemData } from './types';

interface CartState {
  items: CartItemData[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'SET_ITEMS'; items: CartItemData[] }
  | { type: 'ADD_ITEM'; item: CartItemData }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.variantId === action.item.variantId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.itemId),
      };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isPending: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

function calcSubtotal(items: CartItemData[]): number {
  return items.reduce((sum, item) => {
    const unitPrice = parseFloat(item.unitPricePkr || '0');
    return sum + unitPrice * item.quantity;
  }, 0);
}

export function CartProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: CartItemData[];
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: initialItems,
    isOpen: false,
  });
  const [isPending, startTransition] = useTransition();

  const refreshCart = useCallback(async () => {
    try {
      const data = await storeFetch<{ data: { items: CartItemData[] } }>('/cart');
      dispatch({ type: 'SET_ITEMS', items: data.data?.items ?? [] });
    } catch {
      // silent fail on refresh
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      startTransition(async () => {
        try {
          await storeFetch('/cart/items', {
            method: 'POST',
            body: { variantId, quantity },
          });
          await refreshCart();
          dispatch({ type: 'OPEN_CART' });
        } catch (err) {
          console.error('Failed to add item:', err);
          throw err;
        }
      });
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      // Optimistic update
      dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });
      startTransition(async () => {
        try {
          await storeFetch(`/cart/items/${itemId}`, {
            method: 'PATCH',
            body: { quantity },
          });
        } catch {
          await refreshCart(); // revert on failure
        }
      });
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      // Optimistic update
      dispatch({ type: 'REMOVE_ITEM', itemId });
      startTransition(async () => {
        try {
          await storeFetch(`/cart/items/${itemId}`, { method: 'DELETE' });
        } catch {
          await refreshCart(); // revert on failure
        }
      });
    },
    [refreshCart]
  );

  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);

  const value: CartContextValue = {
    items: state.items,
    itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: calcSubtotal(state.items),
    isOpen: state.isOpen,
    isPending,
    addItem,
    updateQuantity,
    removeItem,
    openCart,
    closeCart,
    toggleCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
