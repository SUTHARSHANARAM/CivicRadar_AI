from fastapi import WebSocket
from typing import List
import logging

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logging.info(f"New WebSocket connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logging.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Iterate over copy to avoid issues if removing during iteration (though disconnect handles safe removal)
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logging.error(f"Error broadcasting to client: {e}")
                # Optional: self.disconnect(connection)

manager = ConnectionManager()
