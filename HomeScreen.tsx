import React from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const challenges = [
  { id: "1", title: "New Challenges", description: "Start new challenges..." },
  { id: "2", title: "My Challenge", description: "Check the status of your..." },
  { id: "3", title: "My Progress", description: "Your progress, points..." },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.header}>
        <Text style={styles.username}>Username</Text>
       
      </View>

      {/* Missatge de benvinguda */}
      <Text style={styles.welcomeText}>Nice to see you here again!</Text>

      {/* Llista de targetes */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("Challenges", { title: item.title })}>
            <Image source={item.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
          
        )}
      />

      

      {/* Barra inferior de navegació */}
      <View style={styles.navBar}>
        <Text>🏠</Text>
        <Text>🎬</Text>
        <Text>📊</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E1F1F", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  username: { color: "white", fontSize: 18 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  welcomeText: { color: "white", fontSize: 24, marginVertical: 20 },
  card: { backgroundColor: "#3E2E2E", borderRadius: 10, marginBottom: 15, padding: 15 },
  cardImage: { width: "100%", height: 100, borderRadius: 8 },
  cardTitle: { color: "white", fontSize: 18, marginTop: 10 },
  cardDescription: { color: "#B0A5A5", fontSize: 14 },
  navBar: { flexDirection: "row", justifyContent: "space-around", padding: 15, backgroundColor: "#1F1A1A" },
});
