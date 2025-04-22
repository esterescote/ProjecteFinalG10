import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

// Constants per a la API de TMDB
const TMDB_API_KEY = '4d3cb710ab798774158802e72c50dfa2';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type Challenge = {
  id: string;
  name: string;
  description: string;
  image: string;
  tmdb_movie_ids?: number[];
};

type Movie = {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
};

const ChallengeDetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchChallengeDetails(id);
    }
  }, [id]);

  const fetchChallengeDetails = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error('Error loading challenge details:', error.message);
        return;
      }

      setChallenge(data);

      if (data.tmdb_movie_ids && data.tmdb_movie_ids.length > 0) {
        fetchMoviesFromTMDB(data.tmdb_movie_ids);
      } else {
        searchMoviesByChallengeName(data.name);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoviesFromTMDB = async (movieIds: number[]) => {
    try {
      const moviePromises = movieIds.map(id =>
        fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`)
          .then(response => response.json())
      );

      const moviesData = await Promise.all(moviePromises);
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const searchMoviesByChallengeName = async (challengeName: string) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(challengeName)}&page=1`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setMovies(data.results.slice(0, 5)); // Només mostra els primers 5
      }
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity style={styles.movieCard}>
      <Image
        source={{
          uri: item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/150x225'
        }}
        style={styles.moviePoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieYear}>
          {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Challenge not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge.name}</Text>
      <Image source={{ uri: challenge.image }} style={styles.image} />
      <Text style={styles.description}>{challenge.description}</Text>

      <Text style={styles.sectionTitle}>Películas para completar este reto</Text>

      {movies.length > 0 ? (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noMoviesText}>No hay películas disponibles para este reto</Text>
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  movieCard: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#2e2e2e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  moviePoster: {
    width: 80,
    height: 120,
  },
  movieInfo: {
    flex: 1,
    padding: 12,
  },
  movieTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  movieYear: {
    fontSize: 14,
    color: '#ccc',
  },
  noMoviesText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ChallengeDetailsScreen;
