import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper'; // Importa o Button
import { useAuth } from '../../context/AuthContext';
import { useDadosUsuario } from '../../context/pessoa-dados-context';
import { api } from '../../network/api';
import { generateRequestHeader, log } from '../../utils/app-utils';
import { toast } from 'sonner-native';
import { goBack, navigate } from '../../router/navigationRef';
import LoadingFull from '../../components/loading-full';
import UserQueueCard from '../../components/user-queue-card';
import notifee, { AndroidImportance } from '@notifee/react-native';

const UserTelemedQueueScreen = () => {
  const { colors } = useTheme();
  const { authData } = useAuth();
  const { dadosUsuarioData } = useDadosUsuario();
  const [loading, setLoading] = useState(false);
  const [agendaExamesId, setAgendaExamesId] = useState<number>();
  const [hasAlreadyFetched, setHasAlreadyFetched] = useState<boolean>(false);
  const [positionInQueue, setPositionInQueue] = useState<PacienteFila>();
  const [alreadyShownNotification, setAlreadyShownNotification] = useState<boolean>(false);

  async function getIntoQueue() {
    setLoading(true);
    
    const body = {
      token_paciente: dadosUsuarioData.pessoaDados?.cod_token_pes,
      especialidade: 'geral',
    };

    try {
      const response = await api.post(`/integracao/gravarTeleAtendimento`, body, generateRequestHeader(authData.access_token));

      if (response.status == 200) {
        const { data } = response;
        setAgendaExamesId(data.agenda_exames_id);
      } 
      else if (response.status == 401) {
        getIntoQueue()
      } 
      else {
        setLoading(false);
        toast.error('Erro ao acessar a fila. Contate o suporte e tente novamente', { position: 'bottom-center' });
      }
    } catch (err) {
      console.log('err', err);
      toast.error("Telemedicina indisponivel no momento. Tente mais tarde.", {position: 'bottom-center'})
        goBack()
    }
  }

  async function getQueue() {
    console.log('getQueue')
    const qry = `?especialidade=geral`;

    const response = await api.get(`/integracao/listTeleAtendimento${qry}`, generateRequestHeader(authData.access_token));

    if ((response.status = 200)) {
      const { data }: { data: PacienteFila[] } = response;

      // obter o menor id
      const filteredPosition = data
        .filter(item => item.paciente_id.includes(String(dadosUsuarioData.pessoaDados?.cod_token_pes)))
        .reduce((min, item) => {
          return Number(item.ordem_fila) < Number(min.ordem_fila) ? item : min;
        }, data[0]);

      log('filteredPosition', filteredPosition);

      setPositionInQueue(filteredPosition);
      setHasAlreadyFetched(true);
      setLoading(false);
    } else {
      setLoading(false);
      toast.error('Erro ao acessar a fila. Contate o suporte e tente novamente', { position: 'bottom-center' });
      goBack();
    }
  }

  async function showNotification() {
    if(alreadyShownNotification) return;

    await notifee.displayNotification({
      title: "Você é o próximo da fila!",
      body: "Você é o próximo da fila! Clique aqui para voltar para o aplicativo.",
      android: {
        channelId: 'default-id-channel',
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });

    setAlreadyShownNotification(true);
  }

  useEffect(() => {
    (async () => {
      if (dadosUsuarioData.pessoaDados?.cod_token_pes && authData.access_token != '') {
        getIntoQueue();
      }
    })();
  }, [dadosUsuarioData, authData]);

  useEffect(() => {
    (async () => {
      if (agendaExamesId) {
        await getQueue();
      }
    })();
  }, [agendaExamesId]);

  useEffect(() => {
    if (!agendaExamesId) return;

    const interval = setInterval(() => {
      getQueue();
    }, 10000); // chama a cada 10 segundos

    return () => clearInterval(interval); // limpa ao desmontar o componente
  }, [agendaExamesId]);

  useEffect(() => {

    if(positionInQueue?.ordem_fila == '1') {
      showNotification();
    }

    if (!positionInQueue && hasAlreadyFetched) {
      navigate('user-telemed-finished');
    }

    if (positionInQueue && positionInQueue.status.includes('EM ATENDIMENTO')) {
      navigate('user-telemed-meet-screen', {
        url: `${agendaExamesId}_${dadosUsuarioData.pessoaDados?.cod_token_pes}`,
      });
    }




    
  }, [positionInQueue]);

  useEffect(() => {
    
  }, [positionInQueue])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <LoadingFull title="Aguarde..." />
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 10 }}>
            Agora é só esperar!
          </Text>

          <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
            {`Esta é o seu ticket.\nMantenha esta tela aberta no aplicativo para não perder o seu lugar!`}
          </Text>
          <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: 10, textAlign: 'center' }}>
            {`Após o fim da consulta, você será redirecionado para a Home do aplicativo.\nÉ só aguardar!`}
          </Text>

          {positionInQueue && (
            <View style={{ marginTop: 10, width: '100%', gap: 20 }}>
              <UserQueueCard data={positionInQueue} />
              <ActivityIndicator />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
});

export default UserTelemedQueueScreen;
