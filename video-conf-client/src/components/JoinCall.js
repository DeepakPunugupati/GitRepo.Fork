import React, { useState } from 'react';
import VideoCall from './VideoCall';

const JoinCall = () => {
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [groupId, setGroupId] = useState('');
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (userId && token && groupId) {
      setJoined(true);
    }
  };

  if (joined) {
    return <VideoCall userId={userId} token={token} groupId={groupId} />;
  }

  return (
    <div>
      <input placeholder="ACS User ID" value={userId} onChange={(e) => setUserId(e.target.value)} /><br />
      <input placeholder="Access Token" value={token} onChange={(e) => setToken(e.target.value)} /><br />
      <input placeholder="Group Call ID" value={groupId} onChange={(e) => setGroupId(e.target.value)} /><br />
      <button onClick={handleJoin}>Join Call</button>
    </div>
  );
};

export default JoinCall;
