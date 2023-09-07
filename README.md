# 오픈 멀티 채팅방 웹소켓 (NodeJS & Socket.io)

### Test preview
  ```
  pm2 start ecosystem.config.js
  ```

### Socket.io
- PHP와 REACT 렌더링 차이로 조금 다르게 작동합니다.
- 로컬테스트 -> worker.js | PHP 테스트 -> Web_worker.js | REACT -> react_worker.js



### Description (Client)
- 소켓을 선언하고 클라이언트와 서버간 연결을 확인합니다.
- <join_room> 채팅방으로 입장합니다. 
##### Web
  ```
  //web
  <script src="{link:port}/socket.io/socket.io.js"></script>


  //http -> ws | https -> wss
  //소켓에 입장하면서 방에 바로 입장합니다.
  var socket = io('ws://localhost:3000', {
        transports: ['websocket', 'polling'],
        query: {
            name: nickname,      // 닉네임
            room: searchParams,  // 방 고유번호
        },
    })

  socket.emit('join_room', {
        msg: '클라이언트 첫 입장',
        type: 0,
    });
  ```
##### React
  ```
  //React
  yarn add socket.io-client
  ```
  
  
