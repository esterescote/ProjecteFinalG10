import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      setError('Por favor completa todos los campos.');
      return;
    }

    setCreating(true);

    const tmdb_movie_ids = selectedMovies.map((m) => m.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Usuario no autenticado.');
        setCreating(false);
        return;
      }

      const { error: supabaseError } = await supabase.from('challenges').insert([
        {
          user_id: user.id,        // Aquí se guarda el id del creador
          name: name.trim(),
          description: description.trim(),
          tmdb_movie_ids,
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
      setError('Error al crear el reto.');
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del reto</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ejemplo: Reto de películas de acción"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe tu reto"
        multiline
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Buscar películas para añadir al reto</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          placeholder="Palabra clave de película"
          placeholderTextColor="#aaa"
          onSubmitEditing={searchMovies}
          returnKeyType="search"
        />
        <Button title="Buscar" onPress={searchMovies} disabled={loadingMovies} />
      </View>

      {loadingMovies && <ActivityIndicator size="small" color="#800000" style={{ marginBottom: 10 }} />}

      <FlatList
        data={movieResults}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={false}
        style={{ maxHeight: 200, marginBottom: 20 }}
      />

      <Text style={styles.label}>Películas seleccionadas</Text>
      {selectedMovies.length === 0 ? (
        <Text style={{ color: '#ccc', marginBottom: 20 }}>No has seleccionado ninguna película.</Text>
      ) : (
        <FlatList
          data={selectedMovies}
          renderItem={({ item }) => (
            <View style={styles.selectedMovieItem}>
              <Text style={{ color: 'white' }}>{item.title}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          style={{ marginBottom: 20 }}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button title={creating ? 'Creando...' : 'Crear reto'} onPress={createChallenge} disabled={creating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  label: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#2e2e2e',
    color: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  movieCard: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#2e2e2e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  movieCardSelected: {
    borderColor: '#800000',
    borderWidth: 2,
  },
  moviePoster: {
    width: 80,
    height: 120,
  },
  movieInfo: {
    flex: 1,
    padding: 10,
  },
  movieTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  movieYear: {
    color: '#ccc',
    marginTop: 4,
  },
  selectedMovieItem: {
    backgroundColor: '#800000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
