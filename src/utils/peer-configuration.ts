let peerConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.services.mozilla.com',
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
      ],
    },
  ],
};

export default peerConfiguration;
