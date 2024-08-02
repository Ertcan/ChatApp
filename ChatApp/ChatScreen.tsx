import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';

const ChatScreen = ({ route, navigation }) => {
  const { username, userID, currentUserID, userStatus } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // WebSocket bağlantısı
    socketRef.current = io('http://10.0.2.2:3000');

    socketRef.current.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://10.0.2.2:3000/messages/${currentUserID}/${userID}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    
    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUserID, userID]);

  useEffect(() => {
    
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        sender: currentUserID,
        receiver: userID,
        message: newMessage,
      };

      try {
        socketRef.current.emit('sendMessage', message);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleExitChat = () => {
    socketRef.current.disconnect();
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageItem, item.sender === currentUserID ? styles.myMessageItem : styles.otherMessageItem]}>
      <Text style={item.sender === currentUserID ? styles.myMessage : styles.otherMessage}>
        {item.message}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Sohbet: {username}</Text>
        <Text style={styles.status}>{userStatus ? 'Çevrimiçi' : 'Çevrimdışı'}</Text>
        <TouchableOpacity style={styles.exitButton} onPress={handleExitChat}>
          <Text style={styles.exitButtonText}>Sohbetten Çık</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        renderItem={renderItem}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Mesajınızı yazın..."
          onSubmitEditing={handleSendMessage} 
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: 'gray',
  },
  exitButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  exitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessageItem: {
    alignSelf: 'flex-end',
    backgroundColor: 'lightgreen',
  },
  otherMessageItem: {
    alignSelf: 'flex-start',
    backgroundColor: 'lightblue',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
