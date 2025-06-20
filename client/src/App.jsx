import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Center, Spinner, Box } from "@chakra-ui/react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages for code-splitting
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Reports = React.lazy(() => import("./pages/Reports"));

const PageLoader = () => (
  <Box bg="brand.bg" h="100vh">
    <Center h="100%">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.600"
        color="brand.accent"
        size="xl"
      />
    </Center>
  </Box>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
