const socket = io()
const videoGrid = document.getElementById('video-grid')
const chatList = document.getElementById('chat-list')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

const sendButton = document.getElementById('send');
const msg = document.getElementById('msg');

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    console.log('user called: ' + call)
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  myPeer.on('connection', conn => {
    const li = document.createElement('li')
    conn.on('data', data => {
      console.log('Received', data);
      addMessage(li, data)
    });
    sendButton.addEventListener('click', () => {
      conn.send(msg.value)
    })
  })

  socket.on('user-connected', userId => {
    console.log('user joined room with id: ' + userId);
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log('roomId: ' + ROOM_ID + ' userPeerId: ' + id);
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  var conn = myPeer.connect(userId);
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  const li = document.createElement('li')
  conn.on('data', function(data) {
    console.log('Received', data);
    addMessage(li, data)
  });

  sendButton.addEventListener('click', () => {
    conn.send(msg.value)
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function addMessage(li, text) {
  // li.innerHtml = text;
  li.appendChild(document.createTextNode(text))
  li.setAttribute('name', text)
  chatList.appendChild(li);
}