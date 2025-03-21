import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <Text>Pàgina Principal - home</Text>
      <Button
        title="Entrar"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}