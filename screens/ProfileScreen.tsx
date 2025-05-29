import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, TextInput, Modal, FlatList,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined; MyChallenges: undefined; NewChallenges: undefined;
  CreateChallenge: undefined; Progress: undefined; Profile: undefined;
  'challenge-details': { id: string };
};

const TMDB_API_KEY = '4d3cb710ab798774158802e72c50dfa2';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

type Challenge = { id: string; name: string; image: string; };
type Profile = {
  id: string; username: string; email: string;
  profile_picture?: string; header_picture?: string;
  xp?: number; favourite_films?: string[];
};
type TMDBMovie = { id: number; title: string; poster_path: string | null; release_date: string; overview: string; };

const avatarOptions = [
  { id: '1', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/darthvader.jpeg', name: 'Darth Vader' },
  { id: '2', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/clarkkent.jpg', name: 'Clark Kent' },
  { id: '3', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/eleven.jpg', name: 'Eleven' },
  { id: '4', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/ethanhunt.jpg', name: 'Ethan Hunt' },
  { id: '5', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/et.jpg', name: 'E.T.' },
  { id: '6', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/hermionegranger.jpg', name: 'Hermione Granger' },
  { id: '7', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/peterparker.jpeg', name: 'Peter Parker' },
  { id: '8', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/professorlangdon.jpeg', name: 'Professor Langdon' },
  { id: '9', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/thor.jpeg', name: 'Thor' },
  { id: '10', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/vincentvega.jpeg', name: 'Vincent Vega' },
];

const headerOptions = [
  { id: '1', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/dc.jpg', name: 'DC Comics' },
  { id: '2', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/dune.jpg', name: 'Dune' },
  { id: '3', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/grease.jpg', name: 'Grease' },
  { id: '4', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/hobbit.png', name: 'The Hobbit' },
  { id: '5', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/jaws.jpg', name: 'Jaws' },
  { id: '6', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/killbill.jpg', name: 'Kill Bill' },
  { id: '7', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/lordrings.png', name: 'The Lord of the Rings' },
  { id: '8', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/marvel.png', name: 'Marvel' },
  { id: '9', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/sw.jpeg', name: 'Star Wars' },
  { id: '10', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/terminator.jpg', name: 'Terminator' },
];

const ProfileScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState('');
  const [currentChallenges, setChallenges] = useState<Challenge[]>([]);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [headerModalVisible, setHeaderModalVisible] = useState(false);
  const [movieSearchVisible, setMovieSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();
      if (profileError) return;

      let favouriteFilms = profileData?.favourite_films || [];
      if (typeof favouriteFilms === 'string') {
        try { favouriteFilms = JSON.parse(favouriteFilms); } 
        catch { favouriteFilms = [favouriteFilms]; }
      }
      if (!Array.isArray(favouriteFilms)) favouriteFilms = [];

      setProfile({ ...profileData, email: session.user.email, favourite_films: favouriteFilms });
      setUsernameEdit(profileData?.username ?? '');
      await fetchCurrentChallenges(session.user.id);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentChallenges = async (userId: string) => {
    const { data: userChallenges } = await supabase
      .from('user_challenges').select('challenge_id').eq('user_id', userId);
    if (!userChallenges?.length) return setChallenges([]);

    const { data: challenges } = await supabase
      .from('challenges').select('id, name, image')
      .in('id', userChallenges.map(uc => uc.challenge_id));
    setChallenges(challenges || []);
  };

  const updateProfile = async (field: string, value: any) => {
    if (!profile?.id) return;
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', profile.id);
    if (error) return Alert.alert('Error', 'Could not update profile');
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveUsername = async () => {
    await updateProfile('username', usernameEdit);
    setEditingUsername(false);
  };

  const searchMovies = async (query: string) => {
    if (!query.trim()) return setSearchResults([]);
    setSearchLoading(true);
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      Alert.alert('Error', 'Could not search movies');
    } finally {
      setSearchLoading(false);
    }
  };

  const addFavouriteFilm = async (movie: TMDBMovie) => {
  if (!profile?.id) return;
  const currentFilms = profile.favourite_films || [];

  if (currentFilms.find((f: any) => f.id === movie.id)) {
    return Alert.alert('Duplicate', 'Movie already in favorites');
  }

  if (currentFilms.length >= 4) {
    return Alert.alert('Limit reached', 'Maximum 4 favorite movies');
  }

  const newFilm = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
  };

  const updatedFilms = [...currentFilms, newFilm];
  await updateProfile('favourite_films', updatedFilms);
  setMovieSearchVisible(false);
  setSearchQuery('');
  setSearchResults([]);
};


  const removeFavouriteFilm = async (filmToRemove: string) => {
    if (!profile?.id) return;
    const updatedFilms = (profile.favourite_films || []).filter(film => film !== filmToRemove);
    await updateProfile('favourite_films', updatedFilms);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchMovies(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="white" /></View>;

  const renderModal = (visible: boolean, onClose: () => void, data: any[], onSelect: (uri: string) => void, isAvatar = false) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            key={isAvatar ? 'avatar-grid' : 'header-grid'}
            data={data}
            keyExtractor={(item) => item.id}
            numColumns={isAvatar ? 5 : 2}
            contentContainerStyle={isAvatar ? styles.avatarGrid : styles.headerGrid}
            columnWrapperStyle={isAvatar ? styles.avatarRow : styles.headerRow}
            renderItem={({ item }) => (
              <TouchableOpacity style={isAvatar ? styles.avatarOptionItem : styles.headerOptionItem} onPress={() => { onSelect(item.uri); onClose(); }}>
                <Image source={{ uri: item.uri }} style={isAvatar ? styles.avatarOption : styles.headerOption} />
                <Text style={styles.optionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setHeaderModalVisible(true)}>
          <Image source={{ uri: profile?.header_picture || 'https://i.imgur.com/2yHBo8a.jpg' }} style={styles.headerImg} />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            <Image source={{ uri: profile?.profile_picture || 'https://i.imgur.com/4YQF2kR.png' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        <View style={styles.usernameWrapper}>
  {editingUsername ? (
    <>
      <TextInput 
        value={usernameEdit} 
        onChangeText={setUsernameEdit} 
        style={styles.usernameInput} 
        autoFocus 
      />
      <TouchableOpacity onPress={handleSaveUsername}>
        <Text style={styles.saveButton}>Save</Text>
      </TouchableOpacity>
    </>
  ) : (
    <View style={styles.usernameRow}>
      <Text style={styles.username}>{profile?.username ?? 'Anonymous User'}</Text>
      <TouchableOpacity onPress={() => setEditingUsername(true)} style={styles.editButton}>
        <Ionicons name="pencil" size={20} color="white" />
      </TouchableOpacity>
    </View>
  )}
</View>

        <Text style={styles.xp}>XP: {profile?.xp ?? 0}</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Favourite Films</Text>
          <TouchableOpacity onPress={() => setMovieSearchVisible(true)} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {(profile?.favourite_films?.length ?? 0) > 0 ? (
          profile?.favourite_films!.map((film, i) => (
            <View key={i} style={styles.filmItem}>
              <Text style={styles.itemText}> {film}</Text>
              <TouchableOpacity onPress={() => removeFavouriteFilm(film)}>
                <Ionicons name="close-circle" size={20} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          ))
        ) : <Text style={styles.noItems}>No favourite films</Text>}

        <Text style={styles.section}>Current Challenges</Text>
        {currentChallenges.length === 0 ? (
          <Text style={styles.noItems}>No current challenges</Text>
        ) : (
          <ScrollView horizontal contentContainerStyle={styles.horizontalList}>
            {currentChallenges.map((challenge) => (
              <TouchableOpacity key={challenge.id} style={styles.challengePill}
                onPress={() => navigation.navigate('challenge-details', { id: challenge.id })}>
                <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
                <View style={styles.challengeOverlay}>
                  <Text style={styles.challengeName}>{challenge.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Movie Search Modal */}
        <Modal visible={movieSearchVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.searchModalContent}>
              <View style={styles.searchHeader}>
                <Text style={styles.searchTitle}>Search Movies</Text>
                <TouchableOpacity onPress={() => setMovieSearchVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <TextInput style={styles.searchInput} placeholder="Search movies..." placeholderTextColor="#aaa"
                value={searchQuery} onChangeText={setSearchQuery} autoFocus />
              {searchLoading ? (
                <ActivityIndicator size="large" color="white" style={styles.searchLoader} />
              ) : (
                <FlatList data={searchResults} keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.movieItem} onPress={() => addFavouriteFilm(item)}>
                      <Image source={{ uri: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image' }}
                        style={styles.moviePoster} />
                      <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle}>{item.title}</Text>
                        <Text style={styles.movieYear}>{item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}</Text>
                        <Text style={styles.movieOverview} numberOfLines={3}>{item.overview || 'No description'}</Text>
                      </View>
                    </TouchableOpacity>
                  )} />
              )}
            </View>
          </View>
        </Modal>

        {renderModal(avatarModalVisible, () => setAvatarModalVisible(false), avatarOptions, 
          (uri) => updateProfile('profile_picture', uri), true)}
        {renderModal(headerModalVisible, () => setHeaderModalVisible(false), headerOptions, 
          (uri) => updateProfile('header_picture', uri))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'home', route: 'Home' },
          { icon: 'calendar', route: 'MyChallenges' },
          { icon: 'add-circle', route: 'NewChallenges' },
          { icon: 'trophy', route: 'Progress' },
          { icon: 'person', route: 'Profile', color: '#FFDD95', size: 30 }
        ].map(({ icon, route, color = 'white', size = 26 }) => (
          <TouchableOpacity key={route} onPress={() => navigation.navigate(route as any)}>
            <Ionicons name={icon as any} size={size} color={color} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3a2f2f' },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  headerImg: { width: '100%', height: 250, resizeMode: 'cover' },
  avatarWrapper: { position: 'absolute', top: 150, left: '50%', marginLeft: -60, zIndex: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  usernameWrapper: { alignItems: 'center', marginTop: 90 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'white' },
  editIcon: { fontSize: 20, marginLeft: 6 },
  usernameInput: { fontSize: 24, borderBottomWidth: 1, textAlign: 'center', paddingVertical: 4, width: 200, color: 'white', borderBottomColor: 'white' },
  saveButton: { color: '#007bff', marginTop: 5 },
  xp: { textAlign: 'center', color: 'white' },
  section: { fontSize: 18, margin: 20, color: 'white' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  searchButton: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20 },
  editButton: {
  padding: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  marginLeft: 8, // opcional, per separar una mica del text
},

  filmItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 6 },
  noItems: { textAlign: 'center', color: 'white', marginBottom: 10 },
  itemText: { color: 'white', flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  horizontalList: { paddingHorizontal: 20, paddingVertical: 10 },
  challengePill: { marginRight: 15, alignItems: 'center', borderRadius: 12, width: 200, height: 140, overflow: 'hidden' },
  challengeImage: { width: '100%', height: '100%', borderRadius: 12, position: 'absolute' },
  challengeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingVertical: 12, paddingHorizontal: 10, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  challengeName: { color: 'white', textAlign: 'center', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#4a3d3d', borderRadius: 10, maxHeight: '80%', padding: 15 },
  searchModalContent: { backgroundColor: '#4a3d3d', borderRadius: 10, maxHeight: '90%', padding: 15, marginTop: 50 },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  searchTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  searchInput: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: 12, color: 'white', fontSize: 16, marginBottom: 15 },
  searchLoader: { marginTop: 50 },
  movieItem: { flexDirection: 'row', padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8, marginBottom: 10 },
  moviePoster: { width: 60, height: 90, borderRadius: 4, marginRight: 12 },
  movieInfo: { flex: 1, justifyContent: 'flex-start' },
  movieTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  movieYear: { color: '#ccc', fontSize: 14, marginBottom: 6 },
  movieOverview: { color: '#aaa', fontSize: 12, lineHeight: 16 },
  optionItem: { alignItems: 'center', marginBottom: 10 },
  avatarGrid: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 },
  avatarRow: { justifyContent: 'space-evenly', marginBottom: 15 },
  avatarOptionItem: { 
    alignItems: 'center', 
    marginBottom: 15,
    flex: 1,
    maxWidth: '20%',
  },
  avatarOption: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    borderColor: 'white', 
    borderWidth: 2,
    marginBottom: 5,
  },
  // New header-specific styles for centering and proper spacing
  headerGrid: { 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerRow: { 
    justifyContent: 'space-around', 
    marginBottom: 15,
  },
  headerOptionItem: { 
    alignItems: 'center', 
    marginBottom: 15,
    flex: 1,
    marginHorizontal: 10,
  },
  headerOption: { 
    width: 150, 
    height: 80, 
    borderRadius: 12, 
    borderColor: 'white', 
    borderWidth: 1, 
    marginBottom: 8,
  },
  optionText: { 
    color: 'white', 
    fontSize: 13, // Increased from 10 to 13
    textAlign: 'center',
    paddingHorizontal: 4,
    lineHeight: 16, // Increased line height for better readability
    fontWeight: '500', // Added font weight for better visibility
  },
  closeButton: { marginTop: 15, backgroundColor: '#222', borderRadius: 8, paddingVertical: 10 },
  closeButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#2b2323', paddingVertical: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});

export default ProfileScreen;