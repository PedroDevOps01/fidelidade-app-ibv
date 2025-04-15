export interface PromotionCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  route: string;
}

export const promotion_data: PromotionCard[] = [
  // {
  //   id: '1',
  //   title: 'Desconto de 50%',
  //   description: 'Aproveite 50% de desconto em nossos parceiros!',
  //   imageUrl: require('../../assets/images/discount1.png'),
  //   route: 'Shopping',
  // },
  {
    id: '2',
    title: 'Consultas',
    description: 'Consultas disponíveis',
    imageUrl: require('../../assets/images/discount2.png'),
    route: 'user-schedules',
  },
  // {
  //   id: '3',
  //   title: 'Promoção de Verão',
  //   description: 'Descontos imperdíveis em itens de verão.',
  //   imageUrl: require('../../assets/images/discount3.png'),
  //   route: '',
  // },
  // {
  //   id: '4',
  //   title: 'Frete Grátis',
  //   description: 'Frete grátis para compras acima de R$100,00.',
  //   imageUrl: require('../../assets/images/discount4.png'),
  //   route: '',
  // },
  // {
  //   id: '5',
  //   title: 'Semana do Consumidor',
  //   description: 'Descontos especiais durante a Semana do Consumidor.',
  //   imageUrl: require('../../assets/images/discount5.png'),
  //   route: '',
  // },
];