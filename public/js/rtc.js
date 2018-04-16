// rtc.js

'use strict';

const socket = io.connect('https://localhost:3000');
const caller = new RTCPeerConnection();

const constraints = {audio: true, video: true};
navigator.mediaDevices.getUserMedia(constraints).then(mediaStream => {
  const video = document.querySelector('#localVideo');
  video.srcObject = mediaStream;
  caller.addStream(mediaStream);
}).catch(err => {
  console.log(err.name + ': ' + err.message);
});

socket.on('connect', () => {
  console.log('socket.io connected!');

  //Listening for call
  socket.on('call', msg => {
    // console.log('call message: ' + msg);
    console.log(JSON.parse(msg));
    caller.setRemoteDescription( new RTCSessionDescription(JSON.parse(msg)));
    caller.createAnswer().then(call => {
      caller.setLocalDescription(new RTCSessionDescription(call));
      socket.emit('answer', JSON.stringify(call));
    });
  });

  //Listening for answer to offer sent to remote peer
  socket.on('answer', answer => {
    console.log('answer received: ' + answer);
    caller.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(answer)));
  });

  //Listening for candidate
  socket.on('candidate', msg => {
    console.log('candidate received');
    console.log(msg);
    caller.addIceCandidate(new RTCIceCandidate(JSON.parse(msg).candidate));
  });


});

const makeCall = () => {
  caller.createOffer().then(desc => {
    // emit message ‘call’ with ‘hello’ as value
    console.log('offer made');
    caller.setLocalDescription(new RTCSessionDescription(desc));
    socket.emit('call', JSON.stringify(desc));
  });
};

document.querySelector('#btnMakeCall').addEventListener('click', makeCall);

//onaddstream handler to receive remote feed and show in remoteview video element
caller.onaddstream = evt => {
  console.log('onaddstream called');
  document.querySelector('#remoteVideo').srcObject = evt.stream;
};

caller.onicecandidate = evt => {
  if (!evt.candidate) return;
  console.log('onicecandidate called');
  onIceCandidate(evt);
};
//Send the ICE Candidate to the remote peer
const onIceCandidate = (evt) => {
  socket.emit('candidate', JSON.stringify({'candidate': evt.candidate}));
};