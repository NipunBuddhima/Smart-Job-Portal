import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect();
        return null;
      });
      return;
    }

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('register_user', user.id);
    });

    newSocket.on('new_notification', (notification: any) => {
      if (notification.type === 'success') toast.success(notification.message);
      else if (notification.type === 'warning') toast.error(notification.message);
      else toast(notification.message, { icon: '🔔' });
    });

    return () => {
      newSocket.off('connect');
      newSocket.off('new_notification');
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);