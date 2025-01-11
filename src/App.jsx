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
  const [isMobileDevice, setIsMobileDevice] = useState(isMobile);
  const callContainerRef = useRef(null); // Ref for call container
  const roomID = getUrlParams().get("roomID") || randomID(5);

  useEffect(() => {
    // Function to ask for permissions
    const requestPermissions = async () => {
      try {
        const constraints = {
          video: {
            facingMode: { exact: "environment" },
            width: { ideal: 1280 }, // Set ideal width (for mobile)
            height: { ideal: 720 }, // Set ideal height (for mobile)
          },
          audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Permissions granted", stream);

        // Optionally, attach the stream to a video element
        const videoElement = document.getElementById("video-element");
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (error) {
        console.error("Permission denied or error occurred:", error);
        alert("Please grant permissions for the camera and microphone.");
      }
    };

    // Call the permission request on mount
    if (navigator.mediaDevices) {
      requestPermissions();
    } else {
      console.error("Media devices not supported.");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initializeMeeting = async () => {
    const appID = 217702146; // Replace with your ZEGOCLOUD app ID
    const serverSecret = "f4fb52729ce1a5d339391b4e774290e0"; // Replace with your server secret

    if (!appID || !serverSecret) {
      console.error("Missing App ID or Server Secret.");
      return;
    }

    // Generate Kit Token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      randomID(5), // User ID
      "User_" + randomID(3) // User Name
    );

    // Create and join the room
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Add room join logic
    zp.joinRoom({
      container: callContainerRef.current,
      sharedLinks: [
        {
          name: "Personal link",
          url: `${window.location.protocol}//${window.location.host}${
            window.location.pathname
          }?roomID=${encodeURIComponent(roomID)}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // Use GroupCall or OneONoneCall
      },
      showRoomTimer: true,
      onJoinRoom: () => {
        console.log("Joined the room successfully");
        if (isMobileDevice) {
          console.log("Mobile detected, enabling mobile settings");
        }
      },
    });

    // Start Recording
    zp.startRecording({
      container: callContainerRef.current,
      onError: (error) => console.error("Recording error:", error),
    });

    // Stop Recording after a timeout (you can adjust this logic as needed)
    setTimeout(() => {
      zp.stopRecording();
    }, 10000); // Stop recording after 10 seconds (for example)
  };

  useEffect(() => {
    initializeMeeting();
  }, [roomID]);

  return (
    <>
      {/* Check if it's a mobile device or desktop and render different UI accordingly */}
      {isMobileDevice ? (
        // Mobile UI
        <div className="flex items-center justify-center w-[100vw] h-screen ">
          <div
            ref={callContainerRef}
            className="w-full h-screen sm:h-[calc(100vh-4rem)] sm:w-[calc(100vw-2rem)] p-2 sm:p-4 bg-white rounded-md shadow-lg"
          >
            {/* Mobile call UI here */}
          </div>
        </div>
      ) : (
        // Desktop UI
        <div className="flex flex-col items-center justify-center w-[100vw] h-screen">
          <div
            ref={callContainerRef}
            className="myCallContainer w-full h-full p-4 bg-gray-200 rounded-lg shadow-xl"
          >
            {/* Desktop call UI here */}
          </div>
        </div>
      )}
    </>
  );
}
