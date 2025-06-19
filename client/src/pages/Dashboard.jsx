import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Text, Heading, Stat, StatLabel, StatNumber, StatHelpText, Flex, Icon } from '@chakra-ui/react';
import { Archive, AlertTriangle, XCircle, Tag } from 'react-feather';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/inventory/stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Items', value: stats.totalItems, icon: Archive, color: 'blue.400' },
    { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'yellow.400' },
    { label: 'Out of Stock', value: stats.outOfStock, icon: XCircle, color: 'red.400' },
    { label: 'Categories', value: stats.categories, icon: Tag, color: 'green.400' },
  ];

  return (
    <Box>
      <Heading as="h2" size="xl" mb={2}>Dashboard</Heading>
      <Text opacity={0.7} mb={8}>Here's a snapshot of your inventory performance.</Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {statCards.map((card, index) => (
          <Stat
            key={index}
            bg="brand.cardBg"
            p={5}
            borderRadius="lg"
            border="1px"
            borderColor="brand.border"
          >
            <Flex alignItems="center">
              <Icon as={card.icon} boxSize={8} color={card.color} mr={4} />
              <Box>
                <StatLabel>{card.label}</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">{loading ? '...' : card.value}</StatNumber>
              </Box>
            </Flex>
          </Stat>
        ))}
      </SimpleGrid>

      {/* Add charts and recent activity here in the next steps */}
    </Box>
  );
};

export default Dashboard;
