import { FlatList, RefreshControl, View } from 'react-native';
import ProdutoCard from './produtos-card';

interface ProdutosParceiroListProps {
  data: ProdutoParceiroResponse[];
  loading: boolean;
  onRefresh: () => void;
}

const ProdutosParceiroList = ({
  data,
  loading,
  onRefresh,
}: ProdutosParceiroListProps) => {
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id_produto_parceiro_ppc.toString()}
      renderItem={({item}) => <ProdutoCard item={item}/>}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    />
  );
};

export default ProdutosParceiroList;
