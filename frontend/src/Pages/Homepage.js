import { useEffect } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { Container, Box, Text, Tab, TabList, TabPanel, TabPanels, Tabs, } from '@chakra-ui/react'
import React from 'react'

const Homepage = () => {
    const history = useHistory(); // user있으면 불러오기 -chatProvider.js

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if (user) history.push("/chats");
    }, [history]);
    return (
        <Container maxW="xl" position="fixed" right="10%" top="50%" transform="translateY(-50%)">
            <Box>
                <Box
                    display="flex"
                    justifyContent="center"
                    p={3}
                    bg="white"
                    w="100%"
                    m="40px 0 15px 0"
                    borderRadius="lg"
                    borderWidth="1px"
                >
                    <Text fontSize="4xl" fontFamily="Work sans" color="black" textAlign="center">
                        카피바라
                    </Text>
                </Box>
                <Box bg="white" w="100%" p={4} borderRadius="lg" color="black" borderWidth="1px">
                    <Tabs isFitted variant="soft-rounded">
                        <TabList mb="1em"> {/* mb 마진bottom */}
                            <Tab>로그인</Tab>
                            <Tab>회원가입</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                {/* <p>로그인</p> */}
                                <Login />
                            </TabPanel>
                            <TabPanel>
                                {/* <p>회원가입</p> */}
                                <Signup />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Box>
        </Container>
    )
}

export default Homepage