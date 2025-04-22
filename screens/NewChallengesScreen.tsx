import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

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
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserAndChallenges();
  }, []);

  const loadUserAndChallenges = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return;
    setUserId(user.id);
    fetchChallenges(user.id);
  };

  const fetchChallenges = async (userId: string) => {
    try {
      // Obtener todos los desafíos
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*');
      
      if (challengesError) {
        console.error('Error loading challenges:', challengesError.message);
        return;
      }
      
      // Obtener los desafíos del usuario
      const { data: userChallengesData, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', userId);
        
      if (userChallengesError) {
        console.error('Error loading user challenges:', userChallengesError.message);
        return;
      }
      
      // Crear un conjunto de IDs de desafíos del usuario para búsqueda rápida
      const userChallengeIds = new Set(
        (userChallengesData || []).map(item => item.challenge_id)
      );
      
      // Marcar los desafíos como añadidos o no
      const formattedChallenges = challengesData.map((challenge: any) => ({
        ...challenge,
        added: userChallengeIds.has(challenge.id)
      }));
      
      setChallenges(formattedChallenges);
    } catch (error) {
      console.error('Error in fetchChallenges:', error);
    }
  };

  const handleAddChallenge = async (challengeId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase.from('user_challenges').insert([
        {
          user_id: userId,
          challenge_id: challengeId,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: null,
        },
      ]);

      if (error) {
        console.error('Error adding challenge:', error.message);
        setMessage(`Error: ${error.message}`);
      } else {
        updateChallengeState(challengeId, true);
        setMessage('¡Reto añadido correctamente!');
      }
    } catch (error) {
      console.error('Exception when adding challenge:', error);
      setMessage(`Error inesperado: ${error}`);
    }

    setModalVisible(true);
  };

  const handleRemoveChallenge = async (challengeId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_challenges')
        .delete()
        .match({
          user_id: userId,
          challenge_id: challengeId
        });

      if (error) {
        console.error('Error removing challenge:', error.message);
        setMessage(`Error: ${error.message}`);
      } else {
        updateChallengeState(challengeId, false);
        setMessage('Reto eliminado correctamente.');
      }
    } catch (error) {
      console.error('Exception when removing challenge:', error);
      setMessage(`Error inesperado: ${error}`);
    }

    setModalVisible(true);
  };

  const updateChallengeState = (challengeId: string, added: boolean) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === challengeId ? { ...challenge, added } : challenge
      )
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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
            <Text style={styles.buttonText}>Visualizar</Text>
          </TouchableOpacity>

          {item.added ? (
            <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={() => handleRemoveChallenge(item.id)}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => handleAddChallenge(item.id)}>
              <Text style={styles.buttonText}>Añadir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Retos</Text>
      <Text style={styles.subtitle}>Lista de retos disponibles para comenzar</Text>
      <FlatList
        data={challenges}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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

// Los estilos se mantienen iguales

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
  removeButton: {
    backgroundColor: '#555555',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
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
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuText: {
    color: 'white',
    fontSize: 24,
  },
});

export default NewChallengesScreen;
