// src/context/SocketProvider.jsx (or original filename)
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
// Import the context from the new file
import { SocketContext } from "./useSocket";

// Only SocketProvider is exported here
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

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

    return () => {
      newSocket.disconnect();
    };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // ... (rest of your useEffect logic remains here)
    if (!socket || !user) return;
    // ... (logic for handleArticleApproved and handleArticleRejected)
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
