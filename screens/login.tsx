import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

const Login = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    try {
      // Sintaxi per Supabase v1.x
      const { user, error } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // user existeix implícitament si no hi ha error
        navigation.replace('Home');
      }
    } catch (err) {
      setError('Connection error. Check your Supabase configuration.');
      console.error('Login error:', err);
    }
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Sintaxi per Supabase v1.x
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // Guardar username al perfil de l'usuari
        if (user) {
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              username,
            });
          } catch (profileError) {
            console.warn('Error saving profile:', profileError);
          }
        }
        
        navigation.replace('Home');
      }
    } catch (err) {
      setError('Registration error. Check your Supabase configuration.');
      console.error('Register error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegistering ? "Not registered yet?" : "Are you already registered?"}
      </Text>
      <Text style={styles.subtitle}>
        {isRegistering
          ? "Click and start enjoying!"
          : "Log in and continue enjoying your film challenges"}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isRegistering && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Repeat Password"
            placeholderTextColor="#ccc"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#ccc"
            value={username}
            onChangeText={setUsername}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
        <Text style={styles.buttonText}>{isRegistering ? 'REGISTER' : 'LOG IN'}</Text>
      </TouchableOpacity>

      {!isRegistering && (
        <Text style={styles.link}>Forgotten password?</Text>
      )}

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.link}>
          {isRegistering
            ? 'Already have an account? Log in'
            : "Not registered yet? Click and start enjoying!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a2f2f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0e6e6',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
    borderWidth: 1.2,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#f0e6e6',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Login;