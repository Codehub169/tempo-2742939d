import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Center,
  Text,
  Badge,
  Image,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Search, Plus, Edit, Trash2 } from "react-feather";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "../services/api";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const results = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventory(results);
  }, [searchTerm, inventory]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data } = await getInventory();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      toast({ title: "Error fetching inventory", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    onOpen();
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    onClose();
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteInventoryItem(itemToDelete.id);
      toast({ title: "Item deleted", status: "success", duration: 3000, isClosable: true });
      fetchInventory(); // Refetch
    } catch (error) {
      toast({ title: "Error deleting item", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsDeleteAlertOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const itemData = Object.fromEntries(formData.entries());
    itemData.price = parseFloat(itemData.price);
    itemData.stock = parseInt(itemData.stock, 10);

    try {
      if (currentItem) {
        await updateInventoryItem(currentItem.id, itemData);
        toast({ title: "Item updated", status: "success", duration: 3000, isClosable: true });
      } else {
        await addInventoryItem(itemData);
        toast({ title: "Item added", status: "success", duration: 3000, isClosable: true });
      }
      fetchInventory();
      handleCloseModal();
    } catch (error) {
      toast({ title: "Error saving item", description: error.response?.data?.message, status: "error", duration: 3000, isClosable: true });
    }
  };
  
  const getStatusBadge = (stock) => {
    if (stock === 0) return <Badge colorScheme="red">Out of Stock</Badge>;
    if (stock < 10) return <Badge colorScheme="yellow">Low Stock</Badge>;
    return <Badge colorScheme="green">In Stock</Badge>;
  };

  if (isLoading) {
    return (
      <Center h="100%">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Inventory List</Heading>
        <Flex>
          <InputGroup w="300px" mr={4}>
            <InputLeftElement pointerEvents="none" children={<Search size={20} color="gray.300" />} />
            <Input 
              placeholder="Search by name, SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button
            leftIcon={<Plus size={20} />}
            onClick={() => handleOpenModal()}
            bg="linear-gradient(45deg, #e94560, #ff7e5f)"
            color="white"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          >
            Add New Item
          </Button>
        </Flex>
      </Flex>
      
      <Box bg="brand.cardBg" borderRadius="lg" borderWidth="1px" borderColor="brand.border">
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th isNumeric>Stock</Th>
                <Th isNumeric>Price</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInventory.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <HStack>
                      <Image borderRadius="md" boxSize="40px" src={`https://picsum.photos/seed/${item.id}/40`} alt={item.name} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text fontSize="sm" color="gray.400">{item.sku}</Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>{item.category}</Td>
                  <Td isNumeric>{item.stock}</Td>
                  <Td isNumeric>${item.price.toFixed(2)}</Td>
                  <Td>{getStatusBadge(item.stock)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)}><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm" colorScheme="red" onClick={() => handleDeleteClick(item)}><Trash2 size={16} /></Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleFormSubmit} bg="brand.cardBg">
          <ModalHeader>{currentItem ? "Edit Item" : "Add New Item"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Product Name</FormLabel>
              <Input
                name="name"
                defaultValue={currentItem?.name}
                bg="brand.bg"
                borderColor="brand.border"
                _hover={{ borderColor: "brand.accent" }}
                _focus={{ borderColor: "brand.accent", boxShadow: "0 0 0 1px #e94560" }}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>SKU</FormLabel>
              <Input
                name="sku"
                defaultValue={currentItem?.sku}
                bg="brand.bg"
                borderColor="brand.border"
                _hover={{ borderColor: "brand.accent" }}
                _focus={{ borderColor: "brand.accent", boxShadow: "0 0 0 1px #e94560" }}
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                name="category"
                defaultValue={currentItem?.category || "Electronics"}
                bg="brand.bg"
                borderColor="brand.border"
                _hover={{ borderColor: "brand.accent" }}
                _focus={{ borderColor: "brand.accent", boxShadow: "0 0 0 1px #e94560" }}
              >
                <option style={{ color: 'black' }} value="Electronics">Electronics</option>
                <option style={{ color: 'black' }} value="Groceries">Groceries</option>
                <option style={{ color: 'black' }} value="Apparel">Apparel</option>
                <option style={{ color: 'black' }} value="Books">Books</option>
                <option style={{ color: 'black' }} value="Home Goods">Home Goods</option>
              </Select>
            </FormControl>
            <Flex mt={4}>
              <FormControl mr={2} isRequired>
                <FormLabel>Quantity</FormLabel>
                <NumberInput defaultValue={currentItem?.stock || 0} min={0}>
                  <NumberInputField
                    name="stock"
                    bg="brand.bg"
                    borderColor="brand.border"
                    _hover={{ borderColor: "brand.accent" }}
                    _focus={{ borderColor: "brand.accent", boxShadow: "0 0 0 1px #e94560" }}
                  />
                </NumberInput>
              </FormControl>
              <FormControl ml={2} isRequired>
                <FormLabel>Price ($)</FormLabel>
                <NumberInput defaultValue={currentItem?.price || 0} precision={2} step={0.01} min={0}>
                  <NumberInputField
                    name="price"
                    bg="brand.bg"
                    borderColor="brand.border"
                    _hover={{ borderColor: "brand.accent" }}
                    _focus={{ borderColor: "brand.accent", boxShadow: "0 0 0 1px #e94560" }}
                  />
                </NumberInput>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseModal} mr={3}>Cancel</Button>
            <Button
              bg="linear-gradient(45deg, #e94560, #ff7e5f)"
              color="white"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              type="submit"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="brand.cardBg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Inventory;
