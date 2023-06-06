import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button, Flex, flattenTokens } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const [selectedButton, setSelectedButton] = useState(true);
  const [allChats, setAllChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  // console.log("ChatComponent user: ", user); // 추가
  const toast = useToast();

  const fetchChats = async () => {
    if (!user || !user.token) {
      toast({
        title: "오류 발생!",
        description: "채팅을 불러오는데 실패했습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.get("/api/chat", config);
    // console.log(data);
    setAllChats(data);
    setChats(data);
  };

  useEffect(() => {
    if (selectedButton) {
      setFilteredChats(allChats.filter((chat) => chat.isBusinessChat));
    } else {
      setFilteredChats(allChats.filter((chat) => !chat.isBusinessChat));
    }
  }, [selectedButton, allChats]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    if (selectedChat && (selectedButton !== selectedChat.isBusinessChat)) {
      setSelectedButton(selectedChat.isBusinessChat);
    }
    fetchChats();
  }, [fetchAgain, selectedChat]);

  // useEffect(() => {
  //   fetchChats();
  // }, [chats]);

  return (
    <Box // 채팅방 목록
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        내 채팅방
        <GroupChatModal fetchChats={fetchChats}>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            그룹챗 만들기
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {filteredChats.map((chat) => //chats
              loggedUser && chat.users ? (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text // 채팅방 이름
                  >
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Box>
              ) : null
            )}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>

      <Flex w="100%">
        <Button
          flex="1"
          display="flex"
          fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          // rightIcon={<AddIcon />}
          colorScheme={selectedButton === true ? "green" : "gray"}
          variant={selectedButton === true ? "solid" : "outline"}
          border="2px solid"
          borderColor="#31895D"
          onClick={() => setSelectedButton(true)}
        >
          업무
        </Button>
        <Button
          flex="1"
          display="flex"
          fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          // rightIcon={<AddIcon />}
          colorScheme={selectedButton === false ? "green" : "gray"}
          variant={selectedButton === false ? "solid" : "outline"}
          border="2px solid"
          borderColor="#31895D"
          onClick={() => setSelectedButton(false)}
        >
          개인
        </Button>
      </Flex>
    </Box>
  );
};

export default MyChats;
