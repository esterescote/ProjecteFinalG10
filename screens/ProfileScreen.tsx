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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import * as Calendar from 'expo-calendar';
import { Calendar as CalendarView, DateData } from 'react-native-calendars';

/** TYPES */
export type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
};

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
}

/** CONSTANTS */
const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';
const IMG_REGEX = /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp)$/i;

/** COMPONENT */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; column: 'profile_picture' | 'header_picture' }>({ open: false, column: 'profile_picture' });
  const [link, setLink] = useState('');

  /** INIT */
  useEffect(() => {
    (async () => {
      await loadProfile();
      await ensureCalendar();
    })();
  }, []);

  /** Load current user row from profiles */
  const loadProfile = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
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

  /** Calendar permission */
  const ensureCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return;
    const editable = (await Calendar.getCalendarsAsync()).find(c => c.allowsModifications);
    if (editable) setCalendarId(editable.id);
  };

  /** Open modal */
  const askForLink = (column: 'profile_picture' | 'header_picture') => {
    setLink('');
    setModal({ open: true, column });
  };

  /** Save link to DB */
  const handleSave = async () => {
    const url = link.trim();
    if (!IMG_REGEX.test(url)) return Alert.alert('URL invàlida', "L'enllaç ha de ser una imatge (.png, .jpg, ...).");
    if (!profile?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [modal.column]: url })
      .eq('id', profile.id)
      .select(); // force PostgREST to return row → avoids RLS silently failing

    if (error) {
      console.log(error);
      return Alert.alert('Error', "No s'ha pogut desar. Comprova permisos RLS.");
    }

    setProfile({ ...profile, [modal.column]: url });
    setModal({ ...modal, open: false });
  };

  /** Calendar add */
  const addEvent = async (date: string) => {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Modal */}
      <Modal transparent visible={modal.open} animationType="fade" onRequestClose={() => setModal({ ...modal, open: false })}>
        <View style={styles.backdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>Enganxa l'enllaç de la imatge</Text>
            <TextInput placeholder="https://..." value={link} onChangeText={setLink} style={styles.input} autoCapitalize="none" />
            <View style={styles.rowEnd}>
              <TouchableOpacity onPress={() => setModal({ ...modal, open: false })} style={styles.btn}><Text>Cancel·la</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.btn}><Text>Desa</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <TouchableOpacity onPress={() => askForLink('header_picture')}>
          <Image source={{ uri: profile?.header_picture || defaultHeader }} style={styles.headerImg} />
          <Ionicons name="link" size={26} color="#fff" style={styles.iconHeader} />
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarWrapper} onPress={() => askForLink('profile_picture')}>
          <Image source={{ uri: profile?.profile_picture || defaultAvatar }} style={styles.avatar} />
          <Ionicons name="link" size={22} color="#fff" style={styles.avatarIcon} />
        </TouchableOpacity>

        <Text style={styles.username}>{profile?.username ?? 'John Doe'}</Text>
        <Text style={styles.xp}>XP: {profile?.xp ?? 0}</Text>

        <Text style={styles.section}>Calendari</Text>
        <CalendarView onDayPress={(d: DateData) => addEvent(d.dateString)} style={styles.calendar} />
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
          <Ionicons name="add-circle" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
          <Ionicons name="trophy" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={26} color="#FFDD95" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/** styles */
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
  /* modal */
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  title: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 15 },
  rowEnd: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { marginLeft: 15 },
  /* bottom nav */
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
