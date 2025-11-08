import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Disconnect socket if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setConnected(true);
      // Join with user ID
      newSocket.emit("join", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Listen for article approval
  useEffect(() => {
    if (!socket || !user) return;

    const handleArticleApproved = (data) => {
      console.log("📢 Article approved:", data);
      toast.success(
        <div>
          <strong>Article Approved! 🎉</strong>
          <p className="text-sm mt-1">{data.message}</p>
        </div>,
        {
          autoClose: 5000,
          position: "top-right",
        }
      );

      // Trigger a custom event that components can listen to
      window.dispatchEvent(
        new CustomEvent("articleStatusChanged", { detail: data })
      );
    };

    const handleArticleRejected = (data) => {
      console.log("📢 Article rejected:", data);
      toast.warning(
        <div>
          <strong>Article Needs Revision 📝</strong>
          <p className="text-sm mt-1">{data.message}</p>
          <p className="text-xs mt-1 text-gray-600">{data.comment}</p>
        </div>,
        {
          autoClose: 7000,
          position: "top-right",
        }
      );

      // Trigger a custom event that components can listen to
      window.dispatchEvent(
        new CustomEvent("articleStatusChanged", { detail: data })
      );
    };

    socket.on(`articleApproved:${user.id}`, handleArticleApproved);
    socket.on(`articleRejected:${user.id}`, handleArticleRejected);

    return () => {
      socket.off(`articleApproved:${user.id}`, handleArticleApproved);
      socket.off(`articleRejected:${user.id}`, handleArticleRejected);
    };
  }, [socket, user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
