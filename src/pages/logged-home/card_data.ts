//card_data
export interface CardData {
  id: string;
  route?: string;
  imageUrl: string;
}

export const card_data: CardData[] = [
  {
    id: '1',

    route: 'user-telemed-stack',
    imageUrl: require('../../assets/images/telemedicina.png'),
  },
  // {
  //   id: '2',
  //   title: 'Telepet',
  //   description: 'Telepet para assinantes!',
  //   route: 'user-telepet-stack',
  //   icon: 'dog',
  // },
  // {
  //   id: '3',
  //   title: 'Consultas e exames',
  //   description: 'Confira os agendamentos e veja seus exames',
  //   route: 'user-schedules',
  //   icon: 'stethoscope',
  // },
];
