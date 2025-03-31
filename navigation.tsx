import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./HomeScreen";
import DetailScreen from "./DetailScreen";

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Pel·lícules" }} />
        <Stack.Screen name="Details" component={DetailScreen} options={{ title: "Detalls" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
