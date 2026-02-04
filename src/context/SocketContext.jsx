import React, { createContext, useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useAuth } from "./AuthContext";
import api from "../utils/api";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null); // We keep 'socket' name for compatibility, but it's a pusher channel

  useEffect(() => {
    if (user) {
      // Enable Pusher logging - useful for debugging
      Pusher.logToConsole = false; // Disable in prod

      // Initialize Pusher
      const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY || "KEY", {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER || "ap2",
        authEndpoint: `${import.meta.env.VITE_API_URL}/api/chat/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      });

      const userChannelName = `private-user-${user._id || user.id}`;
      const channels = [];

      // Subscribe to User Channel
      const userChannel = pusher.subscribe(userChannelName);
      channels.push({ name: userChannelName, channel: userChannel });

      // Subscribe to Staff Channel if applicable
      if (
        ["admin", "manager", "receptionist", "hotel_staff"].includes(user.role)
      ) {
        const staffChannelName = "private-staff";
        const staffChannel = pusher.subscribe(staffChannelName);
        channels.push({ name: staffChannelName, channel: staffChannel });
      }

      userChannel.bind("pusher:subscription_succeeded", () => {
        console.log("✅ Pusher User Subscribed:", userChannelName);
      });

      // Virtual Socket Interface
      const virtualSocket = {
        bind: (eventName, callback) => {
          channels.forEach(({ channel }) => {
            channel.bind(eventName, callback);
          });
        },
        unbind: (eventName) => {
          channels.forEach(({ channel }) => {
            channel.unbind(eventName);
          });
        },
        emit: (eventName, data) => {
          // Client-side emit not typically used in this push-only notification usage,
          // but if we needed it, we'd call an API.
          console.warn(
            "Client emit not implemented in virtual socket",
            eventName,
          );
        },
      };

      setSocket(virtualSocket);

      return () => {
        console.log("Unsubscribing Pusher...");
        channels.forEach(({ name }) => pusher.unsubscribe(name));
        pusher.disconnect();
        setSocket(null);
      };
    }
  }, [user?._id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
