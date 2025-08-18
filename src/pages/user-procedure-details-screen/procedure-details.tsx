import { FlatList } from 'react-native';
import ProcedureItem from './procedure-item';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ProcedureDetailsProps {
  procedures: ProcedureResponse[];
}

type ProcedureStackParamList = {
  'user-procedure-time': { procedimento: ProcedureResponse };
};
type ProcedureNavigationProp = NativeStackNavigationProp<ProcedureStackParamList>;

export default function ProcedureDetails({ procedures }: ProcedureDetailsProps) {
  const navigation = useNavigation<ProcedureNavigationProp>();
  console.log("teste:", procedures);
  return (
    <FlatList
      data={procedures as ProcedureResponse[]}
      renderItem={({ item, index }) => <ProcedureItem procedure={item} navigation={navigation} />}
      style={{ marginTop: 10 }}
      contentContainerStyle={{ padding: 2 }}
      removeClippedSubviews={false}
    />
  );
}
