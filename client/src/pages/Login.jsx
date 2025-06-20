import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/api";
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
  Link,
  useToast,
} from "@chakra-ui/react";

const Login = () => {
  const [email, setEmail] = useState("demo@inventory.pro");
  const [password, setPassword] = useState("password123");
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiLogin({ email, password });
      contextLogin(response.data.token);
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
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
            <Text>Welcome back! Please sign in to continue.</Text>
          </Stack>
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
            loadingText="Signing In..."
            bg="linear-gradient(45deg, #e94560, #ff7e5f)"
            color="white"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          >
            Sign In
          </Button>
          <Text align="center">
            Don't have an account?{" "}
            <Link as={RouterLink} to="/register" color="brand.accent" fontWeight="medium">
              Create an Account
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
