import { CalendarIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

const ChatCalendarModal = ({ fetchMessages, fetchAgain, setFetchAgain, socket }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [CalendarName, setCalendarName] = useState();
  const [CalendarDate, setCalendarDate] = useState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const sortedCalendar = selectedChat.calendar.sort(
    (a, b) => new Date(a.caldate) - new Date(b.caldate)
  );

  useEffect(() => {
    const refreshCalendar = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          `/api/chat/calendarRefresh/${selectedChat._id}`,
          config
        );
        console.log("data");
        console.log(data);
        setSelectedChat(data);
      } catch (error) {
        toast({
          title: "오류 발생!",
          description: "일정을 추가할 수 없습니다...",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        setLoading(false);
      }
    };

    const chatChangeListener = () => {
      refreshCalendar();
    };

    socket.on("new chat change", () => {
      chatChangeListener()
    })

    return () => {
      socket.off("chat change", chatChangeListener);
    };

  }, [socket]);


  const handleCalendarName = (event) => {
    setCalendarName(event.target.value);
    // console.log(event.target.value);
  };
  const handleCalendarDate = (event) => {
    setCalendarDate(event.target.value);
  };

  const handleCalendar = async () => {
    if (!CalendarName || !CalendarDate) {
      toast({
        title: "모든 항목을 입력해주세요.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      //setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/calendaradd",
        {
          chatId: selectedChat._id,
          CalendarName: CalendarName,
          CalendarDate: CalendarDate,
        },
        config
      );
      setSelectedChat(data);
      socket.emit("new chat change", selectedChat, user._id);
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "일정을 추가할 수 없습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleDeleteCalendar = async (calendar) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/chat/calendarRemove`,
        {
          chatId: selectedChat._id,
          calendarId: calendar._id,
        },
        config
      );

      setSelectedChat(data);
      console.log("1socket.emit(new chat change, selectedChat._id);");
      socket.emit("new chat change", selectedChat._id);
      console.log("2socket.emit(new chat change, selectedChat._id);");
      console.log(data.calendar);

      toast({
        title: "일정이 삭제되었습니다.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "오류 발생!",
        description: "일정을 삭제할 수 없습니다...",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };


  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<CalendarIcon />}
        onClick={onOpen}
      />

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            일정
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody display="flex" alignItems="center" justifyContent="center">
            <VStack spacing={4} align="stretch" w="100%">
              <Box h="300px" overflowY="auto">
                {selectedChat && selectedChat.calendar && sortedCalendar.map((c) => (
                  <HStack
                    key={c._id}
                    spacing={4}
                    p={2}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                  >
                    <Box minW="100px">
                      <Text>
                        {new Date(c.caldate).toLocaleString([], {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </Text>
                      <Text>
                        {new Date(c.caldate).toLocaleString([], {
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </Text>
                    </Box>
                    <Text flexGrow={1}>{c.calname}</Text>
                    <IconButton
                      icon={<CloseIcon />}
                      aria-label="Delete"
                      onClick={() => handleDeleteCalendar(c)}
                    />
                  </HStack>

                ))}
              </Box>
            </VStack>
          </ModalBody>

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl display="flex">
              <Input
                placeholder="일정 제목"
                mb={3}
                // value={CalendarName}
                onChange={handleCalendarName}
                id="calendarNameInput"
              />
              <Input
                type="datetime-local"
                id="calenderDate"
                onChange={handleCalendarDate}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={loading}
                onClick={() => handleCalendar()}
              >
                등록
              </Button>
            </FormControl>
          </ModalBody>
        </ModalContent>
      </Modal>

    </>
  );
};

export default ChatCalendarModal;
