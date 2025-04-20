import React, { useEffect, useRef, useState } from 'react';
import {
  CallClient,
  LocalVideoStream,
  VideoStreamRenderer
} from '@azure/communication-calling';

const VideoCall = ({ userId, token, groupId }) => {
  const callAgentRef = useRef(null);
  const callRef = useRef(null);
  const [status, setStatus] = useState("Joining...");
  const [localVideoElement, setLocalVideoElement] = useState(null);
  const [remoteVideos, setRemoteVideos] = useState([]);

  useEffect(() => {
    const joinCall = async () => {
      try {
        const callClient = new CallClient();
        const tokenCredential = {
          getToken: async () => ({ token }),
          dispose: () => {}
        };

        const deviceManager = await callClient.getDeviceManager();
        await deviceManager.askDevicePermission({ audio: true, video: true });

        const cameras = await deviceManager.getCameras();
        const microphones = await deviceManager.getMicrophones();
        const selectedMic = microphones[0];

        const localVideoStream = new LocalVideoStream(cameras[0]);
        const renderer = new VideoStreamRenderer(localVideoStream);
        const view = await renderer.createView();
        setLocalVideoElement(view.target);

        if (!callAgentRef.current) {
          const callAgent = await callClient.createCallAgent(tokenCredential, {
            displayName: "React User"
          });
          callAgentRef.current = callAgent;

          const call = await callAgent.join({ groupId }, {
            audioOptions: {
              muted: false,
              microphone: selectedMic
            },
            videoOptions: { localVideoStreams: [localVideoStream] }
          });

          callRef.current = call;
          setStatus("In call!");

          const renderRemoteStream = async (stream) => {
            if (stream.isAvailable) {
              const remoteRenderer = new VideoStreamRenderer(stream);
              const remoteView = await remoteRenderer.createView();
              setRemoteVideos((prev) => [...prev, remoteView.target]);
            }

            stream.on('availabilityChanged', async () => {
              if (stream.isAvailable) {
                const remoteRenderer = new VideoStreamRenderer(stream);
                const remoteView = await remoteRenderer.createView();
                setRemoteVideos((prev) => [...prev, remoteView.target]);
              }
            });
          };

          call.on('remoteParticipantsUpdated', async (e) => {
            const newParticipants = e.added;
            for (const participant of newParticipants) {
              participant.videoStreams.forEach(renderRemoteStream);
              participant.on('videoStreamsUpdated', (event) => {
                event.added.forEach(renderRemoteStream);
              });
            }
          });
        }
      } catch (error) {
        console.error("Join call error:", error);
        setStatus("Failed to join call: " + error.message);
      }
    };

    joinCall();

    return () => {
      if (callAgentRef.current) {
        callAgentRef.current.dispose();
        callAgentRef.current = null;
      }
    };
  }, [token, groupId]);

  return (
    <div>
      <h2>{status}</h2>
      <p>Group ID: {groupId}</p>
      <p>User ID: {userId}</p>

      <div>
        <h3>Local Video</h3>
        <div ref={(el) => {
          if (el && localVideoElement) {
            el.innerHTML = '';
            el.appendChild(localVideoElement);
          }
        }} />
      </div>

      <div>
        <h3>Remote Participants</h3>
        {remoteVideos.map((videoEl, idx) => (
          <div key={idx} ref={(el) => {
            if (el && videoEl) {
              el.innerHTML = '';
              el.appendChild(videoEl);
            }
          }} style={{ marginTop: '10px' }} />
        ))}
      </div>
    </div>
  );
};

export default VideoCall;
