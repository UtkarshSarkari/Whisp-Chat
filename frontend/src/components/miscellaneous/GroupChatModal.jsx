import {
  Dialog,
  Portal,
  Button,
  Input,
  Box,
  Text,
  Field,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import { API_URL } from "../../config/api";

const GroupChatDialog = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) return;
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    if (!query) return;

    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/user?search=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResult(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      alert("Minimum 3 users including you are required");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      setChats([data, ...chats]);

      // ✅ CLOSE MODAL AFTER SUCCESS
      setOpen(false);

      // reset state
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchResult([]);
    } catch (error) {
      alert("Failed to create group chat");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="500px">
            <Dialog.Header>
              <Text fontSize="2xl">Create Group Chat</Text>
            </Dialog.Header>

            <Dialog.Body>
              <Field.Root mb={3}>
                <Field.Label>Chat Name</Field.Label>
                <Input
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </Field.Root>

              <Field.Root mb={2}>
                <Field.Label>Add Users</Field.Label>
                <Input onChange={(e) => handleSearch(e.target.value)} />
              </Field.Root>

              <Box display="flex" flexWrap="wrap" mb={2}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </Box>

              {loading ? (
                <Text>Loading...</Text>
              ) : (
                searchResult
                  ?.slice(0, 4)
                  .map((u) => (
                    <UserListItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleGroup(u)}
                    />
                  ))
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Button colorScheme="blue" onClick={handleSubmit} width="100%">
                Create Chat
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default GroupChatDialog;
