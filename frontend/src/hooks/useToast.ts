import { useState, useEffect, useCallback } from "react";

interface ToastState {
  message: string;
  visible: boolean;
}

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, duration]);

  return { toast, showToast };
}
