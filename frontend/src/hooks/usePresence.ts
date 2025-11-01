import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserProfile } from '../types/user';

let socket: Socket | null = null;

export function usePresence(token: string | null) {
  const [onlineUsers, setOnlineUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!token) {
      socket?.disconnect();
      socket = null;
      setOnlineUsers([]);
      return;
    }

    socket = io('http://localhost:4000', {
      auth: {
        token
      }
    });

    socket.on('presence:update', (payload: UserProfile[]) => {
      setOnlineUsers(payload);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [token]);

  return onlineUsers;
}
