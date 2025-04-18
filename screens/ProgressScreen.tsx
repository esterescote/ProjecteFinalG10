import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const weekProgress = [1, 1, 0, 1, 2, 4, 2];  // Pel gràfic de barres
  
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>General Progress</Text>
      <Text style={styles.subtitle}>LEVEL 1</Text>

      {/* Secció de Desafiaments Completats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.centeredText]}>You’ve completed 5 Challenges!</Text>
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

      {/* Secció de Insígnies (actualitzat per horitzontal) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.centeredText]}>You’ve got 4 Badges!</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <View style={[styles.progressBarForeground, { width: '35%' }]} />
        </View>
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🟥</Text>
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeText}>Newbie Viewer</Text>
              <Text style={styles.badgeDescription}>Watching your first film</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🟪</Text>
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeText}>Lover of the Seventh Art</Text>
              <Text style={styles.badgeDescription}>Watching +10 films</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🟧</Text>
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeText}>Aspiring Cinephile</Text>
              <Text style={styles.badgeDescription}>Completing your first challenge</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🟦</Text>
            <View style={styles.badgeTextContainer}>
              <Text style={styles.badgeText}>Supporting Actor</Text>
              <Text style={styles.badgeDescription}>Completing +5 challenges</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={[styles.seeAllText, styles.leftAlign]}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.separator} />

      {/* Secció d'Estadístiques */}
      <Text style={[styles.sectionTitle, styles.centeredText]}>Your Stats</Text>
      <View style={styles.statContainer}>
        <View style={styles.leftColumn}>
          <Text style={styles.leftText}>Films Watched</Text>
        </View>
        <View style={styles.middleColumn}>
          <View style={styles.barChart}>
            {/* Línies horitzontals dins del mateix contenidor de barres */}
            <View style={[styles.horizontalLine, { top: 80 }]} />
            <View style={[styles.horizontalLine, { top: 60 }]} />
            <View style={[styles.horizontalLine, { top: 40 }]} />
            <View style={[styles.horizontalLine, { top: 20 }]} />
            <View style={[styles.horizontalLine, { top: 0 }]} />
            
            {/* Barres del gràfic */}
            {weekProgress.map((value, index) => (
              <View key={index} style={[styles.bar, { height: value * 20 }]} />
            ))}
          </View>
          <View style={styles.daysOfWeek}>
            <Text style={styles.dayText}>M</Text>
            <Text style={styles.dayText}>T</Text>
            <Text style={styles.dayText}>W</Text>
            <Text style={styles.dayText}>T</Text>
            <Text style={styles.dayText}>F</Text>
            <Text style={styles.dayText}>S</Text>
            <Text style={styles.dayText}>S</Text>
          </View>
        </View>
        <View style={styles.rightColumn}>
          <View style={styles.numbersColumn}>
            <Text style={styles.numberText}>0</Text>
            <Text style={styles.numberText}>1</Text>
            <Text style={styles.numberText}>2</Text>
            <Text style={styles.numberText}>3</Text>
            <Text style={styles.numberText}>4</Text>
            <Text style={styles.numberText}>5</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#3e3e3e',
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
    textAlign: 'center', // Centrar el text
  },
  progressBarContainer: {
    width: '100%',
    height: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
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
  },
  seeAllText: {
    color: 'white',
    marginTop: 10,
  },
  leftAlign: {
    textAlign: 'left', // Alineat a l'esquerra
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 20,
  },
  badgesContainer: {
    flexDirection: 'column', // Canviat a columna per a vertical
    alignItems: 'flex-start', // Establir l'alineació vertical a l'esquerra
  },
  badge: {
    flexDirection: 'row', // Canviat a horitzontal
    alignItems: 'center', // Alineació horitzontal
    marginBottom: 15, // Separació entre insígnies
  },
  badgeEmoji: {
    fontSize: 30, // Mida més gran per l'emoji
    marginRight: 10, // Separació entre l'emoji i el text
  },
  badgeTextContainer: {
    flexDirection: 'column', // Text principal i descripció en columna
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  badgeDescription: {
    color: '#ccc',
    fontSize: 12,
  },
  dropdownContainer: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    color: 'white',
    width: 'auto',  // Ajustar a l'amplada del text
    alignSelf: 'center', // Centrar el contenidor horitzontalment
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
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
    height: 100,  // Altura del gràfic
    marginBottom: 10,
    position: 'relative',
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
    borderColor: '#bbb',  // Gris clar per a les línies
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  rightColumn: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numbersColumn: {
    justifyContent: 'space-between',
  },
  numberText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProgressScreen;
