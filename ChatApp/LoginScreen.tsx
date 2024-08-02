import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const handleSubmit = async (values) => {
    try {
      
      const response = await axios.post('http://10.0.2.2:3000/login', values);
      console.log(response.data.userId);
      if (response.data.success) {
        Alert.alert('Başarı', 'Giriş başarılı!');
        
        navigation.navigate('Home', {
          username: values.username,
          isActive: true,
          userID: response.data.userId 
        });
      } else {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre yanlış.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş sırasında bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={Yup.object({
          username: Yup.string().required('Kullanıcı adı gerekli!'),
          password: Yup.string().required('Şifre gerekli!')
        })}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <Text>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {touched.username && errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}

            <Text>Şifre</Text>
            <TextInput
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {touched.password && errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <Button onPress={handleSubmit} title="Giriş Yap" />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
