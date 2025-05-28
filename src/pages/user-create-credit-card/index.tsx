import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";
import {
  CreditCardSchema,
  CreditCardSchemaFormType,
} from "../../form-objects/credit-card-form-object";
import { zodResolver } from "@hookform/resolvers/zod";
import UserCreditCard from "./user-credit-card";
import { useEffect, useState } from "react";
import { generateRequestHeader, getCardBrand, log } from "../../utils/app-utils";
import { ScrollView } from "react-native-gesture-handler";
import { useDadosUsuario } from "../../context/pessoa-dados-context";
import { api } from "../../network/api";
import { useAuth } from "../../context/AuthContext";
import { goBack } from "../../router/navigationRef";
import {
  CreditCardFormField,
  CreditCardView,
} from "react-native-credit-card-input";

export default function UserCreateCreditCard() {
  const { colors } = useTheme();
  const { dadosUsuarioData } = useDadosUsuario();
  const { authData } = useAuth();

  const [focusedField, setFocusedField] = useState<
    CreditCardFormField | undefined
  >("number");
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreditCardSchemaFormType>({
    resolver: zodResolver(CreditCardSchema),
    defaultValues: {
      id_pessoa_pes: dadosUsuarioData.pessoaDados?.id_pessoa_pes,
      brand: "",
      cvv: "",
      exp_month: "",
      exp_year: "",
      holder_document: "",
      holder_name: "",
      number: "",
    },
  });

  const cardValues = watch();
  const cardBrand = getCardBrand(watch("number"));

  useEffect(() => {
    setValue("brand", cardBrand ?? "");
  }, [cardBrand]);

  const onSubmit = async (data: CreditCardSchemaFormType) => {
    console.log("Form Data:", JSON.stringify(data, null, 2));

    setLoading(true);
    try {
      const response = await api.post(
        "integracaoPagarMe/criarCartaoCliente",
        data,
        generateRequestHeader(authData.access_token)
      );

      if (response.data.error) {
        console.log(JSON.stringify(response.data, null, 2));

        Alert.alert(
          "Aviso",
          "Erro ao cadastrar cartão! Confira os dados e tente novamente",
          [
            {
              text: "Continuar",
              onPress: () => {},
            },
          ]
        );
      } else {
        Alert.alert("Aviso", response.data.message, [
          {
            text: "Continuar",
            onPress: () => {
              goBack();
            },
          },
        ]);
      }
    } catch(err) {
      log("Error:", err);
      Alert.alert("Aviso", "Erro ao cadastrar cartão!");
    } finally {
      setLoading(false);
    }
  };

  const onError = (data: any) => {
    console.log("Form error:", data);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <CreditCardView
        focusedField={focusedField}
        number={cardValues.number}
        cvc={cardValues.cvv}
        expiry={`${cardValues.exp_month}/${cardValues.exp_year}`}
        name={cardValues.holder_name}
        style={styles.cardView}
        type={cardBrand}
      />

      {/* <View
        style={{
          flex: 0.4,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 10,
          paddingHorizontal: 20,
        }}
      >
        <UserCreditCard
          number={watch("number")}
          brand={watch("brand")}
          exp_month={watch("exp_month")}
          exp_year={watch("exp_year")}
          holder_name={watch("holder_name")}
        />
      </View> */}

      <View style={{ flex: 0.5, marginBottom: 20, paddingHorizontal: 20 }}>
        <Controller
          control={control}
          name="number"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Número"
              value={value}
              onChangeText={(e) => {
                onChange(e);
              }}
              mode="outlined"
              error={!!errors.number}
              inputMode="numeric"
              maxLength={16}
              style={{ marginBottom: 10 }}
              onFocus={() => setFocusedField("number")}
            />
          )}
        />
        <Controller
          control={control}
          name="holder_name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="Nome"
              value={value}
              onChangeText={(e) => {
                onChange(e);
              }}
              mode="outlined"
              error={!!errors.holder_name}
              style={{ marginBottom: 10 }}
            />
          )}
        />
        <Controller
          control={control}
          name="holder_document"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="CPF"
              value={value}
              onChangeText={(e) => {
                onChange(e);
              }}
              mode="outlined"
              error={!!errors.holder_document}
              inputMode="numeric"
              style={{ marginBottom: 10 }}
            />
          )}
        />

        <View style={styles.row}>
          <Controller
            control={control}
            name="exp_month"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Mês"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                error={!!errors.exp_month}
                inputMode="numeric"
                maxLength={2}
                style={[styles.input, { marginHorizontal: 0 }]}
                onFocus={() => setFocusedField("expiry")}
              />
            )}
          />
          <Controller
            control={control}
            name="exp_year"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Ano(YYYY)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                error={!!errors.exp_year}
                inputMode="numeric"
                maxLength={4}
                style={styles.input}
                onFocus={() => setFocusedField("expiry")}
              />
            )}
          />
          <Controller
            control={control}
            name="cvv"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="CVV"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                error={!!errors.cvv}
                inputMode="numeric"
                maxLength={3}
                style={[styles.input, { marginHorizontal: 0 }]}
                onFocus={() => setFocusedField("cvc")}
                onBlur={() => setFocusedField("number")}
              />
            )}
          />
        </View>
      </View>

      {/* Botão para cadastrar o cartão */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit, onError)}
          contentStyle={{ backgroundColor: colors.primary }}
          disabled={loading}
          key={loading ? "disabled" : "enabled"}
        >
          {loading ? "Aguarde" : "Cadastrar Cartão"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputMinContainer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around", // Garante espaçamento uniforme entre os campos
    alignItems: "center",
    paddingHorizontal: 0,
  },
  input: {
    flex: 1, // Garante que todos os campos tenham o mesmo tamanho
    marginHorizontal: 5, // Espaçamento entre os campos
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
  cardView: {
    alignSelf: "center",
    marginVertical: 10,
  },
});
