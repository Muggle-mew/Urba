import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store/useNotificationStore';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
            className="pointer-events-auto min-w-[300px]"
          >
            <div className={clsx(
              "flex items-start p-4 rounded shadow-lg border backdrop-blur-md",
              notification.type === 'success' && "bg-emerald-900/80 border-emerald-500 text-emerald-100",
              notification.type === 'error' && "bg-red-900/80 border-red-500 text-red-100",
              notification.type === 'warning' && "bg-amber-900/80 border-amber-500 text-amber-100",
              notification.type === 'info' && "bg-blue-900/80 border-blue-500 text-blue-100"
            )}>
              <div className="shrink-0 mr-3 mt-0.5">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {notification.type === 'error' && <XCircle className="w-5 h-5" />}
                {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                {notification.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 text-sm font-medium">
                {notification.message}
              </div>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 ml-3 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
