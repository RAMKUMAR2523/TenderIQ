"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationAsRead } from "@/app/actions/notifications";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border rounded-lg shadow-lg z-50 p-4">
          <h3 className="font-semibold text-sm mb-3">Notifications ({unreadCount})</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notifications.</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-2 rounded text-sm ${n.isRead ? 'opacity-70' : 'bg-slate-100 dark:bg-slate-800'}`}
                  onClick={() => handleRead(n.id)}
                >
                  <p className="font-medium text-xs">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
