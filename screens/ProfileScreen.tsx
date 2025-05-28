import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  MyChallenges: undefined;
  NewChallenges: undefined;
  CreateChallenge: undefined; 
  Progress: undefined;
  Profile: undefined;
  'challenge-details': { id: string };
};

const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';

type Challenge = {
  id: string;
  name: string;
  image: string;
};

type Profile = {
  id: string;
  username: string;
  email: string;
  profile_picture?: string;
  header_picture?: string;
  xp?: number;
  favourite_films?: string[];
};

type AvatarOption = {
  id: string;
  uri: string;
  name: string;
};

const avatarOptions: AvatarOption[] = [
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

const headerOptions: AvatarOption[] = [
  { id: '1', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/dc.jpg', name: 'DC Comics' },
  { id: '2', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/dune.jpg', name: 'Dune' },
  { id: '4', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/grease.jpg', name: 'Grease' },
  { id: '7', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/hobbit.png', name: 'The Hobbit' },
  { id: '5', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/jaws.jpg', name: 'Jaws' },
  { id: '6', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/killbill.jpg', name: 'Kill Bill' },
  { id: '7', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/lordrings.png', name: 'The Lord of the Rings' },
  { id: '8', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/marvel.png', name: 'Marvel' },
  { id: '9', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/sw.jpeg', name: 'Star Wars' },
  { id: '10', uri: 'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/terminator.jpg', name: '' },
];

const ProfileScreen = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingUsername, setEditingUsername] = useState<boolean>(false);
  const [usernameEdit, setUsernameEdit] = useState<string>('');
  const [currentChallenges, setCurrentChallenges] = useState<Challenge[]>([]);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [headerModalVisible, setHeaderModalVisible] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [updatingHeader, setUpdatingHeader] = useState(false);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      setLoading(false);
      return;
    }

    const { data, error: dbErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (dbErr) {
      console.log(dbErr.message);
      setLoading(false);
      return;
    }

    setProfile({
      ...data,
      email: session.user.email,
      favourite_films: data?.favourite_films ?? [],
    });

    setUsernameEdit(data?.username ?? '');
    await fetchCurrentChallenges(session.user.id);
    setLoading(false);
  };

  const fetchCurrentChallenges = async (userId: string) => {
    const { data: userChallenges, error } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', userId);

    if (error) {
      console.log(error);
      return;
    }

    const challengeIds = userChallenges.map((uc) => uc.challenge_id);

    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, name, image')
      .in('id', challengeIds);

    if (challengesError) {
      console.log(challengesError);
      return;
    }

    setCurrentChallenges(challenges);
  };

  const handleSaveUsername = async () => {
    if (!profile?.id) return;
    const { error } = await supabase
      .from('profiles')
      .update({ username: usernameEdit })
      .eq('id', profile.id);

    if (error) {
      console.log(error);
      return Alert.alert('Error', "No s'ha pogut actualitzar el nom.");
    }

    setProfile({ ...profile, username: usernameEdit });
    setEditingUsername(false);
  };

  const handleAvatarSelect = async (avatarUri: string) => {
    if (!profile?.id) return;
    setUpdatingAvatar(true);

    const { error } = await supabase
      .from('profiles')
      .update({ profile_picture: avatarUri })
      .eq('id', profile.id);

    if (error) {
      console.log(error);
      Alert.alert('Error', "Could not update your profile picture.");
      setUpdatingAvatar(false);
      return;
    }

    setProfile({ ...profile, profile_picture: avatarUri });
    setAvatarModalVisible(false);
    setUpdatingAvatar(false);
  };

  const handleHeaderSelect = async (headerUri: string) => {
    if (!profile?.id) return;
    setUpdatingHeader(true);

    const { error } = await supabase
      .from('profiles')
      .update({ header_picture: headerUri })
      .eq('id', profile.id);

    if (error) {
      console.log(error);
      Alert.alert('Error', "Could not update your header picture.");
      setUpdatingHeader(false);
      return;
    }

    setProfile({ ...profile, header_picture: headerUri });
    setHeaderModalVisible(false);
    setUpdatingHeader(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setHeaderModalVisible(true)}>
          <Image
            source={{ uri: profile?.header_picture || defaultHeader }}
            style={styles.headerImg}
          />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            <Image
              source={{ uri: profile?.profile_picture || defaultAvatar }}
              style={styles.avatar}
            />
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
              <Text style={styles.username}>{profile?.username ?? 'Usuari anònim'}</Text>
              <TouchableOpacity onPress={() => setEditingUsername(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.xp}>XP: {profile?.xp ?? 0}</Text>

        <Text style={styles.section}>Favourite films</Text>
        {profile?.favourite_films && profile.favourite_films.length > 0 ? (
          profile.favourite_films.map((film, index) => (
            <Text key={index} style={styles.itemText}>
              🎬 {film}
            </Text>
          ))
        ) : (
          <Text style={styles.noItems}>You do not have favourite films</Text>
        )}

        <Text style={styles.section}>Current Challenges</Text>
        {currentChallenges.length === 0 ? (
          <Text style={styles.noItems}>You do not have any current challenge.</Text>
        ) : (
          <ScrollView horizontal contentContainerStyle={styles.horizontalList}>
            {currentChallenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengePill}>
                <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
                <Text style={styles.challengeName}>{challenge.name}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Modal per triar avatar */}
        <Modal
          visible={avatarModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAvatarModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {updatingAvatar ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <FlatList
                  data={avatarOptions}
                  keyExtractor={(item) => item.id}
                  numColumns={5}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ alignItems: 'center', marginBottom: 10 }}
                      onPress={() => handleAvatarSelect(item.uri)}
                    >
                      <Image source={{ uri: item.uri }} style={styles.avatarOption} />
                      <Text
                        style={styles.avatarText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAvatarModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Tancar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal per triar header */}
        <Modal
          visible={headerModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setHeaderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {updatingHeader ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <FlatList
                  data={headerOptions}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ alignItems: 'center', marginBottom: 10 }}
                      onPress={() => handleHeaderSelect(item.uri)}
                    >
                      <Image source={{ uri: item.uri }} style={styles.headerOption} />
                      <Text
                        style={styles.avatarText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHeaderModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyChallenges')}>
          <Ionicons name="calendar" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('NewChallenges')}>
          <Ionicons name="add-circle" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
          <Ionicons name="trophy" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={30} color="#FFDD95" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3a2f2f' },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  headerImg: { width: '100%', height: 250, resizeMode: 'cover' },
  avatarWrapper: {
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -60,
    zIndex: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  usernameWrapper: { alignItems: 'center', marginTop: 90 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: 'white' },
  editIcon: { fontSize: 20, marginLeft: 6 },
  usernameInput: {
    fontSize: 24,
    borderBottomWidth: 1,
    textAlign: 'center',
    paddingVertical: 4,
    width: 200,
    color: 'white',
    borderBottomColor: 'white',
  },
  saveButton: { color: '#007bff', marginTop: 5 },
  xp: { textAlign: 'center', color: 'white' },
  section: { fontSize: 18, margin: 20, color: 'white' },
  noItems: { textAlign: 'center', color: 'white', marginBottom: 10 },
  itemText: { color: 'white', paddingHorizontal: 20, marginBottom: 6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  horizontalList: { paddingHorizontal: 20 },
  challengePill: {
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#4a3d3d',
    borderRadius: 12,
    padding: 10,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  challengeImage: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  challengeName: { color: 'white', textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#4a3d3d',
    borderRadius: 10,
    maxHeight: '80%',
    padding: 15,
  },
  columnWrapper: {
    justifyContent: 'space-around',
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: 'white',
    borderWidth: 1,
    marginHorizontal: 5,
  },
  headerOption: {
    width: 150,
    height: 80,
    borderRadius: 12,
    borderColor: 'white',
    borderWidth: 1,
    marginHorizontal: 5,
  },
  avatarText: {
    color: 'white',
    fontSize: 10,
    marginTop: 3,
    width: 60,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2b2323',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
});

export default ProfileScreen;
