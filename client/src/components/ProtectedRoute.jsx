import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner, Box } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
       <Box bg="var(--bg-color)" h="100vh">
        <Center h="100%">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.600"
            color="var(--accent-color)"
            size="xl"
          />
        </Center>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
