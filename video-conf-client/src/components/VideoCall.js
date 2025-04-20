import React, { useRef, useState } from 'react';
import {
  CallClient,
  LocalVideoStream,
  VideoStreamRenderer
} from '@azure/communication-calling';

const VideoCall = ({ userId, token, groupId }) => {
  const callAgentRef = useRef(null);
  const callRef = useRef(null);
  const localVideoRef = useRef(null);
  const [status, setStatus] = useState("Click join to start");
  const [remoteVideos, setRemoteVideos] = useState([]);
  const [isJoining, setIsJoining] = useState(false);

  const joinCall = async () => {
    setIsJoining(true);
    setStatus("Joining...");

    try {
      const callClient = new CallClient();
      const tokenCredential = {
        getToken: async () => ({ token }),
        dispose: () => {}
      };

      const deviceManager = await callClient.getDeviceManager();
      await deviceManager.askDevicePermission({ audio: true }); // AUDIO ONLY by default

      const microphones = await deviceManager.getMicrophones();
      const selectedMic = microphones[0];

      const useVideo = window.innerWidth > 768; // Only enable video for desktop/laptop

      let localVideoStream = null;

      if (useVideo) {
        const cameras = await deviceManager.getCameras();
        const selectedCamera = cameras[0];
        localVideoStream = new LocalVideoStream(selectedCamera);

        const renderer = new VideoStreamRenderer(localVideoStream);
        const view = await renderer.createView();

        if (localVideoRef.current && !localVideoRef.current.hasChildNodes()) {
          localVideoRef.current.appendChild(view.target);
        }
      }

      if (!callAgentRef.current) {
        const callAgent = await callClient.createCallAgent(tokenCredential, {
          displayName: "React User"
        });
        callAgentRef.current = callAgent;
      }

      const call = await callAgentRef.current.join({ groupId }, {
        audioOptions: {
          muted: false,
          microphone: selectedMic
        },
        ...(useVideo && {
          videoOptions: {
            localVideoStreams: [localVideoStream]
          }
        })
      });

      callRef.current = call;
      setStatus(useVideo ? "In call (video)" : "In call (audio only)");

      // Handle remote video
      call.on('remoteParticipantsUpdated', (e) => {
        e.added.forEach(participant => {
          participant.on('videoStreamsUpdated', (ev) => {
            ev.added.forEach(async stream => {
              if (stream.isAvailable) {
                const remoteRenderer = new VideoStreamRenderer(stream);
                const remoteView = await remoteRenderer.createView();
                setRemoteVideos(prev => [...prev, remoteView.target]);
              }
            });
          });

          participant.videoStreams.forEach(async stream => {
            if (stream.isAvailable) {
              const remoteRenderer = new VideoStreamRenderer(stream);
              const remoteView = await remoteRenderer.createView();
              setRemoteVideos(prev => [...prev, remoteView.target]);
            }
          });
        });
      });

    } catch (err) {
      console.error("Join error:", err);
      setStatus("Failed to join");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Azure Video Conference</h1>
      <h2>{status}</h2>
      <p><strong>Group ID:</strong> {groupId}</p>
      <p><strong>User ID:</strong> {userId}</p>

      <button
        onClick={joinCall}
        disabled={isJoining}
        style={{ padding: '10px 20px', margin: '10px 0' }}
      >
        {isJoining ? "Joining..." : "Join Call"}
      </button>

      <div>
        <h3>Local Video</h3>
        <div
          ref={localVideoRef}
          style={{ width: "320px", height: "240px", background: "#ccc" }}
        />
      </div>

      <div>
        <h3>Remote Participants</h3>
        {remoteVideos.map((videoEl, idx) => (
          <div
            key={idx}
            ref={(el) => {
              if (el && videoEl && !el.hasChildNodes()) {
                el.appendChild(videoEl);
              }
            }}
            style={{ width: '320px', height: '240px', marginTop: '10px', background: '#eee' }}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoCall;
