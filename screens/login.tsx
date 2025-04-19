import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase'; // Importa el client de supabase

const login = ({ navigation }: any) => {
  // State per als camps del formulari
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Funció per fer login amb Supabase
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message); // Mostra l'error si no es pot autenticar
    } else {
      // Si tot va bé, redirigeix a la pàgina d'inici
      navigation.replace('Home'); // Això redirigeix l'usuari sense poder tornar a login
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicia Sessió</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Correu Electrònic"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contrasenya"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Iniciar Sessió" onPress={handleLogin} />

      <Button 
        title="No tens un compte? Registra't" 
        onPress={() => navigation.replace('Register')} // Pantalla de registre (si la tens)
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default login;
