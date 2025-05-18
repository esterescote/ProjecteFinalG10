import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router';

// Tipus de navegació
type RootStackParamList = {
  Home: undefined;
  MyChallenges: undefined;
  NewChallenges: undefined;
  Progress: undefined;
  Profile: undefined;
  'challenge-details': { id: string };
};

type Challenge = {
  id: string;
  name: string;
  description: string;
  image: string;
  added: boolean;
};

const NewChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
    const { data: challengeData, error: challengeError } = await supabase.from('challenges').select('*');
    if (challengeError) {
      console.error('Error loading challenges:', challengeError.message);
      return;
    }

    const { data: userChallenges, error: userChallengesError } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', userId);

    if (userChallengesError) {
      console.error('Error loading user challenges:', userChallengesError.message);
      return;
    }

    const addedChallengeIds = userChallenges.map((uc) => uc.challenge_id);

    const mergedChallenges = challengeData.map((challenge: any) => ({
      ...challenge,
      added: addedChallengeIds.includes(challenge.id),
    }));

    setChallenges(mergedChallenges);
  };

  const handleAddChallenge = async (challengeId: string) => {
  if (!userId) return;

  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    setMessage('Challenge not found');
    setModalVisible(true);
    return;
  }

  const { error } = await supabase.from('user_challenges').insert([{
    user_id: userId,
    challenge_id: challengeId,
    name: challenge.name, // 👈 aquí afegeixes el nom
    status: 'pending',
    start_date: new Date().toISOString(),
    end_date: null,
  }]);

  if (error) {
    setMessage(`Error: ${error.message}`);
  } else {
    updateChallengeState(challengeId, true);
    setMessage('Challenge added correctly!');
  }
  setModalVisible(true);
};

  const handleRemoveChallenge = async (challengeId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('user_challenges')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      updateChallengeState(challengeId, false);
      setMessage('Challenge removed.');
    }
    setModalVisible(true);
  };

  const updateChallengeState = (challengeId: string, added: boolean) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, added } : c))
    );
  };

  const renderItem = ({ item }: { item: Challenge }) => (
    <View style={styles.challengeContainer}>
      <Text style={styles.challengeTitle}>{item.name}</Text>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.separator} />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/challenge-details',
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.buttonText}>Visualize</Text>
        </TouchableOpacity>

        {item.added ? (
          <TouchableOpacity
            style={[styles.button, styles.removeButton]}
            onPress={() => handleRemoveChallenge(item.id)}
          >
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAddChallenge(item.id)}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleCloseModal = () => setModalVisible(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Challenges List</Text>
        <Text style={styles.subtitle}>List of existing challenges to get started</Text>

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

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyChallenges')}>
          <Ionicons name="calendar" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('NewChallenges')}>
          <Ionicons name="add-circle" size={30} color="#FFDD95" />
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
  container: {
    flex: 1,
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
  buttonRow: {
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

export default NewChallengesScreen;
