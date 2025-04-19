import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type Challenge = {
  id: string;
  name: string;
  description: string;
  image: string;
  added: boolean;
};

const NewChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase.from('challenges').select('*');
    if (error) {
      console.error('Error loading challenges:', error.message);
    } else {
      const challengesWithAddedStatus = data.map((challenge: any) => ({
        ...challenge,
        added: false, // Inicialitzem l'estat `added` com a fals per defecte
      }));
      setChallenges(challengesWithAddedStatus);
      loadAddedChallenges(challengesWithAddedStatus); // Carregar els reptes afegits prèviament des de AsyncStorage
    }
  };

  // Carregar l'estat de si un repte ha estat afegit des de AsyncStorage
  const loadAddedChallenges = async (challenges: Challenge[]) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    for (const challenge of challenges) {
      const addedStatus = await AsyncStorage.getItem(`${user.id}_${challenge.id}`);
      if (addedStatus === 'true') {
        setChallenges(prevChallenges =>
          prevChallenges.map(c =>
            c.id === challenge.id ? { ...c, added: true } : c
          )
        );
      }
    }
  };

  const handleAddChallenge = async (challengeId: string) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage('No s\'ha pogut obtenir l\'usuari actual.');
      setModalVisible(true);
      return;
    }

    const { error: insertError } = await supabase.from('user_challenges').insert([
      {
        user_id: user.id,
        challenge_id: challengeId,
        status: 'pending',
        start_date: new Date().toISOString(),
        end_date: null,
      },
    ]);

    if (insertError) {
      setMessage(`Error: ${insertError.message}`);
    } else {
      setMessage('Challenge added correctly!');
      
      // Actualitzar l'estat i guardar-lo en AsyncStorage per aquest usuari
      setChallenges(prevChallenges =>
        prevChallenges.map(challenge =>
          challenge.id === challengeId ? { ...challenge, added: true } : challenge
        )
      );
      
      // Guardar l'estat del repte afegit per aquest usuari específic
      await AsyncStorage.setItem(`${user.id}_${challengeId}`, 'true');
    }

    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Tancar el modal quan es fa clic a "OK"
  };

  const renderItem = ({ item }: { item: Challenge }) => {
    return (
      <View style={styles.challengeContainer}>
        <Text style={styles.challengeTitle}>{item.name}</Text>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.separator}></View>
        <View style={styles.challengeBox}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Visualize</Text>
          </TouchableOpacity>

          {/* Afegim la condició per amagar el botó Add si el repte ja ha estat afegit */}
          {!item.added && (
            <TouchableOpacity style={styles.button} onPress={() => handleAddChallenge(item.id)}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          )}
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

      {/* Modal per mostrar el missatge */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#2e2e2e',
    borderRadius: 10,
    padding: 15,
  },
  challengeTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  challengeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#800000',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },

  // Estils per al modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#800000',
    padding: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default NewChallengesScreen;
