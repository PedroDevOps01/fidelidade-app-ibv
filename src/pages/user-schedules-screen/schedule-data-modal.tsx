import { Button, Divider, Modal, Text, IconButton } from 'react-native-paper';
import { formatDateToDDMMYYYY } from '../../utils/app-utils';
import { StyleSheet, View, Linking, ScrollView, Image } from 'react-native';
import { useState } from 'react';

export default function ScheduleDataModal({ appointment, visible, close }: { appointment: UserSchedule; visible: boolean; close: () => void }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleNavigation = () => {
    const address = `${appointment.endereco_unidade}, ${appointment.numero_unidade}, ${appointment.bairro_unidade}, ${appointment.cidade_unidade}`;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  return (
    <Modal contentContainerStyle={styles.container} visible={visible} onDismiss={close}>
      <ScrollView style={styles.scrollView}>
        {/* Cabeçalho com logo e nome da unidade */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: appointment.fachada_unidade || 'https://clinicas.gees.com.br/lsantos/clinicas/img/gees1.png' }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text variant="titleLarge" style={styles.clinicName}>
            {appointment.nome_unidade}
          </Text>
          <Text variant="bodyMedium" style={styles.clinicAddress}>
            {appointment.bairro_unidade}, {appointment.cidade_unidade}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Informações do Paciente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader} onTouchEnd={() => toggleSection('patient')}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Informações do Paciente
            </Text>
            <IconButton 
              icon={expandedSection === 'patient' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
            />
          </View>
          
          {expandedSection === 'patient' && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <IconButton icon="account" size={20} />
                <Text variant="bodyMedium">{appointment.nome_paciente}</Text>
              </View>
              
              {appointment.contato_paciente && (
                <View style={styles.infoRow}>
                  <IconButton icon="phone" size={20} onPress={() => handleCall(appointment.contato_paciente)} />
                  <Text variant="bodyMedium">{appointment.contato_paciente}</Text>
                </View>
              )}
              
              {appointment.contato_wpp_paciente && (
                <View style={styles.infoRow}>
                  <IconButton 
                    icon="whatsapp" 
                    size={20} 
                    iconColor="#25D366" 
                    onPress={() => handleWhatsApp(appointment.contato_wpp_paciente)} 
                  />
                  <Text variant="bodyMedium">{appointment.contato_wpp_paciente}</Text>
                </View>
              )}
              
              {appointment.email_paciente && (
                <View style={styles.infoRow}>
                  <IconButton 
                    icon="email" 
                    size={20} 
                    onPress={() => handleEmail(appointment.email_paciente)} 
                  />
                  <Text variant="bodyMedium">{appointment.email_paciente}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Detalhes do Agendamento */}
        <View style={styles.section}>
          <View style={styles.sectionHeader} onTouchEnd={() => toggleSection('appointment')}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Detalhes do Agendamento
            </Text>
            <IconButton 
              icon={expandedSection === 'appointment' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
            />
          </View>
          
          {expandedSection === 'appointment' && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <IconButton icon="calendar" size={20} />
                <View>
                  <Text variant="bodyMedium">Data: {formatDateToDDMMYYYY(appointment.data)}</Text>
                  <Text variant="bodyMedium">Horário: {String(appointment.inicio).substring(0, 5)}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <IconButton icon="medical-bag" size={20} />
                <Text variant="bodyMedium">
                  Procedimento: {appointment.nome_procedimento?.join(', ')}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <IconButton icon="identifier" size={20} />
                <Text variant="bodyMedium">
                  Código de validação: {appointment.codigoValidadorAgendamento}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Profissional */}
        <View style={styles.section}>
          <View style={styles.sectionHeader} onTouchEnd={() => toggleSection('professional')}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Profissional
            </Text>
            <IconButton 
              icon={expandedSection === 'professional' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
            />
          </View>
          
          {expandedSection === 'professional' && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <Image 
                  source={{ uri: appointment.fachada_profissional || 'https://clinicas.gees.com.br/lsantos/clinicas/img/gees1.png' }} 
                  style={styles.professionalImage}
                  resizeMode="cover"
                />
                <View style={styles.professionalInfo}>
                  <Text variant="bodyLarge" style={styles.professionalName}>
                    {appointment.nome_profissional}
                  </Text>
                  <Text variant="bodyMedium">
                    Registro: {appointment.conselho_profissional}/{appointment.conselhonome}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Localização */}
        <View style={styles.section}>
          <View style={styles.sectionHeader} onTouchEnd={() => toggleSection('location')}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Localização
            </Text>
            <IconButton 
              icon={expandedSection === 'location' ? 'chevron-up' : 'chevron-down'} 
              size={20} 
            />
          </View>
          
          {expandedSection === 'location' && (
            <View style={styles.sectionContent}>
              <View style={styles.infoRow}>
                <IconButton 
                  icon="map-marker" 
                  size={20} 
                  iconColor="#FF0000" 
                  onPress={handleNavigation}
                />
                <View>
                  <Text variant="bodyMedium">{appointment.endereco_unidade}, {appointment.numero_unidade}</Text>
                  <Text variant="bodyMedium">{appointment.bairro_unidade}, {appointment.cidade_unidade} - {appointment.estado}</Text>
                </View>
              </View>
              
              <Button 
                mode="outlined" 
                icon="map" 
                onPress={handleNavigation}
                style={styles.mapButton}
              >
                Ver no mapa
              </Button>
            </View>
          )}
        </View>

        {/* Botões de ação */}
        <View style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={close}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Fechar
          </Button>
          
          {appointment.contato_wpp_paciente && (
            <Button 
              mode="contained" 
              icon="whatsapp" 
              buttonColor="#25D366"
              onPress={() => handleWhatsApp(appointment.contato_wpp_paciente)}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              WhatsApp
            </Button>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    height: '85%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  logo: {
    width: 70,
    height: 70,
  },
  clinicName: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  clinicAddress: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: '#e0e0e0',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#34495e',
  },
  sectionContent: {
    paddingBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  professionalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  mapButton: {
    marginTop: 8,
    borderColor: '#3498db',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});