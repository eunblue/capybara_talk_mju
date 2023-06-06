// import React, { useContext } from "react";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { Flex, HStack } from "@chakra-ui/react";

import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
// import Lottie from "react-lottie";
// import animationData from "../animations/typing.json";
import { ViewIcon } from "@chakra-ui/icons";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ChatCalendarModal from "./miscellaneous/ChatCalendarModal";
import { ChatState } from "../Context/ChatProvider";

// import { ChatContext } from "../Context/ChatProvider";

const ENDPOINT = "https://capybara.herokuapp.com";//"http://localhost:5000"; //
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();


  const notifrefresh = async (notif_list) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/user/notif',
        {
          userID: user._id,
          notif_list: notif_list
        },
        config
      );
      setNotification(data.reverse());
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "메시지 알림을 불러오는데 실패했습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true)
      notifrefresh()
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    // socket.on("new chat change", () => setFetchAgain(!fetchAgain))

    socket.on("new chat change", () => {
      // console.log("받음티비")
    })
  }, []);


  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat; //알림 등을 주어야하는가?
  }, [selectedChat]);


  useEffect(() => {
    const messageRecievedListener = (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          // console.log("newMessageRecieved")
          // console.log(newMessageRecieved)
          notifHandler([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);

          if (Notification.permission === "granted") {
            if (newMessageRecieved.chat.isBusinessChat === true) {
              if (newMessageRecieved.content.includes("!!공지")) {
                if (newMessageRecieved.chat.isGroupChat === true) {
                  if (newMessageRecieved.chat.groupAdmin === newMessageRecieved.sender._id) {
                    for (let i = 0; i < 3; i++) {
                      new Notification(
                        newMessageRecieved.chat.isGroupChat
                          ? `[${newMessageRecieved.chat.chatName}]에서 [${newMessageRecieved.sender.name}]님이 보낸 공지 메시지`
                          : `[${newMessageRecieved.sender.name}]님이 보낸 공지 메시지`,
                        {
                          body: `${newMessageRecieved.content}`,
                          icon: "../public/copycopy.ico",
                        }
                      );
                    }
                  } else {
                    console.log("오류")
                  }
                } else {
                  for (let i = 0; i < 3; i++) {
                    new Notification(
                      newMessageRecieved.chat.isGroupChat
                        ? `[${newMessageRecieved.chat.chatName}]에서 [${newMessageRecieved.sender.name}]님이 보낸 공지 메시지`
                        : `[${newMessageRecieved.sender.name}]님이 보낸 공지 메시지`,
                      {
                        body: `${newMessageRecieved.content}`,
                        icon: "../public/copycopy.ico",
                      }
                    );
                  }
                }
              }
            }
          }
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    };

    socket.on("message recieved", messageRecievedListener);

    return () => {
      socket.off("message recieved", messageRecievedListener);
    };
  }); // 이 부분은 상황에 따라 조정해주세요.


  const notifHandler = async (notif_list) => {
    try {
      setNotification(notif_list);
      // console.log("notif_list");
      // console.log(notif_list);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/user/notif',
        {
          userID: user._id,
          notif_list: notif_list
        },
        config
      );
      //   console.log("data");
      //   console.log(data);
      // setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: `메시지 알림을 불러오는데 실패했습니다1...${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      // console.log(messages);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "메세지를 가져오는데 실패했습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        // console.log(data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "오류 발생!",
          description: "메세지 전송에 실패했습니다...",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };


  return (
    <>
      {selectedChat ? (
        <>
          <Flex
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            justifyContent="space-between"
            alignItems="center"
          >
            <HStack spacing={2}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />
              <Box display={{ base: "flex", md: "none" }}></Box>
            </HStack>

            <Box flex="1" textAlign="center">
              {messages && !selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName.toUpperCase()}
            </Box>

            <HStack spacing={2}>
              <ChatCalendarModal
                fetchMessages={fetchMessages}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
                socket={socket}
              />
              {messages && !selectedChat.isGroupChat ? (
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  profile={false}
                  socket={socket}
                />
              ) : (
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  socket={socket}
                />
              )}
            </HStack>
          </Flex>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl // 채팅 입력 칸
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? <div>사용자가 입력중입니다...</div> : <></>}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="메세지를 입력해주세요.."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            좌측의 채팅방을 클릭하여 채팅을 시작해 보세요!
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
