import React, { useState } from "react";
import { Platform, View, Button, Text, Pressable, StyleSheet } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  mode: "date" | "time" | "datetime";
  is24Hour?: boolean;
  display?: "default" | "spinner" | "calendar" | "clock";
  label?: string;
}

export default function CustomDatePicker({
  onChange,
  value,
  mode,
  is24Hour = true,
  display = "default",
  label = "Selecionar data",
}: CustomDatePickerProps) {
  const [show, setShow] = useState(Platform.OS === "ios");

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // No Android, fecha ao selecionar
    onChange(event, selectedDate);
  };

  return (
    <View style={styles.container}>
      {Platform.OS === "android" && (
        <Pressable onPress={() => setShow(true)} style={styles.button}>
          <Text style={styles.buttonText}>{label}: { value ? value.toLocaleDateString() : new Date().toLocaleDateString()}</Text>
        </Pressable>
      )}

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value ?? new Date()}
          mode={mode}
          is24Hour={is24Hour}
          display={display}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 0,
    padding: 0
  },
  button: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
  },
});
