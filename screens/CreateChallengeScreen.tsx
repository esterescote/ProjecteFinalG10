import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

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
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(
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

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not found');
        setCreating(false);
        return;
      }

      const { error: supabaseError } = await supabase.from('challenges').insert([
        {
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          tmdb_movie_ids,
          number_films: selectedMovies.length,
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
      setError('Error creating the challenge');
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
          <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.movieYear}>{item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}</Text>
          {selected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Challenge</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Challenge Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Challenge Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Example: Action Movies Challenge"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your challenge..."
                multiline
                numberOfLines={4}
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Movie Search Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Movies</Text>
            
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                  placeholder="Search for movies..."
                  placeholderTextColor="#9CA3AF"
                  onSubmitEditing={searchMovies}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity 
                style={styles.searchButton} 
                onPress={searchMovies} 
                disabled={loadingMovies}
              >
                {loadingMovies ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.searchButtonText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {movieResults.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Search Results</Text>
                <FlatList
                  data={movieResults}
                  renderItem={renderMovieItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.moviesList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>

          {/* Selected Movies Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Movies ({selectedMovies.length})
            </Text>
            {selectedMovies.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="film-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateText}>No movies selected yet</Text>
                <Text style={styles.emptyStateSubtext}>Search and select movies to add to your challenge</Text>
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
                      <Text style={styles.selectedMovieTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.selectedMovieYear}>
                        {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => toggleSelectMovie(item)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#800020" />
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, creating && styles.createButtonDisabled]} 
            onPress={createChallenge} 
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.createButtonText}>Create Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3a2f2f',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign:'center',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#FFDD95',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#2D2D2D',
    color: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  searchIcon: {
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#800020',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 10,
  },
  resultsTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  moviesList: {
    maxHeight: 300,
  },
  movieCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  movieCardSelected: {
    borderColor: '#4ADE80',
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
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  movieYear: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  selectedMovieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectedMoviePoster: {
    width: 40,
    height: 60,
    borderRadius: 6,
  },
  selectedMovieInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedMovieTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  selectedMovieYear: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  createButton: {
    backgroundColor: '#800020',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});