import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const TMDB_API_KEY = '4d3cb710ab798774158802e72c50dfa2';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
};

export default function CreateChallengeScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const searchMovies = async () => {
    if (!searchKeyword.trim()) return;

    setLoadingMovies(true);
    setMovieResults([]);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
          searchKeyword.trim()
        )}&page=1`
      );
      const data = await response.json();
      setMovieResults(data.results || []);
    } catch (err) {
      console.error('Error searching movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const toggleSelectMovie = (movie: Movie) => {
    if (selectedMovies.find((m) => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id));
    } else {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const createChallenge = async () => {
    setError('');
    if (!name.trim() || !description.trim()) {
      setError('Please complete all fields.');
      return;
    }

    if (selectedMovies.length === 0) {
      setError('Please select at least one movie.');
      return;
    }

    setCreating(true);

    const tmdb_movie_ids = selectedMovies.map((m) => m.id);
    
    // Generar imagen por defecto usando la primera película seleccionada
    const defaultImage = selectedMovies[0]?.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}${selectedMovies[0].poster_path}`
      : 'https://via.placeholder.com/300x450/800020/ffffff?text=Custom+Challenge';

    try {
      // CANVI PRINCIPAL: Utilitzar supabase.auth.user() en lloc de getUser()
      const user = supabase.auth.user();

      if (!user) {
        setError('User not authenticated.');
        setCreating(false);
        return;
      }

      // Insertar el reto con los campos necesarios
      const { error: supabaseError } = await supabase.from('challenges').insert([
        {
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          tmdb_movie_ids,
          number_films: selectedMovies.length, // ✅ AÑADIDO: Número de películas
          image: defaultImage, // ✅ AÑADIDO: Imagen por defecto
        },
      ]);

      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        setName('');
        setDescription('');
        setSearchKeyword('');
        setSelectedMovies([]);
        setMovieResults([]);
        navigation.navigate('Home');
      }
    } catch (err) {
      setError('Error creating challenge.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const selected = selectedMovies.some((m) => m.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.movieCard, selected && styles.movieCardSelected]}
        onPress={() => toggleSelectMovie(item)}
      >
        <Image
          source={{
            uri: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/80x120',
          }}
          style={styles.moviePoster}
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.movieYear}>{item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}</Text>
          {selected && <Ionicons name="checkmark-circle" size={20} color="#FFDD95" style={styles.checkIcon} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create New Challenge</Text>
        <Text style={styles.subtitle}>Design your own movie challenge</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Challenge Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Example: Action Movie Marathon"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your challenge..."
            multiline
            numberOfLines={4}
            placeholderTextColor="#888"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Search Movies</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="Enter movie keyword"
              placeholderTextColor="#888"
              onSubmitEditing={searchMovies}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={searchMovies} 
              disabled={loadingMovies}
            >
              {loadingMovies ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="search" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {movieResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Search Results</Text>
            <FlatList
              data={movieResults}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.movieList}
              nestedScrollEnabled
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Selected Movies ({selectedMovies.length})</Text>
          {selectedMovies.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={40} color="#555" />
              <Text style={styles.emptyStateText}>No movies selected yet</Text>
            </View>
          ) : (
            <FlatList
              data={selectedMovies}
              renderItem={({ item }) => (
                <View style={styles.selectedMovieItem}>
                  <Image
                    source={{
                      uri: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/40x60',
                    }}
                    style={styles.selectedMoviePoster}
                  />
                  <View style={styles.selectedMovieInfo}>
                    <Text style={styles.selectedMovieTitle}>{item.title}</Text>
                    <Text style={styles.selectedMovieYear}>
                      {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSelectMovie(item)}>
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              style={styles.selectedMoviesList}
              nestedScrollEnabled
            />
          )}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={[styles.createButton, creating && styles.createButtonDisabled]} 
          onPress={createChallenge} 
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#1e1e1e" />
          ) : (
            <Text style={styles.createButtonText}>Create Challenge</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2e2e2e',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#800000',
    padding: 12,
    borderRadius: 10,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movieList: {
    maxHeight: 300,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 10,
  },
  movieCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  movieCardSelected: {
    borderColor: '#FFDD95',
  },
  moviePoster: {
    width: 60,
    height: 90,
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  movieTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  movieYear: {
    color: '#ccc',
    fontSize: 12,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
  },
  emptyStateText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
  selectedMoviesList: {
    maxHeight: 200,
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 10,
  },
  selectedMovieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  selectedMoviePoster: {
    width: 40,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  selectedMovieInfo: {
    flex: 1,
  },
  selectedMovieTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  selectedMovieYear: {
    color: '#ccc',
    fontSize: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#FFDD95',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#1e1e1e',
    fontWeight: 'bold',
    fontSize: 18,
  },
});