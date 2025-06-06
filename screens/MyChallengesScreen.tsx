import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
  'challenge-details': { id: string };
};

type MyChallengesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyChallenges'>;
};

const MyChallengesScreen: React.FC<MyChallengesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [userChallenges, setUserChallenges] = useState<{ id: string; status: number; challenge_id: string }[]>([]);
  const [completedUserChallenges, setCompletedUserChallenges] = useState<{ id: string; status: number; challenge_id: string }[]>([]);
  const [challenges, setChallenges] = useState<{ id: string; name: string; number_films: number; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // CANVI PRINCIPAL: Utilitzar supabase.auth.user() en lloc de getUser()
      const user = supabase.auth.user();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        // Opcional: navegar al login si no hi ha usuari
        // navigation.replace('Login');
        return;
      }

      const { data: userChallengesData, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);

      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('id, name, number_films, image');

      if (userChallengesError) console.log('Error fetching user_challenges:', userChallengesError);
      if (challengesError) console.log('Error fetching challenges:', challengesError);

      if (userChallengesData && challengesData) {
        setChallenges(challengesData);

        const completed = userChallengesData.filter((uc) => {
          const challenge = challengesData.find((c) => c.id === uc.challenge_id);
          return challenge && uc.status === challenge.number_films;
        });

        const current = userChallengesData.filter((uc) => {
          const challenge = challengesData.find((c) => c.id === uc.challenge_id);
          return challenge && uc.status < challenge.number_films;
        });

        setUserChallenges(current);
        setCompletedUserChallenges(completed);

        // Calcular la suma de XP i actualitzar la taula profiles
        const totalXP = completed.reduce((sum, uc) => {
          const challenge = challengesData.find((c) => c.id === uc.challenge_id);
          return challenge ? sum + challenge.number_films : sum;
        }, 0);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ xp: totalXP })
          .eq('id', user.id);

        if (updateError) {
          console.log('Error updating XP in profiles:', updateError);
        } else {
          console.log(`XP actualitzat correctament: ${totalXP} XP`);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const findChallenge = (challenge_id: string) => challenges.find((c) => c.id === challenge_id);

  const renderCurrentChallenge = (card: { id: string; status: number; challenge_id: string }) => {
    const challenge = findChallenge(card.challenge_id);
    if (!challenge) return null;

    return (
      <TouchableOpacity
        style={styles.cardSmall}
        key={card.id}
        onPress={() => navigation.navigate('challenge-details', { id: challenge.id })}
      >
        {challenge.image ? (
          <Image 
            source={{ uri: challenge.image }} 
            style={styles.challengeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.cardContentSmall}>
          <Text style={styles.cardLabel}>Challenge</Text>
          <Text style={styles.cardTitle}>{challenge.name}</Text>
          <Text style={styles.cardProgressLabel}>Completed:</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                { width: `${Math.min((card.status / challenge.number_films) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={{ color: '#ccc', marginTop: 5, fontSize: 12 }}>
            {card.status} / {challenge.number_films} movies
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>My Challenges</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'current' && styles.activeToggleButton]}
            onPress={() => setActiveTab('current')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'current' && styles.activeToggleButtonText]}>
              Current Challenges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'completed' && styles.activeToggleButton]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'completed' && styles.activeToggleButtonText]}>
              Completed Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'current' ? (
          loading ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Loading challenges...</Text>
          ) : userChallenges.length === 0 ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>No current challenges found.</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.currentScrollContainer} showsVerticalScrollIndicator={false}>
              {userChallenges.map(renderCurrentChallenge)}
            </ScrollView>
          )
        ) : (
          <ScrollView contentContainerStyle={styles.completedContainer} showsVerticalScrollIndicator={false}>
            {loading ? (
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>Loading completed challenges...</Text>
            ) : completedUserChallenges.length === 0 ? (
              <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>No completed challenges found.</Text>
            ) : (
              <View style={styles.currentScrollContainer}>
                {completedUserChallenges.map((uc) => {
                  const challenge = findChallenge(uc.challenge_id);
                  if (!challenge) return null;
                  return (
                    <TouchableOpacity
                      style={styles.cardSmall}
                      key={uc.id}
                      onPress={() => navigation.navigate('challenge-details', { id: challenge.id })}
                    >
                      {challenge.image ? (
                        <Image 
                          source={{ uri: challenge.image }} 
                          style={styles.challengeImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.imagePlaceholder} />
                      )}
                      <View style={styles.cardContentSmall}>
                        <Text style={styles.cardLabel}>Challenge</Text>
                        <Text style={styles.cardTitle}>{challenge.name}</Text>
                        <Text style={styles.cardProgressLabel}>Completed:</Text>
                        <View style={styles.progressBar}>
                          <View style={[styles.progress, { width: '100%' }]} />
                        </View>
                        <Text style={{ color: '#ccc', marginTop: 5, fontSize: 12 }}>
                          {challenge.number_films} / {challenge.number_films} movies
                        </Text>
                        <View style={{ marginTop: 8, backgroundColor: '#800020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{challenge.number_films} XP</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyChallenges')}>
          <Ionicons name="calendar" size={26} color="#FFDD95" />
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
  safeArea: { flex: 1, backgroundColor: '#3a2f2f' },
  screen: { flex: 1, paddingTop: 60 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', alignSelf: 'center', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  toggleButton: { paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 5, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  activeToggleButton: { backgroundColor: '#fff' },
  toggleButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  activeToggleButtonText: { color: '#1e1e1e' },
  currentScrollContainer: { alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  cardSmall: { width: width * 0.9, backgroundColor: '#2a2a2a', borderRadius: 20, overflow: 'hidden', marginVertical: 10 },
  imagePlaceholder: { height: 120, backgroundColor: '#800020', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  challengeImage: { 
    height: 120, 
    width: '100%',
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  cardContentSmall: { padding: 15, alignItems: 'center' },
  cardLabel: { color: '#ccc', fontSize: 14},
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  cardProgressLabel: { color: '#ccc', fontSize: 14, marginTop: 10, alignSelf: 'flex-start' },
  progressBar: { height: 10, backgroundColor: '#444', borderRadius: 20, width: '100%', marginTop: 5 },
  progress: { height: '100%', backgroundColor: '#4ade80', borderRadius: 20 },
  completedContainer: { paddingHorizontal: 15, paddingBottom: 30 },
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

export default MyChallengesScreen;