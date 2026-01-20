import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Avatar,
  Dialog,
  Portal,
  Field,
  Input,
} from "@chakra-ui/react";
import { EyeIcon, MoveLeftIcon } from "lucide-react";
import { ChatState } from "../Context/ChatProvider";
import { getSenderFull } from "../config/ChatLogics";
import UpdateGroupChatDialog from "./miscellaneous/UpdateGroupChat";
import { toaster } from "./ui/toaster";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = "http://localhost:5000";
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  /* ================= SOCKET SETUP ================= */
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", (chatId) => {
      if (selectedChatCompare?._id === chatId) {
        setIsTyping(true);
      }
    });

    socket.on("stop typing", (chatId) => {
      if (selectedChatCompare?._id === chatId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  /* ================= FETCH MESSAGES ================= */
  const fetchMessages = async () => {
    if (!selectedChat || !user?.token) return;

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config,
      );

      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toaster.create({
        title: "Error Occurred",
        description: error.response?.data?.message || "Failed to load messages",
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (!newMessage.trim()) return;

    socket.emit("stop typing", selectedChat._id);
    setTyping(false);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/message",
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config,
      );

      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      toaster.create({
        title: "Error Occurred",
        description: error.response?.data?.message || "Failed to send message",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  /* ================= MESSAGE RECEIVE ================= */
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  /* ================= CHAT CHANGE ================= */
  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  /* ================= TYPING HANDLER ================= */
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      if (timeNow - lastTypingTime >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  /* ================= NO CHAT SELECTED ================= */
  if (!selectedChat) {
    return (
      <Box h="100%" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="3xl" fontFamily="Work sans">
          Click on a user to start chatting
        </Text>
      </Box>
    );
  }

  const chatUser = !selectedChat.isGroupChat
    ? getSenderFull(user, selectedChat.users)
    : null;

  /* ================= UI ================= */
  return (
    <Box w="100%" h="100%">
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={3}
        pb={3}
      >
        <Box display="flex" gap={4} alignItems="center">
          <MoveLeftIcon
            cursor="pointer"
            onClick={() => setSelectedChat(null)}
          />
          <Text fontSize="xl" fontWeight="bold">
            {selectedChat.isGroupChat ? selectedChat.chatName : chatUser?.name}
          </Text>
        </Box>

        <Dialog.Root placement="center">
          <Dialog.Trigger asChild>
            <EyeIcon cursor="pointer" />
          </Dialog.Trigger>

          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content p={6} width="50%">
                <Dialog.Header>
                  <Dialog.Title>Profile</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body textAlign="center">
                  {selectedChat.isGroupChat ? (
                    <UpdateGroupChatDialog
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                      fetchMessages={fetchMessages}
                    />
                  ) : (
                    <>
                      <Avatar.Root size="2xl" mb={4}>
                        <Avatar.Fallback name={chatUser?.name} />
                      </Avatar.Root>
                      <Text fontWeight="bold">{chatUser?.name}</Text>
                      <Text color="gray.500">{chatUser?.email}</Text>
                    </>
                  )}
                </Dialog.Body>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>

      {/* Messages */}
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="#e8e8e8"
        h="94%"
        borderRadius="lg"
      >
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <ScrollableChat messages={messages} />
        )}

        {/* Input Area with fixed height */}
        <Box mt={3}>
          {/* Typing Indicator - positioned absolutely */}
          {isTyping && (
            <Box position="absolute" bottom="85px" left="22px" zIndex={10}>
              <Lottie
                options={defaultOptions}
                width={60}
                style={{
                  marginBottom: 0,
                  marginLeft: 0,
                }}
              />
            </Box>
          )}

          <Field.Root>
            <Input
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={sendMessage}
              placeholder="Enter message"
              bg="#e0e0e0"
            />
          </Field.Root>
        </Box>
      </Box>
    </Box>
  );
};

export default SingleChat;
