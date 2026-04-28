"use client";

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const getWsUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== 'undefined') {
        const host = window.location.origin;
        if (host.includes('localhost')) return 'http://localhost:3001';
        return host;
    }
    return 'http://localhost:3001';
};

export function useWebSocket<T>(eventName: string, onMessage?: (payload: T) => void) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [data, setData] = useState<T | null>(null);
    const [connected, setConnected] = useState(false);
    
    // Store latest callback to avoid re-subscribing on every render
    const onMessageRef = useRef(onMessage);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const wsUrl = getWsUrl();
        const socketIo = io(wsUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        setSocket(socketIo);

        socketIo.on('connect', () => {
            console.log('WS Connected');
            setConnected(true);
        });

        socketIo.on('disconnect', () => {
            console.log('WS Disconnected');
            setConnected(false);
        });

        socketIo.on(eventName, (payload: T) => {
            console.log(`Received ${eventName} event:`, payload);
            setData(payload);
            if (onMessageRef.current) {
                onMessageRef.current(payload);
            }
        });

        return () => {
            socketIo.disconnect();
        };
    }, [eventName]);

    return { socket, data, connected };
}
