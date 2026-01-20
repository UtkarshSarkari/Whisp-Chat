import React, { useEffect } from "react";
import { Container, Box, Text, Tabs } from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import SignUp from "../components/Authentication/SignUp";
import { useNavigate } from "react-router-dom";

const HomePage = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <Container maxW="xl" centerContent>
      <Box
        display="flex"
        justifyContent="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        textAlign="center"
      >
        <Text fontSize="4xl" fontFamily="Work sans" color="black">
          Whisp
        </Text>
      </Box>
      <Box
        bg="white"
        w="100%"
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        color="black"
      >
        <Tabs.Root
          defaultValue="login"
          variant="plain"
          css={{
            "--tabs-indicator-bg": "colors.gray.subtle",
            "--tabs-indicator-shadow": "shadows.xs",
            "--tabs-trigger-radius": "radii.full",
          }}
        >
          <Tabs.List
            css={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Tabs.Trigger
              value="login"
              css={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Login
            </Tabs.Trigger>

            <Tabs.Trigger
              value="signup"
              css={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              SignUp
            </Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="login">
            <Login />
          </Tabs.Content>
          <Tabs.Content value="signup">
            <SignUp />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Container>
  );
};

export default HomePage;
