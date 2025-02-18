import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { db } from "@/config/firebaseConfig"; // Import your Firebase config
import { onValue, ref, set, update } from 'firebase/database';

export default function HomeScreen() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const counterRef = ref(db, "counter");
        onValue(counterRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setCount(data.value);
            }
        });
    }, [])
    const writeUserData = (userId: number, name: string, email: string) => {
        const reference = ref(db, "users/" + userId);  // Path to "users" node
        set(reference, {
            username: name,
            email: email
        }).then(() => {
            console.log('Data written successfully!');
        }).catch((error) => {
            console.error('Error writing data: ', error);
        });
    };

    const handlePlus = () => {
        updateCount(count + 1);
    };

    const handleMinus = () => {
        updateCount(count - 1);
    };
    const updateCount = (newCount: number) => {
        const reference = ref(db, "counter/"); // Reference to the 'counter' node
        setCount(newCount); // Update local state for the counter value
        update(reference, {
            value: newCount // Only update the 'value' field
        }).then(() => {
            console.log('Counter updated successfully!');
        }).catch((error) => {
            console.error('Error updating counter: ', error);
        });
    }
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/partial-react-logo.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Welcome! {count}</ThemedText>
                <HelloWave />
            </ThemedView>
            <ThemedView style={[styles.stepContainer, { flexDirection: 'row' }]}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={() => writeUserData(1, "vuong", "email@example.com")}>
                    <Text style={styles.buttonText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handlePlus}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={handleMinus}>
                    <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    button: {
        padding: 20,
        marginHorizontal: 5,
        borderRadius: 5,
    },
    buttonPrimary: {
        backgroundColor: '#3498db',
    },
    buttonText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
