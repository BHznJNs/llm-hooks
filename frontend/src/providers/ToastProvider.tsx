import { Provider, Root, Viewport } from '@radix-ui/react-toast';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { useToastStore } from '../stores/toast-store';

export default function ToastProvider() {
  const { toasts, hideToast } = useToastStore();

  return (
    <Provider swipeDirection="right">
      {toasts.map((toast) => (
        <Root
          key={toast.id}
          className={`grid grid-cols-[auto_max-content] items-center gap-x-4 rounded-lg border p-4 shadow-lg data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-transform data-[swipe=cancel]:duration-200 data-[swipe=cancel]:ease-out ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
          open={toast.open}
          onOpenChange={() => hideToast(toast.id)}
          duration={5000}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <XCircle size={20} className="flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => hideToast(toast.id)}
            className={`flex-shrink-0 cursor-pointer rounded-full p-2 transition-colors ${
              toast.type === 'success'
                ? 'hover:bg-green-100 dark:hover:bg-green-800/30'
                : 'hover:bg-red-100 dark:hover:bg-red-800/30'
            }`}
          >
            <X size={16} />
          </button>
        </Root>
      ))}
      <Viewport className="fixed right-4 bottom-4 z-50 flex w-96 max-w-[100vw] flex-col gap-3 outline-none" />
    </Provider>
  );
}
