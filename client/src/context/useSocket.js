import { createContext, useContext } from "react";

// The context itself
export const SocketContext = createContext(null);

// The custom hook
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};