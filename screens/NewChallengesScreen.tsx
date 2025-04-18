import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const challenges = [
  { id: '1', title: 'Marvel Marathon' },
  { id: '2', title: 'The Oscar Winners Challenge' },
  { id: '3', title: 'Lord of the Rings & The Hobbit Marathon' },
  { id: '4', title: 'The 50 Disney Classics' },
];

const NewChallengesScreen: React.FC = () => {
  const renderItem = ({ item }: { item: { id: string; title: string } }) => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <View style={styles.separator}></View>
        <View style={styles.challengeBox}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Visualize</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges List</Text>
      <Text style={styles.subtitle}>List of existing challenges to get started</Text>
      <FlatList
        data={challenges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  challengeContainer: {
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  challengeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#800000', // Granate color
    borderRadius: 10,
    padding: 10,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 10,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default NewChallengesScreen;
