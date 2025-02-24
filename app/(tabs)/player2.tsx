/*import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { db } from '@/config/firebaseConfig';
import { ref, update, set, onValue } from 'firebase/database';
import * as Network from 'expo-network';

const { width, height } = Dimensions.get('window');

export default function Controller() {
  const [username, setUsername] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [raceStatus, setRaceStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await Network.getIpAddressAsync();
      if (ip) setIpAddress(ip);
    };

    fetchIpAddress();

    const raceRef = ref(db, "motor/state");
    const unsubscribeRace = onValue(raceRef, (snapshot) => {
      setRaceStatus(snapshot.val());
    });

    return () => {
      unsubscribeRace();
    };
  }, []);

  const handleStart = () => {
    if (!username.trim()) {
      alert("Input your name");
      return;
    }

    const userRef = ref(db, `players/${username}`);
    set(userRef, { ip: ipAddress, direction: "0", motorstate: 0 });

    setIsRegistered(true);
  };

  const handleCarMove = (direction, motorstate = 1) => {
    if (raceStatus !== 1) return;

    const userRef = ref(db, `players/${username}`);
    const motorRef = ref(db, "motor");

    update(userRef, { direction, motorstate });
    update(motorRef, { state1: motorstate });
  };

  const AnimatedButton = ({ onPress, icon, disabled }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (!disabled) {
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      }
    };

    const handlePressOut = () => {
      if (!disabled) {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start(() => onPress());
      }
    };

    return (
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.8} disabled={disabled}>
        <Animated.View style={[styles.button, disabled && styles.disabledButton, { transform: [{ scale: scaleAnim }] }]}> 
          <Icon name={icon} size={50} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Input your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Input your name"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <Text style={styles.info}>IP Address: {ipAddress || "loading..."}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.controlColumn}>
          <AnimatedButton onPress={() => handleCarMove("1", 1)} icon="arrow-up" disabled={raceStatus !== 1} />
          <AnimatedButton onPress={() => handleCarMove("2", 2)} icon="arrow-down" disabled={raceStatus !== 1} />
        </View>
        <View style={styles.controlRow}>
          <AnimatedButton onPress={() => handleCarMove("3", 3)} icon="arrow-left" disabled={raceStatus !== 1} />
          <AnimatedButton onPress={() => handleCarMove("4", 4)} icon="arrow-right" disabled={raceStatus !== 1} />
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userText}>Name: {username}</Text>
      </View>
    </SafeAreaView>
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
    padding: 25,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 0,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingHorizontal: 20,
  },
  controlColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    position: 'absolute',
    bottom: 300,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  userText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});*/

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Dimensions, SafeAreaView, Animated, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Network from 'expo-network';

const { width, height } = Dimensions.get('window');
const manager = new BleManager();

export default function Player1Controller() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]); // 検索結果
  const [searchQuery, setSearchQuery] = useState(''); // 検索バーの入力値
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  // Request Bluetooth permissions for Android
  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ]);
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== 'granted' ||
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== 'granted' ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== 'granted'
        ) {
          console.warn('Bluetooth permissions not granted!');
        }
      } catch (error) {
        console.error('Failed to request Bluetooth permissions:', error);
      }
    }
  };

  useEffect(() => {
    requestBluetoothPermissions();

    const fetchIpAddress = async () => {
      const ip = await Network.getIpAddressAsync();
      if (ip) setIpAddress(ip);
    };
    fetchIpAddress();

    return () => manager.destroy();
  }, []);

  const scanDevices = () => {
    setDevices([]); // スキャン前にリストをクリア
    setFilteredDevices([]); // フィルタ結果もクリア

    manager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.error(error);
        return;
      }
      if (!scannedDevice.id) return; // IDなしデバイスを無視

      setDevices(prevDevices => {
        if (!prevDevices.some(d => d.id === scannedDevice.id)) {
          return [...prevDevices, scannedDevice];
        }
        return prevDevices;
      });
    });

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  const connectToDevice = (selectedDevice) => {
    manager.stopDeviceScan();
    selectedDevice.connect()
      .then((connectedDevice) => {
        setDevice(connectedDevice);
        setIsConnected(true);
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .catch(console.error);
  };

  const handleStart = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }
    setIsRegistered(true);
  };

  const handleCarMove = (direction) => {
    if (!device) return;

    device.writeCharacteristicWithoutResponseForService(
      'service-uuid',
      'characteristic-uuid',
      Buffer.from(direction, 'utf-8').toString('base64')
    ).catch(console.error);
  };

  // 🔍 検索バーの値が変更されたときにリストを更新
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(device =>
        device.id.includes(searchQuery)
      );
      setFilteredDevices(filtered);
    }
  }, [searchQuery, devices]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search by ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.button} onPress={scanDevices}>
          <Text style={styles.buttonText}>Scan Bluetooth Devices</Text>
        </TouchableOpacity>
        <FlatList
          data={filteredDevices}
          keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : `unknown-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceButton} onPress={() => connectToDevice(item)}>
              <Text style={styles.deviceText}>{item.name || "Unknown Device"} ({item.id})</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Enter your name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={username}
          onChangeText={setUsername}
        />
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <Text style={styles.info}>IP Address: {ipAddress || "Loading..."}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.controlColumn}>
          <TouchableOpacity onPress={() => handleCarMove("FORWARD")} style={styles.button}><Text>↑</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleCarMove("BACKWARD")} style={styles.button}><Text>↓</Text></TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity onPress={() => handleCarMove("LEFT")} style={styles.button}><Text>←</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleCarMove("RIGHT")} style={styles.button}><Text>→</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userText}>Name: {username}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
  input: { width: '80%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 10, backgroundColor: 'white' },
  button: { backgroundColor: '#3498db', padding: 25, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  deviceButton: { padding: 15, backgroundColor: '#ddd', marginVertical: 5, borderRadius: 5 },
  deviceText: { fontSize: 16 },
  userInfo: { marginTop: 20 },
  userText: { fontSize: 20, fontWeight: 'bold' },
});

