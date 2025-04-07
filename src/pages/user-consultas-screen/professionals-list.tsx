import {FlatList, StyleSheet, Text, View} from 'react-native';
import {Avatar, Card, Paragraph, Title, useTheme} from 'react-native-paper';
import {MD3Colors} from 'react-native-paper/lib/typescript/types';
import LoadingFull from '../../components/loading-full';
import React from 'react';

interface ProfissionalCardProps {
  profissional: ProfessionallMedico;
  navigation: any;
  colors: MD3Colors;
}

function ProfissionalCard({profissional, navigation, colors}: ProfissionalCardProps) {
  return (
    <Card style={[styles.card, {backgroundColor: colors.surface}]} onPress={() => { 
      navigation.navigate('user-procedures-by-medico', {
        professional: profissional
      }
    )
  }}>
      <Card.Title
        title={profissional.nome_profissional}
        subtitle={
          profissional.conselho_profissional
            ? `CRM: ${profissional.conselho_profissional}`
            : 'CRM não informado'
        }
        left={() => <Avatar.Image size={50} source={{uri: profissional.fachada_profissional}} style={styles.avatar} />}
      />
    </Card>
  );
}

export default function ProfissionalList({
  navigation,
  data,
  loading,
}: {
  navigation: any;
  data: ConsultasAgrupadas | ProfessionallMedico[];
  loading: boolean;
}) {
  const {colors} = useTheme();

  return (
    <>
      {loading ? (
        <LoadingFull title="Carregando profissionais..." />
      ) : (
        <FlatList
          data={data as ProfessionallMedico[]}
          renderItem={({item}) => <ProfissionalCard profissional={item} navigation={navigation} colors={colors} />}
          style={{backgroundColor: colors.background}}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 0,
    borderRadius: 0,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  link: {
    color: '#007bff',
    fontWeight: 'bold',
    marginVertical: 8,
  },
});
