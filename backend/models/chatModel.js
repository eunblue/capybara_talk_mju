const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
    {
        chatName: { type: String, trim: true },
        isGroupChat: { type: Boolean, default: false },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;

// chatName //채팅방이름
// isGroupChat //그룹챗인가?
// users //채팅 유저 리스트
// latestMessage //가장 최근 메세지 - 채팅방 보여주기 용
// groupAdmin //팀장