import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '@/config/firebaseConfig';
import { ref, update, set } from 'firebase/database';
import * as Network from 'expo-network';

export default function Controller() {
  const [username, setUsername] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await Network.getIpAddressAsync();
      if (ip) setIpAddress(ip); 
    };

    fetchIpAddress();
  }, []);

  const handleStart = () => {
    if (!username.trim()) {
      alert("input your name");
      return;
    }

    const userRef = ref(db, `players/${username}`);
    set(userRef, { ip: ipAddress, direction: "STOP", speed: 0 });

    setIsRegistered(true);
  };

  const handleCarMove = (direction: string, speed: number = 1) => {
    const userRef = ref(db, `players/${username}`);
    update(userRef, { direction, speed });
  };

  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>input your name</Text>
        <TextInput
          style={styles.input}
          placeholder="input your name"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>start</Text>
        </TouchableOpacity>
        <Text style={styles.info}>IP Address: {ipAddress || "loading..."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.controlLeft}>
          <TouchableOpacity style={styles.button} onPress={() => handleCarMove("U", 1)}>
            <Icon name="arrow-up" size={100} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCarMove("D", 1)}>
            <Icon name="arrow-down" size={100} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.controlRight}>
          <TouchableOpacity style={styles.button} onPress={() => handleCarMove("L", 1)}>
            <Icon name="arrow-left" size={100} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCarMove("R", 1)}>
            <Icon name="arrow-right" size={100} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userText}>name: {username}</Text>
        <Text style={styles.userText}>IP: {ipAddress || "loading..."}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  info: {
    marginTop: 20,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlLeft: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    alignItems: 'center',
  },
  userText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});


