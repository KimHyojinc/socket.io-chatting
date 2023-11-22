# 오픈 멀티 채팅방 웹소켓 (NodeJS & Socket.io)

### 여구가 프로젝트 필수 설치 요소
```
(서버 설치)
node.js // 서버 사양에 맞게 변경하여 사용해주셔도 무방합니다.
v16.20.2

pm2 // 해당 라이브러리를 통해 채팅 프로세스를 관리합니다.
npm install pm2 -g

yarn // 프로젝트 패키지 설정 명령어로 사용합니다.
npm install -g yarn


(여구가 채팅서버 설치 경로)
- cd /data/wwwroot/chat.yeoguga.com

1. 초기 프로젝트 재설정시 설치 경로 이동
2. 명령어를 통해 패키지를 새로 설치합니다. --> yarn install
3. 채팅서버의 프로세스를 시작합니다. --> pm2 start ecosystem.config.js

pm2 명령어를 통해 로그 및 통신 상태를 확인할 수 있습니다.
```

### Test preview
  ```
  pm2 start ecosystem.config.js
  ```

### Socket.io
- PHP와 REACT 렌더링 차이로 조금 다르게 작동합니다.
- 로컬테스트 -> worker.js | PHP 테스트 -> Web_worker.js | REACT -> react_worker.js


### Description (Server)
- watch setting (ecosystem.config.js)
  ```
  module.exports = {
    apps : [
      {
        name: 'chatting',
        script    : "./worker.js",
        max_memory_restart: '300M', // 메모리 300M 이상 넘으면 자동으로 restart 시킵니다
        watch: true,
      },
    ]
  };
  ```

### Description (Client)
- 소켓을 선언하고 클라이언트와 서버간 연결을 확인합니다.
- `join_room` : 채팅방으로 입장합니다.
  - web상에서 페이지 이동시 웹소켓이 자동 종료되지만 react는 페이지를 이동해도 종료되지 않습니다. disconnect()로 연결 해제를 명시합니다.
- `exit_room` :  채팅방에서 퇴장합니다.
- `chatting`  :  작성한 채팅 메세지를 전달합니다.


  
  ```
  //web
  <script src="{link:port}/socket.io/socket.io.js"></script>

  //react
  yarn add socket.io-client


  //http -> ws | https -> wss
  //소켓에 입장하면서 방에 바로 입장합니다.
  var socket = io('ws://localhost:3000', {
        transports: ['websocket', 'polling'],
        query: {
            name: nickname,      // 닉네임
            room: searchParams,  // 방 고유번호
        },
    })

  socket.io.on('connect', (msg) => {
    //소켓이 연결되었는지 확인합니다.
  });

  socket.io.on('disconnect', (msg) => {
    //소켓이 종료되었는지 확인합니다.
  });

  socket.io.on('error', (err) => {
    //소켓 연결시 오류를 출력합니다.
  });

  // <join_room> 
  // 클라이언트 -> 서버로 채팅방에 입장을 전달합니다.
  // 입장시 채팅방 첫 입장인지 기본 입장인지 확인이 필요합니다. (type 0: 첫 입장 | 1: 기본 입장)
  socket.emit('join_room', {
        msg: '클라이언트 첫 입장',
        type: 0,
    });

  // <exit_room>
  // 클라이언트 -> 서버로 채팅방 퇴장을 전달합니다.
  socket.on('exit_room', (msg)=> {
    //종료 이벤트 작성
  });
  ```
  
  
