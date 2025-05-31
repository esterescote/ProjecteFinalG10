import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // CANVI PRINCIPAL: Utilitzar supabase.auth.user() en lloc de getUser()
      const user = supabase.auth.user();

      if (!user) {
        console.log('No user found');
        // Opcional: navegar al login si no hi ha usuari
        // navigation.replace('Login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else {
        setUsername(data.username);
        setProfilePicture(data.profile_picture);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>{username ?? ''}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{
                uri: profilePicture ?? 'https://i.imgur.com/4YQF2kR.png',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Nice to see you here again!</Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {/* Secció 1 */}
          <Text style={styles.sectionTitle}>New Challenges</Text>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NewChallenges')}
          >
            <Image
              source={{
                uri: 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2016/09/pulp-fiction.jpg?tf=3840x',
              }}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>
              Start existing challenges or create your own
            </Text>
          </TouchableOpacity>

          {/* Secció 2 */}
          <Text style={styles.sectionTitle}>My Challenges</Text>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MyChallenges')}
          >
            <Image
              source={{
                uri: 'https://www.eyeforfilm.co.uk/images/newsite/the-shawshank-redemption_600.webp',
              }}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>
              Check the status of your current challenge
            </Text>
          </TouchableOpacity>

          {/* Secció 3 */}
          <Text style={styles.sectionTitle}>My Progress</Text>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Progress')}
          >
            <Image
              source={{
                uri: 'https://estaticos-cdn.prensaiberica.es/clip/0877e41a-8bb1-460f-81fc-61ce2e292193_source-aspect-ratio_default_0.jpg',
              }}
              style={styles.cardImage}
            />
            <Text style={styles.cardText}>
              Your progress, points, challenges completed, movies watched...
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Menú inferior FIX */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={26} color="#FFDD95" />
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
          <Ionicons name="person" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3a2f2f',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#555',
  },
  welcome: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scroll: {
    paddingBottom: 120,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  separator: {
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  cardText: {
    color: '#fff',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    fontSize: 14,
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

export default HomeScreen;