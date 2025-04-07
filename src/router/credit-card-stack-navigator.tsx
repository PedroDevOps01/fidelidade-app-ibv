import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserCreditCardList from "../pages/user-credit-card-list";
import UserCreateCreditCard from "../pages/user-create-credit-card";

const CreditCardStack = createNativeStackNavigator();



export const CreditCardStackNavigator = () => {
  return (
    <CreditCardStack.Navigator
      initialRouteName="user-creditcard-list"
      screenOptions={{ headerShown: false }}
    >
      <CreditCardStack.Screen
        name="user-creditcard-list"
        component={UserCreditCardList}
      />
      <CreditCardStack.Screen
        name="user-create-credit-card-screen"
        component={UserCreateCreditCard}
        options={{ headerShown: false }}
      />
    </CreditCardStack.Navigator>
  );
};


export default CreditCardStackNavigator