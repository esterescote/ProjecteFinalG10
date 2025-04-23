import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Imagen por defecto de perfil (anónimo)
const defaultAvatar = 'https://i.imgur.com/4YQF2kR.png'; // Esta es una imagen de ejemplo

const ProfileScreen = () => {
  // Datos simulados para el perfil del usuario
  const userData = {
    username: 'John Doe',
    xp: 1500,
    avatar: null, // Cambia esta línea a una URL si tienes una imagen de avatar
    headerImage: 'https://i.imgur.com/2yHBo8a.jpg', // Imagen de cabecera
    favouriteFilms: [
      { title: 'Inception', image: 'https://image.tmdb.org/t/p/w500/6V1bK1pEAT2k0i3GTLhxvDZjzQS.jpg' },
      { title: 'The Matrix', image: 'https://image.tmdb.org/t/p/w500/4Y1cHLZ3vbs4lG5Xfsk9E3tMQQR.jpg' },
    ],
    currentChallenge: [
      { title: 'Challenge 1', image: 'https://cdn.hobbyconsolas.com/sites/navi.axelspringer.es/public/media/image/2016/09/pulp-fiction.jpg?tf=3840x' },
      { title: 'Challenge 2', image: 'https://www.eyeforfilm.co.uk/images/newsite/the-shawshank-redemption_600.webp' },
    ],
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Imagen de encabezado */}
        <Image source={{ uri: userData.headerImage }} style={styles.headerImage} />
        
        {/* Imagen de perfil */}
        <Image
          source={{ uri: userData.avatar || defaultAvatar }} // Si no hay avatar, se usa la imagen por defecto
          style={styles.avatar}
        />

        {/* Nombre de usuario */}
        <Text style={styles.username}>{userData.username}</Text>
        
        {/* XP del usuario */}
        <Text style={styles.xp}>XP: {userData.xp}</Text>

        {/* Películas favoritas */}
        <Text style={styles.sectionTitle}>Favourite Films</Text>
        <View style={styles.filmList}>
          {userData.favouriteFilms.map((film, index) => (
            <View key={index} style={styles.filmCard}>
              <Image source={{ uri: film.image }} style={styles.filmImage} />
              <Text style={styles.filmTitle}>{film.title}</Text>
            </View>
          ))}
        </View>

        {/* Desafíos actuales */}
        <Text style={styles.sectionTitle}>Current Challenge</Text>
        <View style={styles.challengeList}>
          {userData.currentChallenge.map((challenge, index) => (
            <View key={index} style={styles.challengeCard}>
              <Image source={{ uri: challenge.image }} style={styles.challengeImage} />
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Menú inferior FIX */}
      <View style={styles.bottomNav}>
        <View style={styles.navIcon}>
          <Ionicons name="home" size={26} color="white" />
        </View>
        <View style={styles.navIcon}>
          <Ionicons name="calendar" size={26} color="white" />
        </View>
        <View style={styles.navIcon}>
          <Ionicons name="add-circle" size={30} color="white" />
        </View>
        <View style={styles.navIcon}>
          <Ionicons name="trophy" size={26} color="white" />
        </View>
        <View style={styles.navIcon}>
          <Ionicons name="person" size={26} color="white" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Para evitar que el contenido quede debajo del menú inferior
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -60, // Para centrar la imagen
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 90,
  },
  xp: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  filmList: {
    flexDirection: 'row',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  filmCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  filmImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  filmTitle: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  challengeList: {
    flexDirection: 'row',
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  challengeCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  challengeImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  challengeTitle: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2b2323',
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  navIcon: {
    alignItems: 'center',
  },
});

export default ProfileScreen;
