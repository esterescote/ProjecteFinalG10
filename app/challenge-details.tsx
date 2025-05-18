import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

const TMDB_API_KEY = '4d3cb710ab798774158802e72c50dfa2';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type Challenge = {
  id: string;
  name: string;
  description: string;
  image: string;
  search_keywords?: string;
  number_films?: number;
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
  const [watchedMovies, setWatchedMovies] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChallengeDetails(id);
      fetchWatchedMovies(id);
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
      } else if (data.search_keywords) {
        searchMoviesByKeywords(data.search_keywords, data.number_films);
      } 
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchedMovies = async (challengeId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data, error } = await supabase
    .from('watched_movies')
    .select('tmdb_movie_id')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId);

  if (!error && data) {
    setWatchedMovies(data.map((entry) => entry.tmdb_movie_id));
  }
};


const toggleWatched = async (tmdbMovieId: number) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !id) return;

  const isWatched = watchedMovies.includes(tmdbMovieId);

  try {
    if (isWatched) {
      // Esborrem per user, challenge i tmdb_movie_id
      const { error } = await supabase
        .from('watched_movies')
        .delete()
        .eq('user_id', user.id)
        .eq('challenge_id', id)
        .eq('tmdb_movie_id', tmdbMovieId);

      if (error) throw error;

      setWatchedMovies((prev) => prev.filter((mid) => mid !== tmdbMovieId));
    } else {
      // Inserim només user_id, challenge_id i tmdb_movie_id, movie_id es genera automàticament
      const { error } = await supabase
        .from('watched_movies')
        .insert({
          user_id: user.id,
          challenge_id: id,
          tmdb_movie_id: tmdbMovieId,
        });

      if (error) throw error;

      setWatchedMovies((prev) => [...prev, tmdbMovieId]);
    }
  } catch (error) {
    console.error('Error toggling watched movie:', error);
  }
};


  const fetchMoviesFromTMDB = async (movieIds: number[]) => {
    setLoadingMovies(true);
    try {
      const moviePromises = movieIds.map((id) =>
        fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`).then((response) =>
          response.json()
        )
      );

      const moviesData = await Promise.all(moviePromises);
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const searchMoviesByKeywords = async (keywordsString: string, numberFilms: number = 10) => {
    setLoadingMovies(true);
    try {
      const keywords = keywordsString.split(',').map((k) => k.trim()).filter(Boolean);

      const searchPromises = keywords.map((keyword) =>
        fetch(
          `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(
            keyword
          )}&page=1`
        ).then((res) => res.json())
      );

      const results = await Promise.all(searchPromises);

      const allMovies = results
        .flatMap((result) => result.results || [])
        .filter((movie, index, self) => self.findIndex((m) => m.id === movie.id) === index);

      setMovies(allMovies.slice(0, numberFilms));
    } catch (error) {
      console.error('Error searching movies by keywords:', error);
    } finally {
      setLoadingMovies(false);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const isWatched = watchedMovies.includes(item.id);

    return (
      <TouchableOpacity style={styles.movieCard} onPress={() => toggleWatched(item.id)}>
        <Image
          source={{
            uri: item.poster_path
              ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
              : 'https://via.placeholder.com/150x225',
          }}
          style={styles.moviePoster}
        />
        {isWatched && (
          <View style={styles.checkmarkOverlay}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.movieYear}>
            {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

      <Text style={styles.sectionTitle}>Pel·lícules per completar aquest repte</Text>

      {loadingMovies ? (
        <View style={styles.loadingMoviesContainer}>
          <ActivityIndicator size="small" color="#888" />
          <Text style={styles.loadingText}>Carregant pel·lícules...</Text>
        </View>
      ) : movies.length > 0 ? (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noMoviesText}>No hi ha pel·lícules disponibles per aquest repte</Text>
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
    position: 'relative',
  },
  moviePoster: {
    width: 80,
    height: 120,
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 4,
    zIndex: 1,
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
  loadingMoviesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ChallengeDetailsScreen;
