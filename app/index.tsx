import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import NewChallengesScreen from '../screens/NewChallengesScreen';
import MyChallengesScreen from '../screens/MyChallengesScreen';
import ProgressScreen from '../screens/ProgressScreen';

export type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="NewChallenges" component={NewChallengesScreen} options={{ title: 'New Challenges' }} />
        <Stack.Screen name="MyChallenges" component={MyChallengesScreen} options={{ title: 'My Challenges' }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      </Stack.Navigator>
  );
}
