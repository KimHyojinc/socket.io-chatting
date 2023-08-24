// 단일 프로세스 처리시

const express = require('express');
const moment = require("moment");
const app = express();
const http = require('http');
const server = http.createServer(app, {
    cors: {
        credentials: true,
    },
});
const { setupWorker } = require("@socket.io/sticky");
const { createAdapter } = require("@socket.io/cluster-adapter");
const { Server } = require("socket.io");
const io = new Server(server);

// // use the cluster adapter
// io.adapter(createAdapter());
// // setup connection with the primary process
// setupWorker(io);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/room', (req, res) => {
    res.sendFile(__dirname + '/room.html');
})

//io.emit() : 모든 클라이언트 전송
//broadcast.emit() : 전달자 제외 모든 클라이언트에게 전송
//io.to(id).emit() : 채팅방 내 사람에게만 전송

//소켓 연결관리
io.on('connection', (socket) => {
    //socket.handshake.query 클라이언트에서 보내는 파라미터 값
    console.log('소켓 연결 ===> ', socket.handshake.query.name, ' 방 입장 ===> ', socket.handshake.query.room);

    //룸 이름 받아서 채팅방에 입장시킴
    // socket.join(socket.handshake.query.room);
    //소켓 연결, 채팅방 입장 시키기
    socket.on('join_room', (msg) => {
        //방 입장
        socket.join(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;

        console.log('속한 방 접속자 수', size);
        console.log('속한 방 이름 확인', socket.rooms);

        // 첫 접속시 알림 전달 (첫 접속 인지는 client에서 넘어오는 값으로 확인)
        // type == 0 ? 첫 입장 : 기본 입장
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + '님이 입장하셨습니다.',
            type: 'notice',
            size: size,
        });
    })

    //채팅방 메세지 받고 전체 클라이언트에 전달
    socket.on('chatting', (msg) => {
        //현재 방의 접속 인원수 확인(읽음, 안읽음 처리용)
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: msg,
            name: socket.handshake.query.name,
            type: 'chat',
            time: moment().format('hh:mm'),
            view: size,
        });
    });

    //채팅방 나가기 전달받음
    socket.on('leave_room', (msg) => {
        //완전히 나가는 건지 그냥 소켓을 나가는 건지 구분 필요
        socket.leave(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + '님이 퇴장하셨습니다.',
            type: 'notice',
            size: size,
        });
    })

    //소켓 연결 해제
    socket.on('disconnect', () => {
        //완전히 나가는 건지 그냥 소켓을 나가는 건지 구분 필요
        socket.leave(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        console.log('현재 접속 인원수 ', size);
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + '님이 퇴장하셨습니다.',
            type: 'notice',
            size: size,
        });
    });

    //chat1 value의 모든 사용자에게 전송
    // socket.on('join_room', (msg) => {
    //     io.emit('chat1', msg);
    // });
});

// This will emit the event to all connected sockets
io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' });

server.listen(3000, () => {
    console.log('listening on *:3000');
});