import { useState } from "react";
import { Button, VStack } from "@chakra-ui/react";
import { Field, Input, InputGroup } from "@chakra-ui/react";
import { toaster } from "../../components/ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState();
  // const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    // setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toaster.create({
        title: "Please Fill all the Feilds",
        type: "warning",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      // setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toaster.create({
        title: "Passwords Do Not Match",
        type: "warning",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      return;
    }
    console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          pic,
        },
        config,
      );
      console.log(data);
      toaster.create({
        title: "Registration Successful",
        type: "success",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      // setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        type: "error",
        duration: 5000,
        closable: true,
        position: "bottom",
      });
      // setPicLoading(false);
    }
  };

  // const postDetails = (pics) => {};

  return (
    <VStack gap="5px">
      <Field.Root id="first-name" required>
        <Field.Label>
          Name
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          value={name}
          placeholder="John Doe"
          onChange={(e) => setName(e.target.value)}
        />
      </Field.Root>
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
      <Field.Root id="confirm-password" required>
        <Field.Label>
          Confirm Password
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
            value={confirmpassword}
            type={show ? "text" : "password"}
            placeholder="************"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
        </InputGroup>
      </Field.Root>
      {/* <Field.Root id="pic" required>
        <Field.Label>
          Upload your picture
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          type="file"
          p={1.5}
          accept="images/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </Field.Root> */}
      <Button
        colorPalette="blue"
        width="100%"
        mt="15px"
        onClick={submitHandler}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
