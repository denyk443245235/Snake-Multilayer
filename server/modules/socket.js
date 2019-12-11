module.exports = function (io) {
    let conectedCount = 0;
    var BallCoordinate

    var rooms = [];
    var users = 0;
    var ident = [];
    var colors = [
        'rgb(244, 86, 244)',
        'rgb(244, 250, 49)',
        'rgb(251, 115, 201)',
        'rgb(154, 59, 97)'
    ];
    var snakeSize = 10;
    var fieldSize = 100;

    io.on('connection', (socket) => {
        console.log(socket.id);
        ident.push(socket.id);
        socket.emit('auth');
        var roomName = '';
        var status;
        io.sockets.emit('add_room', rooms);
        socket.on('join-game', (id) => {

            socket.emit('statec-connection', 'You connected');
            socket.on('room_connection', (data) => {
                socket.emit('wait_other_players');
                roomName = data.room;
                status = data.status;
                socket.join(roomName);
                users++;
       
                socket.emit('setId',socket.id);
                if (io.sockets.adapter.rooms[roomName].length == 1) {
                    socket.emit('select_size')
                }
                if (io.sockets.adapter.rooms[roomName].length >= 2) {
                    var usercount = users;
                    io.sockets.to(roomName).emit('start_game');
                    socket.to(roomName).emit('set_status', status);
                    io.sockets.to(roomName).emit('setSnakeSize', snakeSize);
                    io.sockets.to(roomName).emit('setFiledSize', fieldSize);
                    io.sockets.to(roomName).emit('add_players', ident);
                    io.sockets.to(roomName).emit('setBallSize', snakeSize);
                    io.sockets.to(roomName).emit('newConnection');
                }
            })

        });
        socket.on('success_login', (status) => {
            socket.emit('snake_setting', status);
            io.sockets.emit('add_room', rooms);
        })
        socket.on('return_game', () => {
            socket.emit('restartSnake');
            socket.emit('setFiledSize', fieldSize);
            socket.emit('setSnakeSize', snakeSize);
            socket.to(roomName).emit('restartScore');
            socket.broadcast.to(roomName).emit('restartEnemyScore');
        })
        socket.on('addScore', (score) => {
            socket.broadcast.to(roomName).emit('setEnemyScore', score);
        });
        socket.on('snakeMove', (request) => {
            io.sockets.emit('setSnakeSize', snakeSize);
            socket.broadcast.to(roomName).emit('newCoordinate', request);
        })

        socket.on('genricBall', () => {
            var color = colors[Math.floor(Math.random() * (colors.length - 0)) + 0];
            if (!conectedCount) {
                var rand = (min, max, num) => {
                    return Math.floor(Math.floor(Math.random() * (max - min + 1) + min) / num) * num;
                }
                coordinate = {
                    x: rand(fieldSize, 1, 20),
                    y: rand(fieldSize, 1, 20)
                }
            }
            conectedCount++;
            io.sockets.to(roomName).emit('ball', { coordinate: coordinate, color: color });
        })
        socket.on('changeBallCoordinate', () => {
            var color = colors[Math.floor(Math.random() * (colors.length - 0)) + 0];
            var rand = (min, max, num) => {
                return Math.floor(Math.floor(Math.random() * (max - min + 1) + min) / num) * num;
            }
            coordinate = {
                x: rand(fieldSize, 1, 20),
                y: rand(fieldSize, 1, 20)
            }
            io.sockets.to(roomName).emit('ballNew', { coordinate: coordinate, color: color });
        })
        socket.on('set_size', (size) => {
            snakeSize = size.snake;
            fieldSize = size.field;

            io.sockets.to(roomName).emit('wait_other_players');
        });
        socket.on('create_room', (room) => {
            rooms.push(room);
            io.sockets.emit('add_room', rooms);
        })
        socket.on('disconnect', function () {
            users--;
            socket.leave(roomName);
            console.log('user disconnected');
        });
        socket.on('back_to_auth',()=>{
console.log(socket.id);
       for(var i = 0;i<ident.length;i++){
           if(ident[i] == socket.id){
            ident.splice(i,1);
           }

       }
      console.log(ident);
            io.sockets.to(roomName).emit('add_players', ident);
            socket.emit('auth');
        })
    });

}