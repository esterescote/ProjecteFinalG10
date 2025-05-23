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

const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState('');
  const [currentChallenges, setCurrentChallenges] = useState([]);
  const [avatars, setAvatars] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    loadProfile();
  }, [avatars]);

  useEffect(() => {
    if (profile?.id) fetchCurrentChallenges();
  }, [profile]);

  const loadAvatars = async () => {
    const { data, error } = await supabase.from('avatars').select('id, image');
    if (error) {
      console.log('Error loading avatars:', error);
      return;
    }

    // Mapear a URLs públiques
    const avatarsWithUrl = data.map((avatar) => {
      const { publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatar.image);
      return {
        id: avatar.id,
        image: publicUrl,
      };
    });

    setAvatars(avatarsWithUrl);
  };

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

    // Si profile_picture és un id d'avatar, agafem la URL corresponent
    let profilePictureUrl = defaultAvatar;
    if (data?.profile_picture) {
      const avatar = avatars.find((a) => a.id === data.profile_picture);
      if (avatar) profilePictureUrl = avatar.image;
    }

    setProfile({ ...data, profile_picture: profilePictureUrl });
    setUsernameEdit(data?.username ?? '');
    setLoading(false);
  };

  const fetchCurrentChallenges = async () => {
    const { data: userChallenges, error } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', profile.id);

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

  const handleSelectAvatar = async (avatarId, avatarUrl) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ profile_picture: avatarId })
      .eq('id', profile.id);

    if (error) {
      console.log(error);
      Alert.alert('Error', 'No s\'ha pogut actualitzar la imatge de perfil.');
      return;
    }

    // Actualitzar localment
    setProfile({ ...profile, profile_picture: avatarUrl });
    setModalVisible(false);
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
        <Image
          source={{ uri: profile?.header_picture || defaultHeader }}
          style={styles.headerImg}
        />

        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={{ uri: profile?.profile_picture || defaultAvatar }}
            style={styles.avatar}
          />
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
            <Text key={index} style={styles.itemText}>
              🎬 {film}
            </Text>
          ))
        ) : (
          <Text style={styles.noItems}>Encara no tens cap pel·lícula preferida.</Text>
        )}

        <Text style={styles.section}>Reptes actuals</Text>
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

        {/* Modal per escollir avatar */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Escull una imatge de perfil</Text>

              <FlatList
                data={avatars}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectAvatar(item.id, item.image)}
                    style={styles.avatarOptionWrapper}
                  >
                    <Image source={{ uri: item.image }} style={styles.avatarOption} />
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Tancar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  challengeImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 8 },
  challengeName: { fontSize: 14, color: 'white', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#3a2f2f',
    borderRadius: 15,
    padding: 15,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  avatarOptionWrapper: {
    flex: 1 / 3,
    padding: 5,
    alignItems: 'center',
  },
  avatarOption: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: 'white',
  },
  modalCloseButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  modalCloseText: {
    color: '#007bff',
    fontSize: 18,
  },
});

export default ProfileScreen;
