import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { supabase } from '../lib/supabase'; // Ajusta la ruta si cal

type Challenge = {
  id: string;
  name: string;
  description: string;
  image: string;
};

const NewChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, name, description, image');

      if (error) {
        console.error('Error carregant reptes:', error);
      } else {
        setChallenges(data);
      }
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  const renderItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeContainer}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.challengeImage} />
      ) : null}
      <Text style={styles.challengeTitle}>{item.name}</Text>
      <Text style={styles.challengeDescription}>{item.description}</Text>
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', marginTop: 10 }}>Carregant reptes...</Text>
      </View>
    );
  }

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
    marginBottom: 30,
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
  },
  challengeImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#444',
    marginVertical: 10,
  },
  challengeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#800000', // Granate
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
