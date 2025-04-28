import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Button, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import * as Calendar from 'expo-calendar';
import { Calendar as CalendarView, DateData } from 'react-native-calendars';


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

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
      } else {
        console.log('Usuario no autenticado:', error?.message);
      }
      setLoading(false);
    };

    const getCalendarPermission = async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync();
        const defaultCalendar = calendars.find(c => c.allowsModifications);
        if (defaultCalendar) {
          setCalendarId(defaultCalendar.id);
        }
      } else {
        Alert.alert('Permís denegat', 'No podem accedir al teu calendari.');
      }
    };

    getCalendarPermission();
    fetchUser();
  }, []);

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

  const userData = {
    username: user?.user_metadata?.username || 'John Doe',
    xp: 1500,
    avatar: user?.user_metadata?.avatar_url || null,
    headerImage: 'https://i.imgur.com/2yHBo8a.jpg',
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={{ uri: userData.headerImage }} style={styles.headerImage} />
        <Image source={{ uri: userData.avatar || defaultAvatar }} style={styles.avatar} />
        <Text style={styles.username}>{userData.username}</Text>
        <Text style={styles.xp}>XP: {userData.xp}</Text>

        <Text style={styles.sectionTitle}>Favourite Films</Text>
        <View style={styles.filmList}>
          {userData.favouriteFilms.map((film, index) => (
            <View key={index} style={styles.filmCard}>
              <Image source={{ uri: film.image }} style={styles.filmImage} />
              <Text style={styles.filmTitle}>{film.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Current Challenge</Text>
        <View style={styles.challengeList}>
          {userData.currentChallenge.map((challenge, index) => (
            <View key={index} style={styles.challengeCard}>
              <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
            </View>
          ))}
        </View>

        {/* 🔥 Afegeixo el CALENDARI 🔥 */}
        <Text style={styles.sectionTitle}>Afegir activitats al teu calendari</Text>
        <CalendarView
          onDayPress={(day: DateData) => {
            console.log('Data seleccionada:', day.dateString);
            addEventToCalendar(day.dateString);
          }}          
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150, // per no tapar el calendari amb la barra
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -60,
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
