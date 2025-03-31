import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const API_KEY = "4d3cb710ab798774158802e72c50dfa2"; 
const URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ca-ES`;


export default function HomeScreen() {
  const [movies, setMovies] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(URL)
      .then(response => setMovies(response.data.results))
      .catch(error => console.error("Error carregant les pel·lícules", error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Pel·lícules Populars</Text>
      <FlatList
        data={movies}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.movieContainer} 
            onPress={() => navigation.navigate("Details", { movie: item })}
          >
            <Image 
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} 
              style={styles.poster}
            />
            <Text style={styles.movieTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  movieContainer: { alignItems: "center", marginBottom: 20 },
  poster: { width: 150, height: 225, borderRadius: 10 },
  movieTitle: { marginTop: 5, fontSize: 16, fontWeight: "bold" }
});
