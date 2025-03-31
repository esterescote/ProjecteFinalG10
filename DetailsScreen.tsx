import { View, Text, Image, StyleSheet } from "react-native";

export default function DetailScreen({ route }) {
  const { movie } = route.params;

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} 
        style={styles.poster}
      />
      <Text style={styles.title}>{movie.title}</Text>
      <Text style={styles.overview}>{movie.overview}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#fff" },
  poster: { width: 300, height: 450, borderRadius: 10 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  overview: { fontSize: 16, textAlign: "center" }
});
