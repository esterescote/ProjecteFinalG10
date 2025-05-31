import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

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
      
      // CANVI PRINCIPAL: Utilitzar supabase.auth.user() en lloc de getUser()
      const user = supabase.auth.user();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        // Opcional: navegar al login si no hi ha usuari
        // navigation.replace('Login');
        return;
      }
      setUser(user);

      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id);

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

      // Updated to include the image field
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id, name, number_films, image')
        .in('id', challengeIds);

      if (challengeError) {
        console.error('Error to obtain challenges:', challengeError);
        setLoading(false);
        return;
      }

      setChallenges(challengeData || []);

      const counts: Record<string, number> = {};
      for (const challengeId of challengeIds) {
        const { count, error: countError } = await supabase
          .from('watched_movies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId);

        counts[challengeId] = countError ? 0 : count || 0;
      }
      setWatchedCounts(counts);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Text style={styles.text}>Loading...</Text>;
  if (!challenges.length) return <Text style={styles.text}>You do not have any assigned challenge.</Text>;

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

  // Semana de progreso para gráfico
  const weekProgress = [1, 1, 0, 1, 2, 4, 2];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>General Progress</Text>
            <Text style={styles.subtitle}>LEVEL 1</Text>
          </View>

          {/* Challenges Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              You've completed {completedChallengesCount} Challenges!
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarForeground,
                  { width: `${Math.min((completedChallengesCount / challenges.length) * 100, 100)}%` },
                ]}
              />
            </View>

            <View style={showAllChallenges ? styles.cardsContainerGrid : styles.cardsContainer}>
              {(showAllChallenges ? challenges : challenges.slice(0, 2)).map((challenge) => {
                const watched = watchedCounts[challenge.id] || 0;
                const total = challenge.number_films || 0;
                return (
                  <View key={challenge.id} style={showAllChallenges ? styles.challengeCardGrid : styles.challengeCard}>
                    {challenge.image ? (
                      <Image 
                        source={{ uri: challenge.image }} 
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cardImagePlaceholder} />
                    )}
                    <Text style={styles.cardTitle}>{challenge.name}</Text>
                  </View>
                );
              })}
            </View>
            
            {challenges.length > 2 && (
              <TouchableOpacity onPress={() => setShowAllChallenges(!showAllChallenges)}>
                <Text style={styles.seeAllText}>
                  {showAllChallenges ? 'Show less' : 'See all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Badges Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              You've got {earnedBadges.length} Badges!
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarForeground, 
                  { width: `${Math.min((earnedBadges.length / badges.length) * 100, 100)}%` }
                ]} 
              />
            </View>

            <View style={styles.badgesContainer}>
              {(showAllBadges ? earnedBadges : earnedBadges.slice(0, 4)).map(({ emoji, title, description }, index) => (
                <View key={index} style={styles.badge}>
                  <View>
                    <Text style={styles.badgeEmoji}>{emoji}</Text>
                  </View>
                  <View style={styles.badgeTextContainer}>
                    <Text style={styles.badgeTitle}>{title}</Text>
                    <Text style={styles.badgeDescription}>{description}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            {earnedBadges.length > 4 && (
              <TouchableOpacity onPress={() => setShowAllBadges(!showAllBadges)}>
                <Text style={styles.seeAllText}>
                  {showAllBadges ? 'Show less' : 'See all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statsLeftColumn}>
                <Text style={styles.statsLabel}>Films{'\n'}watched</Text>
              </View>
              <View style={styles.statsChartContainer}>
                <View style={styles.chartArea}>
                  <View style={styles.chartGrid}>
                    {[0, 1, 2, 3, 4].map((line) => (
                      <View key={line} style={styles.gridLine} />
                    ))}
                  </View>
                  <View style={styles.barsContainer}>
                    {weekProgress.map((value, index) => (
                      <View key={index} style={styles.barWrapper}>
                        <View 
                          style={[
                            styles.bar, 
                            { 
                              height: Math.max(value * 15, 8),
                              backgroundColor: value > 0 ? '#4ADE80' : '#374151'
                            }
                          ]} 
                        />
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.daysRow}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <Text key={i} style={styles.dayLabel}>{day}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.statsRightColumn}>
                <View style={styles.numbersColumn}>
                  {[4, 3, 2, 1, 0].map((num) => (
                    <Text key={num} style={styles.numberLabel}>{num}</Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

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
    backgroundColor: '#3a2f2f',
  },
  container: {
    flex: 1,
  },
  screen: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#FFDD95',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 10,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 15,
  },
  cardsContainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 15,
  },
  challengeCard: {
    flex: 1,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  challengeCardGrid: {
    width: (width - 55) / 2, // Account for padding and gap
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
    marginBottom: 15,
  },
  cardImage: {
    height: 120,
    width: '100%',
    marginBottom: 12,
  },
  cardImagePlaceholder: {
    height: 120,
    backgroundColor: '#800020',
    marginBottom: 12,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  seeAllText: {
    color: '#FFDD95',
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#404040',
    marginVertical: 10,
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
  badgeTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  badgeDescription: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statsLeftColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statsLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 18,
  },
  statsChartContainer: {
    flex: 3,
    alignItems: 'center',
  },
  chartArea: {
    width: 160,
    height: 100,
    position: 'relative',
    marginBottom: 8,
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#374151',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 160,
    paddingHorizontal: 8,
  },
  dayLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  numbersColumn: {
    height: 100,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  numberLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  text: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});