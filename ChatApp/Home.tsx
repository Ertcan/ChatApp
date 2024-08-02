import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import axios from 'axios';

const HomeScreen = ({ route, navigation }) => {
  const { username, isActive, userID } = route.params;
  const [users, setUsers] = useState([]);
  const [previousChats, setPreviousChats] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await axios.get(`http://10.0.2.2:3000/users`);
        setUsers(usersResponse.data);

        const chatsResponse = await axios.get(`http://10.0.2.2:3000/previous-chats/${userID}`);
        setPreviousChats(chatsResponse.data);
        console.log(chatsResponse.data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userID]);

  const handleLogout = async () => {
    try {
      await axios.post('http://10.0.2.2:3000/logout', { userID });
      Alert.alert('Başarı', 'Çıkış başarılı!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Hata', 'Çıkış sırasında bir hata oluştu.');
    }
  };

  const handleUserSelect = (selectedUserID) => {
    console.log('Selected User ID:', selectedUserID); 
    const selectedUserData = users.find(user => user.id === selectedUserID);
    if (selectedUserData) {
      navigation.navigate('Chat', {
        username: selectedUserData.username,
        userID: selectedUserData.id,
        isActive: selectedUserData.isactive,
        currentUserID: userID
      });
    } else {
      Alert.alert('Hata', 'Kullanıcı bilgileri bulunamadı.');
    }
  };

  const handleAddUser = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.status}>Durum: {isActive ? 'Çevrimiçi' : 'Çevrimdışı'}</Text>
        <Button title="Çıkış Yap" onPress={handleLogout} />
      </View>

      {previousChats.length > 0 ? (
        <FlatList
          data={previousChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatItem}
              onPress={() => handleUserSelect(item.chatuserid)}
              activeOpacity={0.7} 
            >
              <View style={styles.chatContent}>
                <Text style={styles.chatUsername}>{item.chatuser}</Text>
                <Text style={styles.chatStatus}>{item.chatUserIsActive ? 'Çevrimiçi' : 'Çevrimdışı'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>Hiç sohbetiniz yok</Text>
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Kayıtlı Kullanıcıları Seçin:</Text>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleUserSelect(item.id);
                    closeModal();
                  }}
                >
                  <Text style={styles.modalItemText}>{item.username} ({item.isactive ? 'Çevrimiçi' : 'Çevrimdışı'})</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: 'gray',
  },
  chatItem: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chatContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatUsername: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatStatus: {
    fontSize: 14,
    color: 'gray',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default HomeScreen;
