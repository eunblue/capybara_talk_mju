import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Flex, HStack } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import React from "react";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    setUser,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser();
    setSelectedChat();
    setNotification([]);
    setChats([]);
    history.push("/");
  };


  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "사용자를 찾기 위해 이름이나 이메일을 입력해주세요!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config); // 검색

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "검색 결과를 불러오는데 실패했습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const notifHandler = async (notif) => {
    const notif_list = notification.filter((n) => n !== notif);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // console.log("응애1");
      const { data } = await axios.put(
        '/api/user/notif',
        {
          userID: user._id,
          notif_list: notif_list
        },
        config
      );
      // console.log("data");
      // console.log(data);
      // console.log("응애2");
      setNotification(data.reverse());
      // setNotification(notif_list);
      // console.log("응애3");
      // setFetchAgain(!fetchAgain);
      // console.log("응애4");
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

  const accessChat = async (userId) => {
    // console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]); // 채팅을 찾을 수 없다면 새로 생성
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "채팅을 찾을 수 없습니다.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const setSelectedChatHandler = async (chat) => {
    const sChat = chats.find(c => c._id === chat._id);

    if (sChat) {
      setSelectedChat(sChat);
    } else {
      toast({
        title: "채팅을 찾을 수 없습니다.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };





  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip
          label="사용자를 찾아 채팅을 시작해보세요!"
          hasArrow
          placement="bottom-end"
        >
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              친구 찾기
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          카피바라
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "새로운 메시지가 없습니다."}
              {/* {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    notifHandler(notif);
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `[${notif.chat.chatName}]에서 [${notif.sender.name}]님이 보낸 메시지 : ${notif.content}`
                    : `[${notif.sender.name}]님이 보낸 메시지 : ${notif.content}`
                    // [${getSender(
                    //   user,
                    //   notif.chat.users
                    // )}]님이 보낸 메시지 : ${notif.content}`
                  }
                </MenuItem>
              ))} */}
              {notification.map((notif) => {
                const isNotice = notif.content.includes("!!공지");
                const isGroupAdmin = notif.chat.isGroupChat && (notif.chat.groupAdmin === notif.sender._id);

                const shouldBeBold = notif.chat.isBusinessChat && ((notif.chat.isGroupChat && isGroupAdmin) || !notif.chat.isGroupChat);

                return (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChatHandler(notif.chat);
                      notifHandler(notif);
                    }}
                  >
                    <Text fontWeight={isNotice && shouldBeBold ? "bold" : "normal"}>
                      {notif.chat.isGroupChat
                        ? `[${notif.chat.chatName}]에서 [${notif.sender.name}]님이 보낸 메시지 : ${notif.content}`
                        : `[${notif.sender.name}]님이 보낸 메시지 : ${notif.content}`}
                    </Text>
                  </MenuItem>
                );
              })}


            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user} profile={true}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>로그아웃</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">친구 찾기</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              {/* <Box display="flex" pb={2}> pb가 padding bottom */}
              <Input
                placeholder="이름이나 이메일을 입력하세요!"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
