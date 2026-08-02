import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: { id: string; title: string; message: string; type: AppNotification['type']; duration?: number }[];
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addToast: (title: string, message: string, type?: AppNotification['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: 'welcome',
      title: 'Welcome to AppForge AI',
      message: 'Create a new project or open one from the dashboard to start design compilation.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    }
  ],
  toasts: [],
  addNotification: (title, message, type = 'info') => set((state) => ({
    notifications: [
      {
        id: Math.random().toString(36).substring(2, 9),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),
  addToast: (title, message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type, duration }]
    }));
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      }, duration);
    }
  },
  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));
