import { useState } from "react";
import { Button, VStack } from "@chakra-ui/react";
import { Field, Input, InputGroup } from "@chakra-ui/react";
import { toaster } from "../../components/ui/toaster";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toaster.create({
        title: "Please Fill all the Feilds",
        type: "warning",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config,
      );

      toaster.create({
        title: "Login Successful",
        type: "success",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      // setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toaster.create({
        title: "Error Occurred!",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        type: "error",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack gap="5px">
      <Field.Root id="email" required>
        <Field.Label>
          Email
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          value={email}
          placeholder="johndoe@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field.Root>
      <Field.Root id="password" required>
        <Field.Label>
          Password
          <Field.RequiredIndicator />
        </Field.Label>
        <InputGroup
          endElement={
            <Button h="1.75rem" size="sm" width="4.5rem" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          }
        >
          <Input
            value={password}
            type={show ? "text" : "password"}
            placeholder="************"
            onChange={(e) => setPassword(e.target.value)}
          />
        </InputGroup>
      </Field.Root>
      <Button
        colorPalette="blue"
        width="100%"
        mt="15px"
        onClick={submitHandler}
        isDisabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
      <Button
        colorPalette="red"
        width="100%"
        mt="15px"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
