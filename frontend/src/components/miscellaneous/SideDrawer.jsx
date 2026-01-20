import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { Box, Button, CloseButton, Input, Text, Badge } from "@chakra-ui/react";
import { Tooltip } from "../../components/ui/tooltip";
import { Menu } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "lucide-react";
import { Avatar } from "@chakra-ui/react";
import { Dialog, Portal, Drawer } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { toaster } from "../ui/toaster";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import { API_URL } from "../../config/api";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const navigate = useNavigate();

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const handleSearch = async () => {
    if (!search) {
      toaster.create({
        title: "Please Enter something in search",
        type: "warning",
        duration: 5000,
        closable: true,
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

      const { data } = await axios.get(
        `${API_URL}/api/user?search=${search}`,
        config,
      );

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `${API_URL}/api/chat`,
        { userId },
        config,
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      toaster.create({
        title: "Error fetching the chat",
        description: error.message,
        type: "error",
        duration: 5000,
        closable: true,
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
        borderColor="lightgray"
        color="black"
      >
        <Drawer.Root placement="start">
          <Tooltip
            showArrow
            content="Search users to chat"
            positioning={{ placement: "bottom-end" }}
          >
            <Drawer.Trigger asChild>
              <Button variant="ghost" color="black" _hover={{ bg: "gray.100" }}>
                <i className="fa-solid fa-magnifying-glass" />
                <Text display={{ base: "none", md: "flex" }}>Search User</Text>
              </Button>
            </Drawer.Trigger>
          </Tooltip>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content backgroundColor="white" color="black">
                <Drawer.Header>
                  <Drawer.Title>Search Users</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <Box display="flex" pb={2}>
                    <Input
                      placeholder="Search by name or email"
                      mr={2}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button colorPalette="blue" onClick={handleSearch}>
                      Go
                    </Button>
                  </Box>
                  {loading ? (
                    <div className="">Loading Chats...</div>
                  ) : (
                    searchResult?.map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => accessChat(user._id)}
                      />
                    ))
                  )}
                </Drawer.Body>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" color="black" />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
        <Text fontSize="2xl" fontFamily="Work sans">
          Whisper
        </Text>
        <div className="flex">
          <Menu.Root>
            <Menu.Trigger asChild _hover={{ bg: "gray.100" }}>
              <Button
                p={1}
                mr={3}
                position="relative"
                onClick={() => {
                  console.log("notification clicked");
                }}
              >
                {notification.length > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorPalette="red"
                    borderRadius="full"
                    fontSize="xs"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {notification.length}
                  </Badge>
                )}
                <BellIcon color="black" />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content p="1" backgroundColor="white" color="black">
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <Menu.Item
                    color="black"
                    backgroundColor="#e8e8e8"
                    p={3}
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <Menu.Root>
            <Menu.Trigger _hover={{ bg: "gray.100" }} asChild>
              <Button p={1} variant="ghost" color="black">
                <Avatar.Root size="sm">
                  <Avatar.Fallback name={user?.name} />
                </Avatar.Root>
                <ChevronDownIcon />
              </Button>
            </Menu.Trigger>

            <Menu.Positioner>
              <Menu.Content p="0.5" backgroundColor="lightgray">
                {/* PROFILE */}
                <Dialog.Root placement="center">
                  <Dialog.Trigger asChild color="black">
                    <Menu.Item
                      value="profile"
                      cursor="pointer"
                      backgroundColor="white"
                      closeOnSelect={false}
                    >
                      My Profile
                    </Menu.Item>
                  </Dialog.Trigger>

                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        width="50%"
                      >
                        <Dialog.Header>
                          <Dialog.Title>My Profile</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body textAlign="center">
                          <Avatar.Root size="2xl" mb={4}>
                            <Avatar.Fallback name={user?.name} />
                          </Avatar.Root>

                          <Text fontWeight="bold">{user?.name}</Text>
                          <Text>{user?.email}</Text>
                        </Dialog.Body>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>

                <Menu.Separator m="0.5" />

                {/* LOGOUT */}
                <Menu.Item
                  cursor="pointer"
                  value="logout"
                  backgroundColor="white"
                  color="black"
                  onClick={() => {
                    localStorage.removeItem("userInfo");
                    navigate("/");
                  }}
                >
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </div>
      </Box>
    </>
  );
};

export default SideDrawer;
