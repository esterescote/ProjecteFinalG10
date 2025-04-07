import React from "react";
import { View, Text, FlatList, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";

const challenges = [
  { id: "1", title: "Marvel marathon", image: require("../assets/Marvelmarathon.png") },
  { id: "2", title: "The Oscar Winners Challenge", image: require("../assets/oscars.png") },
  { id: "3", title: "Lord of the Rings & The Hobbit marathon", image: require("../assets/lotr.png") },
  { id: "4", title: "The 50 Disney Classics", image: require("../assets/50disney.png") },
];

export default function ChallengesList({ route }) {
  const { title } = route.params;  // Aquí capturarem el títol passat des de HomeScreen

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text> {/* Aquí mostrem el títol que es passa */}
      <Text style={styles.subtitle}>List of existing challenges to get started</Text>

      <FlatList
        data={challenges}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.challengeContainer}>
            <ImageBackground source={item.image} style={styles.challengeImage}>
              <View style={styles.overlay}>
                <Text style={styles.challengeTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Visualize</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        )}
      />

      <TouchableOpacity style={styles.newChallengeButton}>
        <Text style={styles.newChallengeText}>Create New Challenge</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2b2024", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#ccc", marginBottom: 15 },
  challengeContainer: { marginBottom: 20 },
  challengeImage: { width: "100%", height: 150, justifyContent: "flex-end", borderRadius: 10 },
  overlay: { backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 10, flexDirection: "row", justifyContent: "space-between" },
  challengeTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  button: { backgroundColor: "#6c757d", padding: 8, borderRadius: 5, marginLeft: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  newChallengeButton: { backgroundColor: "#000", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  newChallengeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
