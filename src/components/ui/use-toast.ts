'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(toasts: Toast[]) => void> = [];
let memoryToasts: Toast[] = [];

function addToast(toast: Omit<Toast, 'id'>) {
  const id = genId();
  const newToast = { ...toast, id };
  memoryToasts = [...memoryToasts, newToast];
  listeners.forEach((l) => l(memoryToasts));

  const duration = toast.duration ?? 3000;
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

function removeToast(id: string) {
  memoryToasts = memoryToasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(memoryToasts));
}

export function toast(props: Omit<Toast, 'id'> | string) {
  if (typeof props === 'string') {
    return addToast({ description: props });
  }
  return addToast(props);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const dismiss = useCallback((id: string) => removeToast(id), []);

  return { toasts, toast, dismiss };
}
