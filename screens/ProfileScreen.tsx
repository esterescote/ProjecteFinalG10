// ProfileScreen.tsx
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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';

const PROFILE_PICTURES = [
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/avatar1.png',
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/avatar2.png',
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/avatar3.png',
];

const HEADER_PICTURES = [
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/header1.jpg',
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/headers/header2.jpg',
];

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, column: 'profile_picture' });
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState('');
  const [currentChallenges, setCurrentChallenges] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) fetchCurrentChallenges();
  }, [profile]);

  const loadProfile = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return setLoading(false);

    const { data, error: dbErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (dbErr) console.log(dbErr.message);

    setProfile(data);
    setUsernameEdit(data?.username ?? '');
    setLoading(false);
  };

  const fetchCurrentChallenges = async () => {
    const { data: userChallenges, error } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', profile.id);

    if (error) return console.log(error);

    const challengeIds = userChallenges.map((uc) => uc.challenge_id);

    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select('id, name, image')
      .in('id', challengeIds);

    if (challengesError) return console.log(challengesError);

    setCurrentChallenges(challenges);
  };

  const openImagePicker = (column) => {
    setModal({ open: true, column });
  };

  const handleSelectImage = async (url) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [modal.column]: url })
      .eq('id', profile.id);

    if (error) {
      console.log(error);
      return Alert.alert('Error', "No s'ha pogut desar la imatge.");
    }

    setProfile({ ...profile, [modal.column]: url });
    setModal({ ...modal, open: false });
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const imageList = modal.column === 'profile_picture' ? PROFILE_PICTURES : HEADER_PICTURES;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal transparent visible={modal.open} animationType="fade" onRequestClose={() => setModal({ ...modal, open: false })}>
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Selecciona una imatge</Text>
            <View style={styles.gridContainer}>
              {imageList.map((url, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleSelectImage(url)}>
                  <Image source={{ uri: url }} style={styles.selectImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => openImagePicker('header_picture')}>
          <Image source={{ uri: profile?.header_picture || defaultHeader }} style={styles.headerImg} />
          <Ionicons name="link" size={26} color="#fff" style={styles.iconHeader} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarWrapper} onPress={() => openImagePicker('profile_picture')}>
          <Image source={{ uri: profile?.profile_picture || defaultAvatar }} style={styles.avatar} />
          <Ionicons name="link" size={22} color="#fff" style={styles.avatarIcon} />
        </TouchableOpacity>

        <View style={styles.usernameWrapper}>
          {editingUsername ? (
            <>
              <TextInput
                value={usernameEdit}
                onChangeText={setUsernameEdit}
                style={styles.usernameInput}
              />
              <TouchableOpacity onPress={handleSaveUsername}>
                <Text style={styles.saveButton}>Desar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.usernameRow}>
              <Text style={styles.username}>{profile?.username ?? 'John Doe'}</Text>
              <TouchableOpacity onPress={() => setEditingUsername(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.xp}>XP: {profile?.xp ?? 0}</Text>

        <Text style={styles.section}>Pel·lícules preferides</Text>
        {profile?.favourite_films?.length > 0 ? (
          profile.favourite_films.map((film, index) => (
            <Text key={index} style={styles.itemText}>🎬 {film}</Text>
          ))
        ) : (
          <Text style={styles.noItems}>Encara no tens cap pel·lícula preferida.</Text>
        )}

        <Text style={styles.section}>Current Challenges</Text>
        {currentChallenges.length === 0 ? (
          <Text style={styles.noItems}>No estàs fent cap repte actualment.</Text>
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

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#3a2f2f' },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  headerImg: { width: '100%', height: 250, resizeMode: 'cover' },
  iconHeader: { position: 'absolute', right: 15, bottom: 15 },
  avatarWrapper: { position: 'absolute', top: 150, left: '50%', marginLeft: -60 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  avatarIcon: { position: 'absolute', right: 0, bottom: 0 },
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
  },
  saveButton: { color: '#007bff', marginTop: 5 },
  xp: { textAlign: 'center', color: 'white' },
  section: { fontSize: 18, margin: 20, color: 'white' },
  noItems: { textAlign: 'center', color: 'white', marginBottom: 10 },
  itemText: { color: 'white', paddingHorizontal: 20, marginBottom: 6 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 12, maxHeight: '80%' },
  title: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  selectImage: { width: 70, height: 70, borderRadius: 10, margin: 5, borderWidth: 2, borderColor: '#ccc' },
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
  challengeImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 8 },
  challengeName: { fontSize: 14, color: 'white', textAlign: 'center' },
});

export default ProfileScreen;