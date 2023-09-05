// 단일 프로세스 처리시

const express = require('express');
const moment = require("moment");
const app = express();
const { readFileSync } = require("fs");
const { instrument } = require("@socket.io/admin-ui");
var https = require('https');

const server = https.createServer({
    cors: {
        credentials: true,
    },
    cert: readFileSync("/usr/local/nginx/conf/ssl/chat.yeoguga.com.crt", "utf8"),
    key: readFileSync("/usr/local/nginx/conf/ssl/chat.yeoguga.com.key", "utf8"),
    // path: "/test-chatting/" 
}, app);
const { Server } = require("socket.io");
const io = new Server(server);

//admin UI 설정
//https://admin.socket.io/ 확인 가능
instrument(io, {
    auth: false,
    mode: "development",
});


//소켓 연결관리
io.on('connection', (socket) => {
    //socket.handshake.query 클라이언트에서 보내는 파라미터 값
    console.log('소켓 연결 ===> ', socket.handshake.query.name, ' 방 입장 ===> ', socket.handshake.query.room);

    //룸 이름 받아서 채팅방에 입장시킴
    // socket.join(socket.handshake.query.room);
    //소켓 연결, 채팅방 입장 시키기
    socket.on('join_room', (msg) => {
        console.log('client id', socket.id);
        //방 입장
        socket.join(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;

        console.log('속한 방 접속자 수', size);

        // 첫 접속시 알림 전달 (첫 접속 인지는 client에서 넘어오는 값으로 확인)
        // type == 0 ? 첫 입장 : 기본 입장
        const type = msg.type; // type 값은 클라이언트에서 넘어온 값이어야 합니다.
        const mem_cnt = msg.mem_cnt; // 현재인원

        if (type == 0) {
            // 첫 접속일 때
            io.to(socket.handshake.query.room).emit('chatting', {
                msg: socket.handshake.query.name + ' 님이 입장하셨습니다.',
                type: 'notice',
                size: mem_cnt,
            });
        } else {
            // 기본 입장일 때는 알림X
            /*
            io.to(socket.handshake.query.room).emit('chatting', {
                msg: socket.handshake.query.name + '님이 입장하셨습니다.',
                type: 'notice',
                size: size,
            });
            */
        }
        /*
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + '님이 입장하셨습니다.',
            type: 'notice',
            size: size,
        });
        */
    });

    //채팅방 메세지 받고 전체 클라이언트에 전달
    socket.on('chatting', (msg) => {
        console.log('...,.,', msg);
        //현재 방의 접속 인원수 확인(읽음, 안읽음 처리용)
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        var at = moment().format('a') === 'am' ? '오전' : '오후';
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: msg,
            name: socket.handshake.query.name,
            type: 'chat',
            time: `${at} ${moment().format('hh:mm')}`,
            view: size,
        });
    });

    //채팅방 나가기 전달받음
    socket.on('leave_room', (msg) => {
        //완전히 나가는 건지 그냥 소켓을 나가는 건지 구분 필요
        socket.leave(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        const mem_cnt = msg.mem_cnt - 1; // 현재인원
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + ' 님이 퇴장하셨습니다.',
            type: 'notice',
            size: mem_cnt,
        });
    });

    //채팅방 강퇴 전달받음
    socket.on('exit_room', (msg) => {
        const out_name = msg.name; // 강퇴당한 사람 이름
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        const mem_cnt = msg.mem_cnt - 1; // 현재인원
        io.to(socket.handshake.query.room).emit('chatting', {
            msg: out_name + ' 님을 챗방에서 내보냈습니다.',
            type: 'notice',
            size: mem_cnt,
        });
    });


    //소켓 연결 해제
    socket.on('disconnect', (reason) => {
        console.log(reason);
        //완전히 나가는 건지 그냥 소켓을 나가는 건지 구분 필요
        socket.leave(socket.handshake.query.room);
        //현재 방의 접속 인원수 확인
        var size = io.sockets.adapter.rooms.get(socket.handshake.query.room)?.size;
        console.log('현재 접속 인원수 ', size);
        /*io.to(socket.handshake.query.room).emit('chatting', {
            msg: socket.handshake.query.name + '님이 퇴장하셨습니다.',
            type: 'notice',
            size: size,
        });*/
    });

});

app.use('/', (res, req) => {
    console.log(moment().format('HH:mm:ss'));
})



server.listen(4000, () => {
    console.log(server);
    console.log('listening on *:4000');
});
