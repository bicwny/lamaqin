
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function UserCheck() {
  const { user } = useAuth();
  const [userInDb, setUserInDb] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const checkUserInDatabase = async () => {
    if (!user) {
      setError('No authenticated user');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Checking user in database:', user.email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ User not found in database');
          setUserInDb(null);
          setError('User not found in database');
        } else {
          console.error('❌ Database error:', error);
          setError(`Database error: ${error.message}`);
        }
      } else {
        console.log('✅ User found in database:', data);
        setUserInDb(data);
        setError('');
      }
    } catch (err: any) {
      console.error('❌ Check failed:', err);
      setError(`Check failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createUserInDatabase = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      console.log('➕ Creating user in database:', user.email);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          dharma_name: user.dharma_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Create user error:', error);
        setError(`Create error: ${error.message}`);
      } else {
        console.log('✅ User created in database:', data);
        setUserInDb(data);
        setError('');
      }
    } catch (err: any) {
      console.error('❌ Create failed:', err);
      setError(`Create failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkUserInDatabase();
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No authenticated user</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Database Check</Text>
      <Text style={styles.text}>Auth User: {user.email}</Text>
      <Text style={styles.text}>User ID: {user.id}</Text>
      
      {loading && <Text style={styles.loading}>Loading...</Text>}
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {userInDb && (
        <View style={styles.userInfo}>
          <Text style={styles.success}>✅ User found in database:</Text>
          <Text style={styles.text}>Email: {userInDb.email}</Text>
          <Text style={styles.text}>Dharma Name: {userInDb.dharma_name || 'None'}</Text>
          <Text style={styles.text}>Created: {userInDb.created_at}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.button} onPress={checkUserInDatabase}>
        <Text style={styles.buttonText}>Check User</Text>
      </TouchableOpacity>
      
      {!userInDb && (
        <TouchableOpacity style={styles.button} onPress={createUserInDatabase}>
          <Text style={styles.buttonText}>Create User in DB</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  loading: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
  success: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  userInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
