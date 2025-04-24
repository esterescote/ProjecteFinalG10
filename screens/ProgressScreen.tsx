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

const { width } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation();

  const weekProgress = [1, 1, 0, 1, 2, 4, 2]; // dades per a gràfic de barres

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.title}>General Progress</Text>
        <Text style={styles.subtitle}>LEVEL 1</Text>

        {/* Secció Desafiaments Completats */}
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
              <Text style={styles.cardTitle}>Lord of the Rings & The Hobbit Marathon</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, styles.leftAlign]}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Secció Insígnies */}
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

        {/* Secció Estadístiques */}
        <Text style={[styles.sectionTitle, styles.centeredText]}>Your Stats</Text>
        <View style={styles.statContainer}>
          <View style={styles.leftColumn}>
            <Text style={styles.leftText}>Films Watched</Text>
          </View>
          <View style={styles.middleColumn}>
            <View style={styles.barChart}>
              {/* Línies horitzontals */}
              {[80, 60, 40, 20, 0].map((topPos) => (
                <View
                  key={topPos}
                  style={[styles.horizontalLine, { top: topPos }]}
                />
              ))}

              {/* Barres del gràfic */}
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

      {/* Barra inferior funcional */}
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
    backgroundColor: '#3e3e3e',
  },
  screen: {
    paddingTop: 40,
    paddingHorizontal: 15,
    paddingBottom: 60,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  centeredText: {
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#ccc',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: 'green',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#800020',
    borderRadius: 10,
    padding: 50,
    width: '45%',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  seeAllText: {
    color: 'white',
    marginTop: 10,
  },
  leftAlign: {
    textAlign: 'left',
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 20,
  },
  badgesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  badgeTextContainer: {
    flexDirection: 'column',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  badgeDescription: {
    color: '#ccc',
    fontSize: 12,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginVertical: 20,
  },
  leftColumn: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  leftText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  middleColumn: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    marginBottom: 10,
    position: 'relative',
    width: width * 0.4,
  },
  bar: {
    backgroundColor: 'green',
    width: 30,
    marginHorizontal: 5,
  },
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#bbb',
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    width: 30,
  },
  rightColumn: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numbersColumn: {
    justifyContent: 'space-between',
    height: 100,
  },
  numberText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
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

export default ProgressScreen;
