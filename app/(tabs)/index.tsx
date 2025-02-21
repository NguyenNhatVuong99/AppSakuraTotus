/*import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
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
*/

import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { db } from "@/config/firebaseConfig";
import { onValue, ref, update } from 'firebase/database';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
    const [raceStatus, setRaceStatus] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState<number | null>(null);

    useEffect(() => {
        const raceRef = ref(db, "motor");
        onValue(raceRef, (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                setRaceStatus(data);
                if (data === 1) {
                    setStartTime(Date.now());
                    setElapsedTime(null);
                } else if (data === 0 && startTime !== null) {
                    setElapsedTime((Date.now() - startTime) / 1000);
                }
            }
        });
    }, [startTime]);

    const handleRaceStart = () => {
        const raceRef = ref(db, "motor");
        update(raceRef, { state: 1 });
        setStartTime(Date.now());
        setElapsedTime(null);
    };

    const handleRaceStop =() => {
        const raceRef = ref(db, "motor");
        update(raceRef, { state: 0 });
        if (startTime !== null) {
            setElapsedTime((Date.now() - startTime) / 1000);
        }
    };

    const handleContinue = () => {
        setRaceStatus(null);
        setStartTime(null);
        setElapsedTime(null);
    };

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
                <ThemedText type="title">ZING SPEED</ThemedText>
            </ThemedView>
            {raceStatus === null ? (
                <ThemedView style={styles.centerContainer}>
                    <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={handleRaceStart}>
                        <Text style={styles.buttonText}>Start Race</Text>
                    </TouchableOpacity>
                </ThemedView>
            ) : (
                <>
                    <ThemedView style={[styles.stepContainer, { flexDirection: 'row' }]}>                
                        <TouchableOpacity style={[styles.button, styles.buttonStart]} onPress={handleRaceStart}>
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonStop]} onPress={handleRaceStop}>
                            <Text style={styles.buttonText}>Stop</Text>
                        </TouchableOpacity>
                    </ThemedView>
                    {elapsedTime !== null && (
                        <ThemedView style={styles.timeContainer}>
                            <ThemedText type="subtitle">Time:</ThemedText>
                            <Text style={styles.timeText}>{elapsedTime.toFixed(2)} seconds</Text>
                            <TouchableOpacity style={[styles.button, styles.buttonContinue]} onPress={handleContinue}>
                                <Text style={styles.buttonText}>Continue</Text>
                            </TouchableOpacity>
                        </ThemedView>
                    )}
                </>
            )}
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    centerContainer: {
        alignItems: 'center',
        marginTop: 20,
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
    buttonStart: {
        backgroundColor: '#27ae60',
    },
    buttonStop: {
        backgroundColor: '#e74c3c',
    },
    buttonContinue: {
        backgroundColor: '#3498db',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    timeContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#2c3e50',
        borderRadius: 10,
        alignItems: 'center',
    },
    timeText: {
        color: '#ecf0f1',
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
});
