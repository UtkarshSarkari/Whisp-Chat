import { useEffect, useRef } from "react";
import { Avatar, Box, Tooltip } from "@chakra-ui/react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const bottomRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      overflowY="auto"
      height="100%"
      padding={3}
    >
      {messages?.map((m, i) => (
        <Box display="flex" alignItems="flex-end" key={m._id}>
          {(isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id)) && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Box mt="7px" mr={1} cursor="pointer">
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={m.sender.name} />
                  </Avatar.Root>
                </Box>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {m.sender.name}
              </Tooltip.Content>
            </Tooltip.Root>
          )}

          <Box
            backgroundColor={
              m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
            }
            marginLeft={isSameSenderMargin(messages, m, i, user._id)}
            marginTop={isSameUser(messages, m, i, user._id) ? 3 : 10}
            borderRadius="20px"
            padding="5px 15px"
            maxWidth="75%"
          >
            {m.content}
          </Box>
        </Box>
      ))}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </Box>
  );
};

export default ScrollableChat;
