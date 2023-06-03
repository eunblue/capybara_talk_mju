import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";//


const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleClick = () => setShow(!show);

  const history = useHistory();

  const { setNotification, setUser } = ChatState(); //

  const submitHandler = async () => {
    // console.log("1");
    if (window.Notification && Notification.permission !== "granted") {
      // console.log("2");
      const status = await Notification.requestPermission();
      console.log("Status: ", status);  // 'granted' or 'denied'
    }
    // console.log("4");


    // 알림 권한 확인
    // if (!("Notification" in window)) {
    //   console.log("This browser does not support desktop notification");
    //   console.log("하이1");
    // } else if (Notification.permission !== "denied") {
    //   console.log("하이2");
    //   Notification.requestPermission();
    //   console.log("하이3");
    // }


    setLoading(true);
    if (!email || !password) {
      toast({
        title: "모든 항목을 입력해주세요.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    // console.log(email, password);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      if (data) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        toast({
          title: "로그인 성공!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        setUser(JSON.parse(localStorage.getItem("userInfo")));
        // console.log("JSON.parse(localStorage.getItem(userInfo))");
        // console.log(JSON.parse(localStorage.getItem("userInfo")));
        console.log("data.notification"); // Add this line to set the notification state
        console.log(data.notification); // Add this line to set the notification state
        setNotification(data.notification); // Add this line to set the notification state

        history.push("/chats");

      }
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
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      submitHandler();
    }
  };

  return (
    <VStack spacing="10px">
      <FormControl id="email" isRequired>
        <FormLabel>이메일 주소</FormLabel>
        <Input
          // value={email} //
          type="email"
          placeholder="이메일 주소를 입력해주세요."
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>비밀번호</FormLabel>
        <InputGroup size="md">
          <Input
            // value={password} //
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="비밀번호를 입력해주세요."
            onKeyPress={handleKeyPress}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="green"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        로그인
      </Button>
    </VStack>
  );
};

export default Login;