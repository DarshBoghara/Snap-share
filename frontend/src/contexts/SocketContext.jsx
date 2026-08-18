import React, { createContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());
  const heartbeatIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(1000);

  const connectSocket = () => {
    const token = localStorage.getItem('access_token');
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.port === '5173' ? `${window.location.hostname}:8000` : window.location.host;
    const wsUrl = import.meta.env.VITE_WS_URL || `${wsProtocol}//${wsHost}/api/v1/ws?token=${encodeURIComponent(token)}`;

    try {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectDelayRef.current = 1000;

        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              event: 'heartbeat',
              data: { timestamp: new Date().toISOString() }
            }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { event: eventName, data } = parsed;

          if (listenersRef.current.has(eventName)) {
            listenersRef.current.get(eventName).forEach(cb => cb(data, parsed));
          }
        } catch (err) {
          console.error('Error parsing incoming WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

        const currentToken = localStorage.getItem('access_token');
        if (user && currentToken) {
          const nextDelay = reconnectDelayRef.current;
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, nextDelay);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket connection notice:', error);
      };
    } catch (err) {
      console.error('Failed to create WebSocket instance:', err);
    }
  };

  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [user]);

  const sendEvent = (event, data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data }));
    } else {
      console.warn('Cannot send WS event: Socket is not open.');
    }
  };

  const subscribe = (event, callback) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    return () => {
      if (listenersRef.current.has(event)) {
        listenersRef.current.get(event).delete(callback);
      }
    };
  };

  return (
    <SocketContext.Provider value={{ isConnected, sendEvent, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};
