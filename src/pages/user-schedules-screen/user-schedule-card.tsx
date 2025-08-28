import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Avatar, useTheme, Icon } from 'react-native-paper';
import Geolocation from '@react-native-community/geolocation';
import { applyPhoneMask, formatDateToDDMMYYYY } from '../../utils/app-utils';
import { api } from '../../network/api';
import { generateRequestHeader } from '../../utils/app-utils';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestPermissions } from '../../utils/permissions';
import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
type Props = {
  index: number;
  appointment: UserSchedule;
  onPress: (index: number) => void;
  setGlobalLoading: (value: boolean) => void;
  showCheckinButton?: boolean; // <-- adicionado aqui
};

const UserScheduleCard = (props: Props) => {
  const { index, appointment, onPress, setGlobalLoading, showCheckinButton = true } = props;
  console.log('Rendering UserScheduleCard for appointment:', appointment);
  const { colors } = useTheme();
  const [checkinRealizado, setCheckinRealizado] = useState(false);
  const { authData } = useAuth();
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Permissão de localização negada ou bloqueada');
        }
      }
    } else {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (status === RESULTS.DENIED || status === RESULTS.BLOCKED) {
        const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        if (result !== RESULTS.GRANTED) {
          throw new Error('Permissão de localização negada ou bloqueada');
        }
      }
    }
  };

  const enderecoCompleto = `${appointment.endereco_unidade} ${appointment.numero_unidade}, ${appointment.bairro_unidade}, ${appointment.cidade_unidade} - ${appointment.estado}`;
  const getLatLngFromAddress = async (address: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (MyApp - contact@example.com)', // obrigatório para Nominatim
        },
      });

      const status = await check(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error('Erro no geocoding:', error);
      return null;
    }
  };
  useEffect(() => {
    const carregarCheckin = async () => {
      const checkin = await AsyncStorage.getItem(`checkin_${appointment.agenda_exames_id}`);
      if (checkin === 'true') {
        setCheckinRealizado(true);
      }
    };
    carregarCheckin();
  }, []);
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const validarCodigoAgendamento = async () => {
    try {
      const body = {
        codigoEticket: appointment.codigoValidadorAgendamento,
      };

      console.log('🔐 access_token sendo usado:', authData.access_token);
      console.log('📤 Corpo enviado:', body);

      const response = await api.post(`/integracao/validarCodigoAgendamento`, body, generateRequestHeader(authData.access_token));

      // LOG da resposta da API
      console.log('🔍 Status:', response.status);
      console.log('📦 Response data:', response.data);

      if (response.status === 200) {
        await AsyncStorage.setItem(`checkin_${appointment.agenda_exames_id}`, 'true');
        setCheckinRealizado(true);
        setTimeout(() => {
          Alert.alert('Sucesso', response.data.text || 'Você entrou na fila de espera.');
        }, 200); // aguarda 200ms para garantir re-render antes do alerta
      } else {
        Alert.alert('Erro', response.data.text || 'Não foi possível confirmar o agendamento.');
      }
    } catch (error) {
      if (error.response) {
        console.log('🚨 Erro status:', error.response.status);
        console.log('🚨 Erro data:', error.response.data);
      } else if (error.request) {
        console.log('⚠️ Erro na requisição, sem resposta do servidor:', error.request);
      } else {
        console.error('❌ Erro desconhecido:', error.message);
      }

      Alert.alert('Erro', 'Falha na validação do código de agendamento.');
    }
  };

  const handleChecking = async () => {
    try {
      await requestLocationPermission();
    } catch (err) {
      if (String(err).includes('bloqueada') || String(err).includes('negada')) {
        Alert.alert('Permissões necessárias', 'Algumas permissões foram negadas ou bloqueadas. Por favor, ative as permissões.', [
          {
            text: 'Tentar novamente',
            onPress: async () => {
              const newStatus = await check(Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
              if (newStatus === RESULTS.DENIED) {
                const result =
                  Platform.OS === 'android'
                    ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                    : await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                if (result === PermissionsAndroid.RESULTS.GRANTED || result === RESULTS.GRANTED) {
                  handleChecking(); // Tenta novamente se a permissão for concedida
                } else {
                  Alert.alert('Permissão negada', 'Por favor, ative as permissões nas configurações.');
                }
              } else if (newStatus === RESULTS.GRANTED) {
                handleChecking(); // Tenta novamente se já estiver concedido
              }
            },
          },
          {
            text: 'Abrir Configurações',
            onPress: async () => {
              const { Linking } = require('react-native');
              await Linking.openSettings(); // Abre as configurações do app
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Permissões necessárias', String(err));
      }
      return;
    }
    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const [ano, mes, dia] = appointment.data.split('-');
    const dataAgendamento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    dataAgendamento.setHours(0, 0, 0, 0);

    if (dataAtual.getTime() !== dataAgendamento.getTime()) {
      Alert.alert('Check-in não permitido', 'Você só pode fazer o check-in na data do agendamento.');
      return;
    }

    setGlobalLoading(true);

    const clinicCoords = await getLatLngFromAddress(enderecoCompleto);
    if (!clinicCoords) {
      setGlobalLoading(false);
      Alert.alert('Erro', 'Não foi possível obter as coordenadas da clínica.');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        const userCoords = position.coords;
        const distance = getDistanceFromLatLonInMeters(userCoords.latitude, userCoords.longitude, clinicCoords.latitude, clinicCoords.longitude);

        console.log(`Distância do usuário até a clínica: ${distance} metros`);

        if (distance <= 600) {
          Alert.alert('Check-in permitido', 'Você está dentro da área permitida.');
          await validarCodigoAgendamento();
        } else {
          Alert.alert('Fora da área', 'Você está longe demais para fazer o check-in.');
        }

        setGlobalLoading(false);
      },
      error => {
Alert.alert('Erro', 'Não foi possível obter sua localização. Por favor, desloque-se para o térreo, caso esteja em um local elevado.');        console.error(error);
        setGlobalLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <Card style={[styles.card]} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerContainer}>
          <Avatar.Image source={{ uri: appointment.fachada_profissional }} size={50} style={[styles.avatar, { backgroundColor: 'transparent' }]} />
          <View style={styles.headerTextContainer}>
            <Text variant="titleMedium" style={[styles.professionalName, { color: colors.onBackground }]}>
              {appointment.nome_profissional}
            </Text>
            <Text variant="bodyMedium" style={[styles.contact, { color: colors.onSurfaceVariant }]}>
              {appointment.contato_paciente ? `Contato: ${applyPhoneMask(appointment.contato_paciente)}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <Icon source="calendar" size={20} color={colors.primary} />
            <Text variant="bodyLarge" style={[styles.section, { color: colors.onBackground }]}>
              {formatDateToDDMMYYYY(appointment.data)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon source="stethoscope" size={20} color={colors.primary} />
            <Text variant="bodyLarge" style={[styles.section, { color: colors.onBackground }]}>
              {appointment.nome_procedimento.join(', ')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <TouchableOpacity style={[styles.buttonContainer, { backgroundColor: colors.primary, flex: 1, marginRight: 8 }]} onPress={() => onPress(index)} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Ver mais</Text>
          </TouchableOpacity>

          {showCheckinButton && (
            <TouchableOpacity
              style={[styles.buttonContainer, { backgroundColor: checkinRealizado ? '#4CAF50' : colors.primary, flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => {
                if (checkinRealizado) {
                  Alert.alert('Já na Sala de Espera', 'Você já realizou o check-in e está na sala de espera.');
                } else {
                  handleChecking();
                }
              }}>
              <Text style={styles.buttonText}>{checkinRealizado ? 'Sala de Espera' : 'Check-in'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContent: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  professionalName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  contact: {
    fontSize: 14,
    marginTop: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  section: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserScheduleCard;
