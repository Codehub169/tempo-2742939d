import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { Box, Flex, Heading, Text, Avatar, Button, VStack, Link } from "@chakra-ui/react";
import { Home, Package, BarChart2, LogOut } from "react-feather";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ icon, children, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link 
            as={RouterLink} 
            to={to} 
            display="flex" 
            alignItems="center" 
            p={3}
            borderRadius="md"
            fontWeight="medium"
            color={isActive ? "white" : "gray.300"}
            bg={isActive ? "accent" : "transparent"}
            _hover={{
                bg: "accent",
                color: "white",
            }}
            style={{ textDecoration: "none" }}
        >
            {icon}
            <Text ml={4}>{children}</Text>
        </Link>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    
    return (
        <Flex h="100vh" bg="bg-color" color="font-color">
            {/* Sidebar */}
            <Box w="260px" bg="primary" p={6} display="flex" flexDirection="column" borderRight="1px" borderColor="border-color">
                <Flex align="center" mb={10}>
                    <Heading as="h1" size="lg" color="white">
                        Inventory<Text as="span" color="accent">Pro</Text>
                    </Heading>
                </Flex>
                <VStack as="nav" spacing={2} align="stretch">
                    <NavItem to="/" icon={<Home />}>Dashboard</NavItem>
                    <NavItem to="/inventory" icon={<Package />}>Inventory</NavItem>
                    <NavItem to="/reports" icon={<BarChart2 />}>Reports</NavItem>
                </VStack>
                <Box mt="auto">
                    <Flex align="center" p={4} bg="card-bg" borderRadius="md">
                        <Avatar size="md" name={user?.name} mr={4} />
                        <Box>
                            <Text fontWeight="bold" color="white">{user?.name || "User"}</Text>
                            <Text fontSize="sm" opacity={0.7}>{user?.email}</Text>
                        </Box>
                        <Button onClick={logout} variant="ghost" size="sm" ml="auto" _hover={{ bg: "transparent", color: "accent" }}>
                            <LogOut size={20} />
                        </Button>
                    </Flex>
                </Box>
            </Box>

            {/* Main Content */}
            <Box flex="1" p={8} overflowY="auto">
                <Outlet />
            </Box>
        </Flex>
    );
};

export default Layout;
