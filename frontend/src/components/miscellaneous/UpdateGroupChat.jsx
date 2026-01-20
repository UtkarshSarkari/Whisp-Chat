import {
  Dialog,
  Button,
  Input,
  Box,
  Spinner,
  Portal,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import { toaster } from "../ui/toaster";
import { EyeIcon } from "lucide-react";
import { API_URL } from "../../config/api";

const UpdateGroupChatDialog = ({
  fetchMessages,
  fetchAgain,
  setFetchAgain,
}) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get(
        `${API_URL}/api/user?search=${query}`,
        config,
      );
      setSearchResult(data);
    } catch (error) {
      toaster({
        title: "Error occurred",
        description: "Failed to load search results",
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        `${API_URL}/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config,
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
    } catch (error) {
      toaster({
        title: "Error occurred",
        description: error.response?.data?.message,
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      return toaster({
        title: "User already in group",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      return toaster({
        title: "Only admins can add users",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        `${API_URL}/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config,
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toaster({
        title: "Error occurred",
        description: error.response?.data?.message,
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (
      selectedChat.groupAdmin._id !== user._id &&
      userToRemove._id !== user._id
    ) {
      return toaster({
        title: "Only admins can remove users",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.put(
        `${API_URL}/api/chat/groupremove`,
        {
          chatId: selectedChat._id,
          userId: userToRemove._id,
        },
        config,
      );

      userToRemove._id === user._id
        ? setSelectedChat(null)
        : setSelectedChat(data);

      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      toaster({
        title: "Error occurred",
        description: error.response?.data?.message,
        type: "error",
        duration: 5000,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root placement="center">
      <Dialog.Trigger asChild>
        <Box display="flex" gap={2} asChild>
          <Button colorPalette="white">
            <Text>View/Update Group</Text>
            <EyeIcon />
          </Button>
        </Box>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content width="50%">
            <Dialog.Header
              textAlign="center"
              fontSize="35px"
              fontFamily="Work sans"
            >
              {selectedChat.chatName}
            </Dialog.Header>

            <Dialog.Body>
              {/* Members */}
              <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={selectedChat.groupAdmin}
                    handleFunction={() => handleRemove(u)}
                  />
                ))}
              </Box>

              {/* Rename group */}
              <Box display="flex" mb={3}>
                <Input
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  ml={2}
                  colorScheme="teal"
                  isLoading={renameloading}
                  onClick={handleRename}
                >
                  Update
                </Button>
              </Box>

              {/* Add user */}
              <Box mb={2}>
                <Input
                  placeholder="Add user to group"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </Box>

              {loading ? (
                <Spinner size="lg" />
              ) : (
                searchResult.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                ))
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Button colorScheme="red" onClick={() => handleRemove(user)}>
                Leave Group
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default UpdateGroupChatDialog;
