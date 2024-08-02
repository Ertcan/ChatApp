import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const handleSubmit = async (values) => {
    try {
     
      await axios.post('http://10.0.2.2:3000/register', values);
      Alert.alert('Başarı', 'Kayıt başarılı!');
      navigation.navigate('Login'); 
    } catch (error) {
      Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
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

            <Button onPress={handleSubmit} title="Kayıt Ol" />
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
});

export default RegisterScreen;
