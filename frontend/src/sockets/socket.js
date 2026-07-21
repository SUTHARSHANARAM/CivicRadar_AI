import { WS_URL } from '../utils/config';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = [];
    }

    connect() {
        if (this.socket) return;

        console.log("Connecting to WebSocket at", WS_URL);
        try {
            this.socket = new WebSocket(`${WS_URL}/ws`);

            this.socket.onopen = () => {
                console.log("WebSocket Connected");
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.listeners.forEach(callback => callback(data));
                } catch (err) {
                    console.error("Socket message error", err);
                }
            };

            this.socket.onclose = () => {
                console.log("WebSocket Disconnected");
                this.socket = null;
            };

            this.socket.onerror = (err) => {
                console.log("WebSocket Notice: Offline or connecting...");
            };
        } catch (e) {
            console.error("WebSocket init failed:", e);
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }
}

export const socketService = new SocketService();
