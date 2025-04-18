import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';

const { width, height } = Dimensions.get('window');

const MyChallengesScreen = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [challenges] = useState([
    { id: '1', title: 'Harry Potter Marathon', progress: 0.5 },
    { id: '2', title: 'Marvel Cinematic Universe', progress: 0.3 },
    { id: '3', title: 'Disney Classics', progress: 0.8 },
  ]);

  const completedChallenges = [
    { title: 'Marvel Marathon', xp: 15 },
    { title: 'The Oscar Winners Challenge', xp: 5 },
    { title: 'Lord of the Rings & The Hobbit Marathon', xp: 8 },
  ];

  const categories = ['All', 'Action', 'Adventure', 'Animation', 'Horror'];
  const recommendedChallenges = [
    'Monthly Challenge',
    'Inside Out marathoon',
    '15 days non-stop.',
    'Non-Stop in 24 Hours',
    'Cine-Bingo',
    'Beep Challenge',
  ];

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>My Challenges</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'current' && styles.activeToggleButton]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'current' && styles.activeToggleButtonText]}>Current Challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, activeTab === 'completed' && styles.activeToggleButton]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.toggleButtonText, activeTab === 'completed' && styles.activeToggleButtonText]}>Completed Challenges</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        <ScrollView contentContainerStyle={styles.currentScrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.swiperContainerSmall}>
            <Swiper
              cards={challenges}
              renderCard={(card) => (
                <View style={styles.cardSmall}>
                  <View style={styles.imagePlaceholder} />
                  <View style={styles.cardContentSmall}>
                    <Text style={styles.cardLabel}>Challenge</Text>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardProgressLabel}>Completed:</Text>
                    <View style={styles.progressBar}><View style={[styles.progress, { width: `${card.progress * 100}%` }]} /></View>
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
      ) : (
        <ScrollView contentContainerStyle={styles.completedContainer} showsVerticalScrollIndicator={false}>
          {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ justifyContent: 'center', flexDirection: 'row', width: '100%' }}
            style={{ marginBottom: 10 }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: width }}>
                    {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        style={[styles.categoryButton, selectedCategory === category && styles.activeCategoryButton]}
                    >
                        <Text style={[styles.categoryText, selectedCategory === category && styles.activeCategoryText]}>
                        {category}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>


          {/* Completed Challenges */}
          <Text style={styles.sectionTitle}>Your Completed Challenges</Text>
          <View style={styles.separator} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} 
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            width: '100%',
          }}>
            {completedChallenges.map((item, index) => (
              <View key={index} style={styles.completedCardSmall}>
                <Text style={styles.completedCardText}>{item.title}</Text>
                <View style={styles.xpTag}><Text style={styles.xpText}>{item.xp} XP 🍿</Text></View>
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
              <View key={index} style={styles.recommendCard}><Text style={styles.recommendText}>{title}</Text></View>
            ))}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.footerButton}><Text style={styles.footerButtonText}>➕ Choose a challenge</Text></TouchableOpacity>
            <TouchableOpacity style={styles.footerButton}><Text style={styles.footerButtonText}>➕ Create new challenge</Text></TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1e1e1e',
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
  cardProgressLabel: { color: '#ccc', fontSize: 14, marginTop: 10 },
  progressBar: {
    width: '100%', height: 8, backgroundColor: '#444', borderRadius: 5, overflow: 'hidden', marginTop: 5,
  },
  progress: { height: 8, backgroundColor: 'green' },
  
  completedContainer: {
    paddingBottom: 60,
    paddingTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 5,
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 10,
  },
  completedCardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingLeft: 10,
  },
  completedCardSmall: {
    backgroundColor: '#800020',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: width * 0.35,
    height: height * 0.15,
  },
  completedCardText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  xpTag: {
    marginTop: 5,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  xpText: {
    color: 'white',
    fontSize: 12,
  },
  keepGoing: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
  },
  recommendCard: {
    backgroundColor: '#5e0b0b',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    width: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footerButtons: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButton: {
    paddingVertical: 10,  
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  footerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#000',
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  activeCategoryText: {
    color: '#fff',
  },
});

export default MyChallengesScreen;
