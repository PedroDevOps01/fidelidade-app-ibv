import {io} from 'socket.io-client';

const socketConnection = (userName: string) => {
  let socket: any;

  socket = io('https://backendwebrtc.henriquelabs.com.br/', {
    transports: ['websocket'], // assegure que está utilizando WebSocket
    secure: true,
    rejectUnauthorized: false, // aceita certificados auto-assinados
    auth: {
      password: 'x',
      userName,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected!', socket.id);
  });

  // Captura erros de conexão
  socket.on('connect_error', (err: any) => {
    console.log('Connection error:', err);
  });

  // Verifica quando o socket desconecta
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export default socketConnection;
