import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined; 
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Nice to see you here again!</Text>

      <TouchableOpacity onPress={() => navigation.navigate('NewChallenges')} style={styles.card}>
          <Text style={styles.cardText}>Start taking challenges or create your own</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('MyChallenges')} style={styles.card}>
          <Text style={styles.cardText}>Check the state of your current challenge</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Progress')} style={styles.card}>
                  <Text style={styles.cardText}>Your progress, points, challenges completed...</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 20,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});

export default HomeScreen;
