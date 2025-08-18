import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme } from '../themes/app-theme';
import { DefaultTheme, Theme } from '@react-navigation/native';

// Definir o tipo do contexto do tema
interface ThemeContextData {
  theme: Theme;
  updateTheme: (colorPalette: ColorPalette) => Promise<void>;
}

// Criar o contexto
const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

// Criar o provedor do contexto
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(DefaultTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('appTheme');
      if (storedTheme) {
        setTheme(JSON.parse(storedTheme));
      }
    };

    loadTheme();
  }, []);

  const updateTheme = async (colorPalette: ColorPalette) => {
    const customTheme: Theme = {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        ...colorPalette, // Mescla a paleta de cores recebida no tema
      },
    };

    // Armazena o tema no AsyncStorage para persistência
    await AsyncStorage.setItem('appTheme', JSON.stringify(customTheme));

    setTheme(customTheme);
  };



  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <PaperProvider theme={LightTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

// Hook para acessar o contexto
export const useThemeContext = (): ThemeContextData => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
