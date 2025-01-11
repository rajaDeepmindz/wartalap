import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { isMobile } from "react-device-detect";

// Generate a random ID
function randomID(len = 20) {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Extract URL parameters
function getUrlParams(url = window.location.href) {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return urlParams;
}

export default function App() {
  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const callContainerRef = useRef(null); // Ref for call container
  const roomID = getUrlParams().get("roomID") || randomID(20);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initializeMeeting = async () => {
      const appID = 217702146; // Replace with your ZEGOCLOUD app ID
      const serverSecret = "f4fb52729ce1a5d339391b4e774290e0"
      if (!appID || !serverSecret) {
        console.error("Missing App ID or Server Secret.");
        return;
      }

      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        randomID(20), // User ID
        "User_" + randomID(20) // User Name
      );

      // Create and join the room
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: callContainerRef.current,
        sharedLinks: [
          {
            name: "Personal link",
            url:
              `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${encodeURIComponent(
                roomID
              )}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // Use GroupCall or OneONoneCall
        },
        showRoomTimer:true,
    

      });
      zp.startRecording({
        container: callContainerRef.current,
        onError: (error) => console.error("Recording error:", error),
      });
      zp.stopRecording();
    };

    initializeMeeting();
  }, [roomID]);

  return (
   <>
      {isMobile ? (
         <div className="flex items-center justify-center w-full h-screen">
         <div
           ref={callContainerRef}
           className="w-full h-screen sm:h-[calc(100vh-4rem)] sm:w-[calc(100vw-2rem)] p-2 sm:p-4 bg-gray-100 rounded-md shadow-lg"
         ></div>
       </div>
      ) : (
        <div
      className="myCallContainer"
      ref={callContainerRef}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
      )}
    </>
  );
}








