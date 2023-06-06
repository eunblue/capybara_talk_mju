import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
  RadioGroup,
  Stack,
  Radio,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain, socket }) => {
  const { selectedChat, setSelectedChat, user } = ChatState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [isBusinessChat, setIsBusinessChat] = useState(selectedChat?.isBusinessChat);

  const toast = useToast();


  useEffect(() => {
    // selectedChat가 변경될 때마다 isBusinessChat를 업데이트합니다.
    setIsBusinessChat(selectedChat?.isBusinessChat);
  }, [selectedChat]);


  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      // console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "검색 결과를 불러올 수 없습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "방장만 가능합니다!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      // console.log(data._id);
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName();
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const updateBusinessChat = async (status) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/rebusinessChat`,
        {
          chatId: selectedChat._id,
          isBusinessChat: status,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.error(error);
      toast({
        title: "오류 발생!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "사용자가 이미 채팅방 내에 있습니다!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    // console.log("허있")
    // console.log(selectedChat.users)
    // console.log("허있")
    // console.log(selectedChat.users.length)
    if (selectedChat.users.length >= 10) {
      toast({
        title: "그룹 채팅에 10명 이상 추가하실 수 없습니다!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    // if (selectedChat.groupAdmin._id !== user._id) { // 초대를 사용자 모두 가능하게
    //   toast({
    //     title: "방장만 가능합니다!",
    //     status: "error",
    //     duration: 5000,
    //     isClosable: true,
    //     position: "bottom",
    //   });
    //   return;
    // }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "방장만 가능합니다!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
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
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };

  return (
    <>
      <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => {
                    if (window.confirm(`정말 ${u.name}님을 채팅방에서 추방하시겠습니까?`)) {
                      handleRemove(u);
                    }
                  }}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="채팅방 이름"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                변경
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="초대할 사용자를 검색하세요!"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Flex justifyContent="space-between" width="100%">
              <Box>
                <RadioGroup
                  value={isBusinessChat ? "work" : "personal"}
                  onChange={(value) => {
                    const businessStatus = value === "work";
                    if (window.confirm(`정말 이 채팅을 ${businessStatus ? "업무" : "개인"}용 채팅으로 바꾸시겠습니까?`)) {
                      // console.log(businessStatus)
                      setIsBusinessChat(businessStatus);
                      updateBusinessChat(businessStatus);
                    }
                  }
                  }
                >
                  <Stack direction="row">
                    <Radio value="work">업무</Radio>
                    <Radio value="personal">개인</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
              <Button onClick={() => {
                if (window.confirm("정말 채팅방을 떠나시겠습니까?")) {
                  handleRemove(user);
                }
              }} colorScheme="red">
                채팅방 떠나기
              </Button>
            </Flex>
          </ModalFooter>

        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
