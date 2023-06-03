const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors")
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const User = require("./models/userModel");

dotenv.config()

connectDB();
const app = express()

app.use(express.json()); // to accept json data




app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/frontend/build")));

    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
    );
} else {
    app.get('/', (req, res) => {
        res.send("API is running success");
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`서버 포트 5000에서 시작! ${PORT}`.yellow.bold)); //5000 포트 공개하고 싶지ㅏ 않아서

// const updateUserNotification = async (userId, newMessage) => {
//     try {
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             {
//                 $push: { notification: newMessage },
//             },
//             { new: true }
//         );
//     } catch (error) {
//         console.error(error);
//     }
// }

const io = require("socket.io")(server, {
    pingTimeout: 60000, // 60초 동안 어떤 사용자도 메시지를 보내지 않았다고 가정하였을때 대역폭을 절약하기 위해 연결 닫음
    cors: {
        origin: "http://localhost:3000",
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => { // 소켓 연결 - 유저 정보 가져오기
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => { // 특정 사용자 방에 들어가기
        socket.join(room);
        console.log("User Joined Room: " + room);
    });// 서버
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    socket.on("new chat change", (chatroom, userId) => {
        if (!chatroom.users) return console.log("채팅방 유저가 defined 되어있지 않습니다.");
        chatroom.users.forEach((user) => {
            socket.in(user._id).emit("new chat change"); //유저에게 
        });
        console.log("---------------------------")
    });
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat; // 채팅방 데이터

        if (!chat.users) return console.log("채팅방 유저가 defined 되어있지 않습니다.");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return; // 내꺼는 안불러옴

            socket.in(user._id).emit("message recieved", newMessageRecieved); //유저에게 
        });
    });
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});

