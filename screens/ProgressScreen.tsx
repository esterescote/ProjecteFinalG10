import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<ParamListBase>;

export default function ProgressScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [watchedCounts, setWatchedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('Error al obtener el usuario:', userError);
        setLoading(false);
        return;
      }
      setUser(userData.user);

      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userData.user.id);

      if (userChallengesError) {
        console.error('Error al obtener user_challenges:', userChallengesError);
        setLoading(false);
        return;
      }

      if (!userChallenges.length) {
        setChallenges([]);
        setLoading(false);
        return;
      }

      const challengeIds = userChallenges.map((uc) => uc.challenge_id);

      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .in('id', challengeIds);

      if (challengeError) {
        console.error('Error al obtener los challenges:', challengeError);
        setLoading(false);
        return;
      }

      setChallenges(challengeData || []);

      const counts: Record<string, number> = {};
      for (const challengeId of challengeIds) {
        const { count, error: countError } = await supabase
          .from('watched_movies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userData.user.id)
          .eq('challenge_id', challengeId);

        counts[challengeId] = countError ? 0 : count || 0;
      }
      setWatchedCounts(counts);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Text style={styles.text}>Cargando...</Text>;
  if (!challenges.length) return <Text style={styles.text}>No tienes retos asignados.</Text>;

  // Retos completados
  const completedChallengesCount = challenges.filter(challenge => {
    const watched = watchedCounts[challenge.id] || 0;
    return watched >= (challenge.number_films || 0);
  }).length;

  // Total películas vistas
  const totalFilmsWatched = Object.values(watchedCounts).reduce((a, b) => a + b, 0);

  // Badges con condiciones reales
  const badges = [
    {
      emoji: '🟥',
      title: 'Newbie Viewer',
      description: 'Watching your first film',
      condition: totalFilmsWatched >= 1,
    },
    {
      emoji: '🟪',
      title: 'Lover of the Seventh Art',
      description: 'Watching +10 films',
      condition: totalFilmsWatched >= 10,
    },
    {
      emoji: '🟧',
      title: 'Aspiring Cinephile',
      description: 'Completing your first challenge',
      condition: completedChallengesCount >= 1,
    },
    {
      emoji: '🟦',
      title: 'Supporting Actor',
      description: 'Completing +5 challenges',
      condition: completedChallengesCount >= 5,
    },
  ];

  const earnedBadges = badges.filter(badge => badge.condition);

  // Semana de progreso para gráfico (dummy, puedes hacer dinámico)
  const weekProgress = [1, 1, 0, 1, 2, 4, 2];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>General Progress</Text>
        <Text style={styles.subtitle}>LEVEL 1</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.centeredText]}>
            You’ve completed {completedChallengesCount} Challenges!
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View
              style={[
                styles.progressBarForeground,
                { width: `${(completedChallengesCount / challenges.length) * 100}%` },
              ]}
            />
          </View>

          {/* Mostrar retos, todos o solo 2 según showAllChallenges */}
          <View style={styles.cardsContainer}>
            {(showAllChallenges ? challenges : challenges.slice(0, 2)).map((challenge) => {
              const watched = watchedCounts[challenge.id] || 0;
              const total = challenge.number_films || 0;
              return (
                <View key={challenge.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{challenge.name}</Text>
                  <Text>
                    Películas vistas: {watched} / {total}
                  </Text>
                </View>
              );
            })}
          </View>
          {challenges.length > 2 && (
            <TouchableOpacity onPress={() => setShowAllChallenges(!showAllChallenges)}>
              <Text style={[styles.seeAllText, styles.leftAlign]}>
                {showAllChallenges ? 'Show less' : 'See all'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.centeredText]}>
            You’ve got {earnedBadges.length} Badges!
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View style={[styles.progressBarForeground, { width: `${(earnedBadges.length / badges.length) * 100}%` }]} />
          </View>

          {/* Mostrar badges, todos o solo 2 según showAllBadges */}
          <View style={styles.badgesContainer}>
            {(showAllBadges ? earnedBadges : earnedBadges.slice(0, 2)).map(({ emoji, title, description }, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{emoji}</Text>
                <View style={styles.badgeTextContainer}>
                  <Text style={styles.badgeText}>{title}</Text>
                  <Text style={styles.badgeDescription}>{description}</Text>
                </View>
              </View>
            ))}
          </View>
          {earnedBadges.length > 2 && (
            <TouchableOpacity onPress={() => setShowAllBadges(!showAllBadges)}>
              <Text style={[styles.seeAllText, styles.leftAlign]}>
                {showAllBadges ? 'Show less' : 'See all'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.separator} />

        <Text style={[styles.sectionTitle, styles.centeredText]}>Your Stats</Text>
        <View style={styles.statContainer}>
          <View style={styles.leftColumn}>
            <Text style={styles.leftText}>Films Watched</Text>
          </View>
          <View style={styles.middleColumn}>
            <View style={styles.barChart}>
              {[80, 60, 40, 20, 0].map((topPos) => (
                <View key={topPos} style={[styles.horizontalLine, { top: topPos }]} />
              ))}
              {weekProgress.map((value, index) => (
                <View key={index} style={[styles.bar, { height: value * 20 }]} />
              ))}
            </View>
            <View style={styles.daysOfWeek}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <Text key={i} style={styles.dayText}>
                  {day}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={styles.numbersColumn}>
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <Text key={num} style={styles.numberText}>
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

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
          <Ionicons name="trophy" size={26} color="#FFDD95" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0C0F14',
  },
  screen: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFDD95',
    fontSize: 18,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  centeredText: {
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#1F1F1F',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1F1F1F',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#FFDD95',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  seeAllText: {
    color: '#FFDD95',
    fontSize: 14,
  },
  leftAlign: {
    textAlign: 'left',
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  badgesContainer: {
    gap: 15,
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeDescription: {
    color: '#AAA',
    fontSize: 13,
  },
  statContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  leftColumn: {
    flex: 2,
    justifyContent: 'center',
  },
  leftText: {
    color: '#AAA',
  },
  middleColumn: {
    flex: 4,
    alignItems: 'center',
  },
  barChart: {
    width: 120,
    height: 80,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  bar: {
    width: 10,
    backgroundColor: '#FFDD95',
    borderRadius: 5,
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    width: 120,
  },
  dayText: {
    color: '#FFDD95',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rightColumn: {
    flex: 1,
  },
  numbersColumn: {
    justifyContent: 'space-between',
    height: 80,
  },
  numberText: {
    color: '#AAA',
    fontSize: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0C0F14',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  text: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});