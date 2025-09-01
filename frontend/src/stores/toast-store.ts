import { create } from 'zustand';

export type ToastType = 'success' | 'error';

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  open: boolean;
};

type ToastStore = {
  toasts: ToastItem[];
  showToast: (message: string, type: ToastType) => void;
  hideToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (message: string, type: ToastType) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, open: true }],
    }));
  },
  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      ),
    }));
  },
}));
