import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  NewChallenges: undefined;
  MyChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
};

type MyChallengesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MyChallenges'>;
};

const MyChallengesScreen: React.FC<MyChallengesScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userChallenges, setUserChallenges] = useState<
    { id: string; name: string; status: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Exemple de reptes completats (fixos)
  const completedChallenges = [
    { title: 'Marvel Marathon', xp: 15 },
    { title: 'The Oscar Winners Challenge', xp: 5 },
    { title: 'Lord of the Rings & The Hobbit Marathon', xp: 8 },
  ];

  const categories = ['All', 'Action', 'Adventure', 'Animation', 'Horror'];

  const recommendedChallenges = [
    'Monthly Challenge',
    'Inside Out marathon',
    '15 days non-stop.',
    'Non-Stop in 24 Hours',
    'Cine-Bingo',
    'Beep Challenge',
  ];

useEffect(() => {
  const fetchUserChallenges = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Error getting user:', userError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .select('id, name, status')
      .eq('user_id', user.id); // 🔑 Filtra pels reptes de l’usuari actual

    if (error) {
      console.log('Error fetching challenges:', error);
    } else {
      setUserChallenges(data || []);
    }

    setLoading(false);
  };

  fetchUserChallenges();
}, []);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>My Challenges</Text>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'current' && styles.activeToggleButton]}
            onPress={() => setActiveTab('current')}
          >
            <Text
              style={[styles.toggleButtonText, activeTab === 'current' && styles.activeToggleButtonText]}
            >
              Current Challenges
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'completed' && styles.activeToggleButton]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[styles.toggleButtonText, activeTab === 'completed' && styles.activeToggleButtonText]}
            >
              Completed Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'current' ? (
          loading ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
              Loading challenges...
            </Text>
          ) : userChallenges.length === 0 ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
              No current challenges found.
            </Text>
          ) : (
            <ScrollView
              contentContainerStyle={styles.currentScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.swiperContainerSmall}>
                <Swiper
                  cards={userChallenges}
                  renderCard={(card) => (
                    <View style={styles.cardSmall} key={card.id}>
                      <View style={styles.imagePlaceholder} />
                      <View style={styles.cardContentSmall}>
                        <Text style={styles.cardLabel}>Challenge</Text>
                        <Text style={styles.cardTitle}>{card.name}</Text>
                        <Text style={styles.cardProgressLabel}>Completed:</Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progress,
                              { width: `${Math.min(card.status * 100, 100)}%` },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                  backgroundColor="transparent"
                  cardIndex={0}
                  stackSize={2}
                  stackSeparation={10}
                  disableTopSwipe
                  disableBottomSwipe
                  infinite
                />
              </View>
            </ScrollView>
          )
        ) : (
          <ScrollView
            contentContainerStyle={styles.completedContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent: 'center',
                flexDirection: 'row',
                width: '100%',
              }}
              style={{ marginBottom: 10 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center', width: width }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.activeCategoryButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category && styles.activeCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Completed Challenges */}
            <Text style={styles.sectionTitle}>Your Completed Challenges</Text>
            <View style={styles.separator} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
              }}
            >
              {completedChallenges.map((item, index) => (
                <View key={index} style={styles.completedCardSmall}>
                  <Text style={styles.completedCardText}>{item.title}</Text>
                  <View style={styles.xpTag}>
                    <Text style={styles.xpText}>{item.xp} XP 🍿</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Keep going text */}
            <Text style={styles.keepGoing}>Keep going and complete more challenges!</Text>

            {/* Recommended For You */}
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <View style={styles.separator} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.completedCardsContainer}
            >
              {recommendedChallenges.map((title, index) => (
                <View key={index} style={styles.recommendCard}>
                  <Text style={styles.recommendText}>{title}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.footerButton}>
                <Text style={styles.footerButtonText}>➕ Choose a challenge</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton}>
                <Text style={styles.footerButtonText}>➕ Create new challenge</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Navigation */}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  screen: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeToggleButton: {
    backgroundColor: '#fff',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeToggleButtonText: {
    color: '#1e1e1e',
  },
  currentScrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  swiperContainerSmall: {
    height: height * 0.5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSmall: {
    width: width * 0.5,
    height: height * 0.4,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imagePlaceholder: {
    height: '40%',
    backgroundColor: '#800020',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContentSmall: {
    padding: 15,
    alignItems: 'center',
  },
  cardLabel: { color: '#ccc', fontSize: 14 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
cardProgressLabel: {
color: '#ccc',
fontSize: 14,
marginTop: 10,
alignSelf: 'flex-start',
},
progressBar: {
height: 10,
backgroundColor: '#444',
borderRadius: 20,
width: '100%',
marginTop: 5,
},
progress: {
height: '100%',
backgroundColor: '#FFDD95',
borderRadius: 20,
},
completedContainer: {
paddingHorizontal: 15,
paddingBottom: 30,
},
categoryButton: {
paddingVertical: 8,
paddingHorizontal: 15,
marginHorizontal: 5,
borderRadius: 20,
backgroundColor: 'rgba(255, 255, 255, 0.2)',
},
activeCategoryButton: {
backgroundColor: '#FFDD95',
},
categoryText: {
color: 'white',
fontWeight: '600',
},
activeCategoryText: {
color: '#1e1e1e',
},
sectionTitle: {
color: 'white',
fontSize: 18,
fontWeight: 'bold',
marginTop: 10,
},
separator: {
borderBottomColor: '#FFDD95',
borderBottomWidth: 1,
marginVertical: 5,
},
horizontalScroll: {
marginTop: 10,
},
completedCardSmall: {
width: 180,
height: 80,
backgroundColor: '#2a2a2a',
borderRadius: 10,
marginRight: 10,
padding: 10,
justifyContent: 'center',
},
completedCardText: {
color: 'white',
fontWeight: 'bold',
fontSize: 16,
},
xpTag: {
marginTop: 5,
backgroundColor: '#FFDD95',
paddingVertical: 3,
paddingHorizontal: 7,
borderRadius: 15,
alignSelf: 'flex-start',
},
xpText: {
fontWeight: 'bold',
fontSize: 14,
},
keepGoing: {
color: 'white',
fontSize: 16,
fontWeight: 'bold',
marginVertical: 15,
},
completedCardsContainer: {
justifyContent: 'center',
alignItems: 'center',
flexDirection: 'row',
width: '100%',
},
recommendCard: {
width: 180,
height: 100,
backgroundColor: '#2a2a2a',
borderRadius: 10,
marginRight: 10,
justifyContent: 'center',
alignItems: 'center',
paddingHorizontal: 10,
},
recommendText: {
color: 'white',
fontWeight: 'bold',
fontSize: 16,
textAlign: 'center',
},
footerButtons: {
flexDirection: 'row',
justifyContent: 'space-around',
marginTop: 20,
},
footerButton: {
backgroundColor: '#FFDD95',
borderRadius: 25,
paddingVertical: 10,
paddingHorizontal: 20,
},
footerButtonText: {
color: '#1e1e1e',
fontWeight: 'bold',
fontSize: 14,
},
bottomNav: {
height: 60,
backgroundColor: '#1e1e1e',
flexDirection: 'row',
justifyContent: 'space-around',
alignItems: 'center',
},
});

export default MyChallengesScreen;
