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
    const [player1StartTime, setPlayer1StartTime] = useState<number | null>(null);
    const [player2StartTime, setPlayer2StartTime] = useState<number | null>(null);
    const [player1ElapsedTime, setPlayer1ElapsedTime] = useState<number | null>(null);
    const [player2ElapsedTime, setPlayer2ElapsedTime] = useState<number | null>(null);
    const [player1Stopped, setPlayer1Stopped] = useState(false);
    const [player2Stopped, setPlayer2Stopped] = useState(false);

    useEffect(() => {
        const raceRef = ref(db, "motor/state");
        const unsubscribe = onValue(raceRef, (snapshot) => {
            const data = snapshot.val();
            if (data !== null) {
                setRaceStatus(data);
                if (data === 1) {
                    setPlayer1StartTime(Date.now());
                    setPlayer2StartTime(Date.now());
                    setPlayer1ElapsedTime(null);
                    setPlayer2ElapsedTime(null);
                    setPlayer1Stopped(false);
                    setPlayer2Stopped(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleRaceStart = () => {
        const raceRef = ref(db, "motor");
        update(raceRef, { state: 1 });
        setRaceStatus(1);
        const startTime = Date.now();
        setPlayer1StartTime(startTime);
        setPlayer2StartTime(startTime);
        setPlayer1ElapsedTime(null);
        setPlayer2ElapsedTime(null);
        setPlayer1Stopped(false);
        setPlayer2Stopped(false);
    };

    const handlePlayer1Stop = () => {
        if (player1StartTime !== null) {
            setPlayer1ElapsedTime((Date.now() - player1StartTime) / 1000);
            setPlayer1Stopped(true);
        }
    };

    const handlePlayer2Stop = () => {
        if (player2StartTime !== null) {
            setPlayer2ElapsedTime((Date.now() - player2StartTime) / 1000);
            setPlayer2Stopped(true);
        }
    };

    const handleContinue = () => {
        const raceRef = ref(db, "motor");
        update(raceRef, { state: 0 });
        setRaceStatus(null);
        setPlayer1StartTime(null);
        setPlayer2StartTime(null);
        setPlayer1ElapsedTime(null);
        setPlayer2ElapsedTime(null);
        setPlayer1Stopped(false);
        setPlayer2Stopped(false);
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/ZINGSPEED.png')}
                    style={styles.reactLogo}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title"></ThemedText>
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
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonStop]} 
                            onPress={handlePlayer1Stop}
                            disabled={player1Stopped}
                        >
                            <Text style={styles.buttonText}>Player1</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.buttonStop]} 
                            onPress={handlePlayer2Stop}
                            disabled={player2Stopped}
                        >
                            <Text style={styles.buttonText}>Player2</Text>
                        </TouchableOpacity>
                    </ThemedView>
                    {(player1Stopped && player2Stopped) && (
                        <ThemedView style={styles.timeContainer}>
                            <ThemedText type="subtitle">Results:</ThemedText>
                            <Text style={styles.timeText}>Player 1: {player1ElapsedTime?.toFixed(2)} s</Text>
                            <Text style={styles.timeText}>Player 2: {player2ElapsedTime?.toFixed(2)} s</Text>
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
        height: 200,
        width: 290,
        bottom: -20,
        left: 50,
        position: 'absolute',
    },
    button: {
        padding: 20,
        marginHorizontal: 5,
        borderRadius: 100,
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
        fontSize: 30,
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
