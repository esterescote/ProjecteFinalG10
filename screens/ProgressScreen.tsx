import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<ParamListBase>;

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const weekProgress = [1, 1, 0, 1, 2, 4, 2];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>General Progress</Text>
        <Text style={styles.subtitle}>LEVEL 1</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.centeredText]}>
            You’ve completed 5 Challenges!
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View style={[styles.progressBarForeground, { width: '15%' }]} />
          </View>
          <View style={styles.cardsContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Marvel Marathon</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Lord of the Rings & The Hobbit Marathon
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, styles.leftAlign]}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.centeredText]}>
            You’ve got 4 Badges!
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground} />
            <View style={[styles.progressBarForeground, { width: '35%' }]} />
          </View>
          <View style={styles.badgesContainer}>
            {[
              {
                emoji: '🟥',
                title: 'Newbie Viewer',
                description: 'Watching your first film',
              },
              {
                emoji: '🟪',
                title: 'Lover of the Seventh Art',
                description: 'Watching +10 films',
              },
              {
                emoji: '🟧',
                title: 'Aspiring Cinephile',
                description: 'Completing your first challenge',
              },
              {
                emoji: '🟦',
                title: 'Supporting Actor',
                description: 'Completing +5 challenges',
              },
            ].map(({ emoji, title, description }, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeEmoji}>{emoji}</Text>
                <View style={styles.badgeTextContainer}>
                  <Text style={styles.badgeText}>{title}</Text>
                  <Text style={styles.badgeDescription}>{description}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, styles.leftAlign]}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <Text style={[styles.sectionTitle, styles.centeredText]}>
          Your Stats
        </Text>
        <View style={styles.statContainer}>
          <View style={styles.leftColumn}>
            <Text style={styles.leftText}>Films Watched</Text>
          </View>
          <View style={styles.middleColumn}>
            <View style={styles.barChart}>
              {[80, 60, 40, 20, 0].map((topPos) => (
                <View
                  key={topPos}
                  style={[styles.horizontalLine, { top: topPos }]}
                />
              ))}
              {weekProgress.map((value, index) => (
                <View
                  key={index}
                  style={[styles.bar, { height: value * 20 }]}
                />
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
};

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
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    width: 50,
    justifyContent: 'center',
  },
  leftText: {
    color: 'white',
    fontSize: 12,
    transform: [{ rotate: '-90deg' }],
  },
  middleColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barChart: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#444',
  },
  bar: {
    width: 12,
    backgroundColor: '#FFDD95',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  dayText: {
    color: '#AAA',
    fontSize: 12,
    width: 12,
    textAlign: 'center',
  },
  rightColumn: {
    width: 30,
    justifyContent: 'space-between',
  },
  numbersColumn: {
    alignItems: 'flex-start',
  },
  numberText: {
    color: '#AAA',
    fontSize: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});

export default ProgressScreen;
