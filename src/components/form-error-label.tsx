import {Text} from 'react-native';

const FormErrorLabel = ({message}: {message: string}) => {
  return (
    <Text
      style={{
        color: 'red',
        marginBottom: 8,
      }}>
      {message}
    </Text>
  );
};

export default FormErrorLabel;
