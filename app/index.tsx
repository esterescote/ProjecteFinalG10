import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';  // Verifica que estas rutas sean correctas
import NewChallengesScreen from '../screens/NewChallengesScreen';
import MyChallengesScreen from '../screens/MyChallengesScreen';
import ProgressScreen from '../screens/ProgressScreen';
import LoginScreen from '../screens/login';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Index() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }} 
      />
      <Stack.Screen 
        name="NewChallenges" 
        component={NewChallengesScreen} 
        options={{ title: 'New Challenges' }} 
      />
      <Stack.Screen 
        name="MyChallenges" 
        component={MyChallengesScreen} 
        options={{ title: 'My Challenges' }} 
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ title: 'Progress' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Stack.Navigator>
  );
}
