import { View, Text, Button } from 'react-native';

export default function DetailsScreen({ navigation }) {
  return (
    <View>
      <Text>Pàgina interna</Text>
      <Button
        title="Tornar a la home"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}