import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import * as Calendar from 'expo-calendar';
import { Calendar as CalendarView, DateData } from 'react-native-calendars';

/**
 * Tipus de navegació
 */
type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png';
const defaultHeader = 'https://i.imgur.com/2yHBo8a.jpg';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [headerUrl, setHeaderUrl] = useState<string | null>(null);

  /**
   * ────────────────────────────────────────────────────────────────────────────────
   * INICIALITZACIÓ
   * ────────────────────────────────────────────────────────────────────────────────
   */
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        setHeaderUrl(user.user_metadata?.header_url || null);
      } else {
        console.log('Usuari no autenticat:', error?.message);
      }
      setLoading(false);
    };

    /** Calendar permission  */
    const getCalendarPermission = async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permís denegat', 'No podem accedir al teu calendari.');
        return;
      }
      const calendars = await Calendar.getCalendarsAsync();
      let editable = calendars.find(c => c.allowsModifications);
      if (!editable) {
        const newCalendarId = await Calendar.createCalendarAsync({
          title: 'Reptes App Calendar',
          color: '#FFDD95',
          entityType: Calendar.EntityTypes.EVENT,
          source: Platform.OS === 'ios'
            ? (await Calendar.getDefaultCalendarAsync()).source
            : { isLocalAccount: true, name: 'Reptes Calendar', type: Calendar.SourceType.LOCAL },
          name: 'Reptes Calendar',
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
          ownerAccount: 'personal',
        });
        setCalendarId(newCalendarId);
      } else {
        setCalendarId(editable.id);
      }
    };

    getCalendarPermission();
    fetchUser();
  }, []);

  /**
   * ────────────────────────────────────────────────────────────────────────────────
   * FUNCIONS D'IMATGE
   * ────────────────────────────────────────────────────────────────────────────────
   */
  const pickImageAndUpload = async (type: 'avatar' | 'header') => {
    // Demana permís
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permís denegat', 'Cal permís per accedir a les fotos.');
      return;
    }

    // Obrir galeria
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    const path = `${user.id}/${type}-${Date.now()}.jpg`;

    // Pujar a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile')
      .upload(path, {
        uri: file.uri,
        type: 'image/jpeg',
        name: path,
      } as any,
      { upsert: true });

    if (uploadError) {
      Alert.alert('Error', 'No s\'ha pogut pujar la imatge.');
      return;
    }

    // Obtenir URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile').getPublicUrl(path);

    // Guardar al perfil de l'usuari
    const { error: updateError } = await supabase.auth.updateUser({
      data: type === 'avatar' ? { avatar_url: publicUrl } : { header_url: publicUrl },
    });

    if (updateError) {
      Alert.alert('Error', 'No s\'ha pogut actualitzar el perfil.');
      return;
    }

    type === 'avatar' ? setAvatarUrl(publicUrl) : setHeaderUrl(publicUrl);
  };

  /**
   * ────────────────────────────────────────────────────────────────────────────────
   * CALENDARI
   * ────────────────────────────────────────────────────────────────────────────────
   */
  const addEventToCalendar = async (dateString: string) => {
    if (!calendarId) {
      Alert.alert('Error', 'No s\'ha trobat un calendari per defecte.');
      return;
    }

    try {
      await Calendar.createEventAsync(calendarId, {
        title: 'Nova activitat de repte!',
        startDate: new Date(dateString),
        endDate: new Date(new Date(dateString).getTime() + 60 * 60 * 1000), // +1h
        timeZone: 'GMT',
        location: 'App de Reptes',
      });
      Alert.alert('Fet!', 'S\'ha afegit una activitat al teu calendari.');
    } catch (error) {
      console.log('Error afegint al calendari:', error);
      Alert.alert('Error', 'No s\'ha pogut afegir l\'esdeveniment.');
    }
  };

  /**
   * ────────────────────────────────────────────────────────────────────────────────
   * DADES MOCK (per eliminar quan hi hagi backend complet)
   * ────────────────────────────────────────────────────────────────────────────────
   */
  const userData = {
    username: user?.user_metadata?.username || 'John Doe',
    xp: 1500,
    favouriteFilms: [
      { title: 'Inception', image: 'https://image.tmdb.org/t/p/w500/6V1bK1pEAT2k0i3GTLhxvDZjzQS.jpg' },
      { title: 'The Matrix', image: 'https://image.tmdb.org/t/p/w500/4Y1cHLZ3vbs4lG5Xfsk9E3tMQQR.jpg' },
    ],
    currentChallenge: [
      { title: 'Challenge 1', image: 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2016/09/pulp-fiction.jpg?tf=3840x' },
      { title: 'Challenge 2', image: 'https://www.eyeforfilm.co.uk/images/newsite/the-shawshank-redemption_600.webp' },
    ],
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#800000" />
      </View>
    );
  }

  /**
   * ────────────────────────────────────────────────────────────────────────────────
   * RENDER
   * ────────────────────────────────────────────────────────────────────────────────
   */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Image */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => pickImageAndUpload('header')}>
          <Image source={{ uri: headerUrl || defaultHeader }} style={styles.headerImage} />
          <Ionicons name="camera" size={28} color="#fff" style={styles.headerIcon} />
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          activeOpacity={0.8}
          onPress={() => pickImageAndUpload('avatar')}
        >
          <Image source={{ uri: avatarUrl || defaultAvatar }} style={styles.avatar} />
          <Ionicons name="camera" size={24} color="#fff" style={styles.avatarIcon} />
        </TouchableOpacity>

        {/* Username & XP */}
        <Text style={styles.username}>{userData.username}</Text>
        <Text style={styles.xp}>XP: {userData.xp}</Text>

        {/* Favourite Films */}
        <Text style={styles.sectionTitle}>Pel·lícules preferides</Text>
        <View style={styles.filmList}>
          {userData.favouriteFilms.map((film, index) => (
            <View key={index} style={styles.filmCard}>
              <Image source={{ uri: film.image }} style={styles.filmImage} />
              <Text style={styles.filmTitle}>{film.title}</Text>
            </View>
          ))}
        </View>

        {/* Current Challenge */}
        <Text style={styles.sectionTitle}>Repte actual</Text>
        <View style={styles.challengeList}>
          {userData.currentChallenge.map((challenge, index) => (
            <View key={index} style={styles.challengeCard}>
              <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
            </View>
          ))}
        </View>

        {/* Calendari */}
        <Text style={styles.sectionTitle}>Afegir activitats al teu calendari</Text>
        <CalendarView
          onDayPress={(day: DateData) => addEventToCalendar(day.dateString)}
          style={styles.calendar}
        />
      </ScrollView>

      {/* Barra de navegació inferior */}
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

/**
 * ────────────────────────────────────────────────────────────────────────────────
 * ESTILS
 * ────────────────────────────────────────────────────────────────────────────────
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  headerIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  avatarWrapper: {
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 90,
  },
  xp: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 20,
  },
  filmList: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  filmCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  filmImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  filmTitle: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  challengeList: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  challengeCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  challengeImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  challengeTitle: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2b2323',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendar: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default ProfileScreen;