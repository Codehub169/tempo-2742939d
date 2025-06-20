import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerUser, login as apiLogin } from "../services/api";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link,
} from "@chakra-ui/react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      // Automatically log in the user after successful registration
      const response = await apiLogin({ email, password });
      contextLogin(response.data.token);
      toast({
        title: "Account created.",
        description: "You've been successfully registered and logged in.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg="brand.bg"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="brand.font"
    >
      <Container
        maxW="md"
        p={8}
        bg="rgba(22, 33, 62, 0.85)"
        border="1px"
        borderColor="brand.border"
        borderRadius="xl"
        boxShadow="lg"
      >
        <Stack spacing={6} as="form" onSubmit={handleSubmit}>
          <Stack spacing={2} textAlign="center">
            <Heading fontSize="3xl" fontWeight="bold" color="white">
              Inventory<Text as="span" color="brand.accent">Pro</Text>
            </Heading>
            <Text>Create your account to get started.</Text>
          </Stack>
          <FormControl id="name">
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              bg="brand.bg"
              borderColor="brand.border"
              _hover={{ borderColor: "brand.accent" }}
              _focus={{
                borderColor: "brand.accent",
                boxShadow: "0 0 0 1px #e94560",
              }}
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="brand.bg"
              borderColor="brand.border"
              _hover={{ borderColor: "brand.accent" }}
              _focus={{
                borderColor: "brand.accent",
                boxShadow: "0 0 0 1px #e94560",
              }}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              bg="brand.bg"
              borderColor="brand.border"
              _hover={{ borderColor: "brand.accent" }}
              _focus={{
                borderColor: "brand.accent",
                boxShadow: "0 0 0 1px #e94560",
              }}
            />
          </FormControl>
          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Creating Account..."
            bg="linear-gradient(45deg, #e94560, #ff7e5f)"
            color="white"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          >
            Create Account
          </Button>
          <Text align="center">
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="brand.accent" fontWeight="medium">
              Sign In
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Register;
