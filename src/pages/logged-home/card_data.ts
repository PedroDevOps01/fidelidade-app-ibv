//card_data
export interface CardData {
  id: string;
  title: string;
  description: string;
  route?: string;
  icon: string;
  imageUrl: string;
}

export const card_data: CardData[] = [
  {
    id: '1',
    title: 'Telemedicina',
    description: 'Telemedicina para assinantes!',
    route: 'user-telemed-stack',
    icon: 'doctor',
    imageUrl: require('../../assets/images/teleconsulta.jpg'),
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
