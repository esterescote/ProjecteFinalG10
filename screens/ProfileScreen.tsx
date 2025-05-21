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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Calendar from 'expo-calendar';
import { Calendar as CalendarView, DateData } from 'react-native-calendars';

const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';

const PROFILE_PICTURES = [
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/darthvader.jpeg',
  'https://wlaumweodxeqrwktfqlg.supabase.co/storage/v1/object/public/profile-images/avatars/mickeymouse.jpg',
  'https://i.imgur.com/tPCEhLg.png',
  'https://i.imgur.com/kTbzJba.png',
  'https://i.imgur.com/TXbJDCh.jpg',
  'https://i.imgur.com/DPzIB6H.jpg',
  'https://i.imgur.com/Aw0BFcs.png',
  'https://i.imgur.com/vA2qtvl.jpg',
  'https://i.imgur.com/sLwXW9x.jpg',
  'https://i.imgur.com/2aCMl7L.png',
];

const HEADER_PICTURES = [
  'https://i.imgur.com/2yHBo8a.jpg',
  'https://i.imgur.com/v91LgQW.jpg',
  'https://i.imgur.com/hqzLtAm.jpg',
  'https://i.imgur.com/LS3VkLj.jpg',
  'https://i.imgur.com/2HLCTaH.jpg',
  'https://i.imgur.com/IYsxrsc.jpg',
  'https://i.imgur.com/oXDZt7p.jpg',
  'https://i.imgur.com/c2KEluL.jpg',
  'https://i.imgur.com/YULw9ar.jpg',
  'https://i.imgur.com/gA1rwtr.jpg',
];

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarId, setCalendarId] = useState(null);
  const [modal, setModal] = useState({ open: false, column: 'profile_picture' });

  useEffect(() => {
    (async () => {
      await loadProfile();
      await ensureCalendar();
    })();
  }, []);

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
    setLoading(false);
  };

  const ensureCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;
    const editable = (await Calendar.getCalendarsAsync()).find(c => c.allowsModifications);
    if (editable) setCalendarId(editable.id);
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

  const addEvent = async (date) => {
    if (!calendarId) return;
    await Calendar.createEventAsync(calendarId, {
      title: 'Nova activitat de repte!',
      startDate: new Date(date),
      endDate: new Date(new Date(date).getTime() + 60 * 60 * 1000),
      timeZone: 'GMT',
    });
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

        <Text style={styles.username}>{profile?.username ?? 'John Doe'}</Text>
        <Text style={styles.xp}>XP: {profile?.xp ?? 0}</Text>

        <Text style={styles.section}>Calendari</Text>
        <CalendarView onDayPress={(d: DateData) => addEvent(d.dateString)} style={styles.calendar} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  headerImg: { width: '100%', height: 250, resizeMode: 'cover' },
  iconHeader: { position: 'absolute', right: 15, bottom: 15 },
  avatarWrapper: { position: 'absolute', top: 150, left: '50%', marginLeft: -60 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  avatarIcon: { position: 'absolute', right: 0, bottom: 0 },
  username: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 90 },
  xp: { textAlign: 'center', color: '#666' },
  section: { fontSize: 18, margin: 20 },
  calendar: { marginHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 12, maxHeight: '80%' },
  title: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  selectImage: { width: 70, height: 70, borderRadius: 10, margin: 5, borderWidth: 2, borderColor: '#ccc' },
});

export default ProfileScreen;
