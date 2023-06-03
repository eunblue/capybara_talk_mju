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
  IconButton,
  Text,
  Image,
  FormControl,
  Input,
} from "@chakra-ui/react";
import { Radio, RadioGroup, Stack, Box, socket } from "@chakra-ui/react";
import axios from "axios";

import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({
  fetchMessages,
  fetchAgain,
  setFetchAgain,
  user,
  profile,
  children,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { selectedChat, setSelectedChat, user: currentUser } = ChatState();

  const [isBusinessChat, setIsBusinessChat] = useState(
    selectedChat?.isBusinessChat
  );

  const toast = useToast();

  useEffect(() => {
    // selectedChat가 변경될 때마다 isBusinessChat를 업데이트
    setIsBusinessChat(selectedChat?.isBusinessChat);
  }, [selectedChat]);

  const updateBusinessChat = async (status) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
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

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            이름 : {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: {user.email}
            </Text>
            {profile ? (
              <></>
            ) : (
              <Box>
                <RadioGroup
                  value={isBusinessChat ? "work" : "personal"}
                  onChange={(value) => {
                    const businessStatus = value === "work";
                    if (
                      window.confirm(
                        `정말 이 채팅을 ${businessStatus ? "업무" : "개인"
                        }용 채팅으로 바꾸시겠습니까?`
                      )
                    ) {
                      // console.log(businessStatus)
                      setIsBusinessChat(businessStatus);
                      updateBusinessChat(businessStatus);
                    }
                  }}
                >
                  <Stack direction="row">
                    <Radio value="work">업무</Radio>
                    <Radio value="personal">개인</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button ml={1} onClick={onClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
