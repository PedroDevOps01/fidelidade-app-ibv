import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { navigate } from '../../router/navigationRef';
import { useFocusEffect } from '@react-navigation/native';

const UserDataScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: 'Meus dados',
      });
    }, [navigation]),
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleLarge" style={{ marginTop: 10, fontWeight: 'bold', paddingHorizontal: 16 }}>
        Meus Dados
      </Text>
      <View style={styles.innerContainer}>
        <List.Section>
          <List.Item
            title="Dados pessoais"
            description="Atualize seus dados pessoais"
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('user-personal-data-screen')}
          />

          {dadosUsuarioData.pessoaDados?.id_situacao_pda == 1 && (
            <>
              <List.Item
                title="Cartões de crédito"
                description="Atualize seus cartões de crédito"
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('user-personal-credit-cards-screen')}
              />

              <List.Item
                title="Meu Plano"
                description="Confira detalhes sobre seu plano"
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {
                  if (dadosUsuarioData.pessoaAssinatura?.id_contrato_ctt) {
                    navigate('user-contracts-stack');
                    return;
                  }
                  navigate('new-contract-stack');
                }}
              />
            </>
          )}

          {dadosUsuarioData.pessoaDados?.id_pessoa_pes != 0 && (
            <List.Item
              title="Carteirinha"
              description="Visualize sua carteirinha"
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('user-personal-carteirinha-screen')}
            />
          )}
        </List.Section>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  innerContainer: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  buttonContainer: {
    paddingHorizontal: 10,
    paddingBottom: 0,
    height: 'auto',
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    color: 'black',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: 'black',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  hintText: {
    fontSize: 14,
    color: 'grey',
    marginTop: 4,
  },
  input: {
    marginBottom: 20,
  },
  datePickerInput: {
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default UserDataScreen;
