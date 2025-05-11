import 'react-native-reanimated';
import './gesture-handler.native';
import './firebaseInit';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { registerTranslation } from 'react-native-paper-dates'
import dayjs from 'dayjs';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

require('dayjs/locale/pt-br')

  registerTranslation('pt-BR', {
    save: 'Salvar',
    selectSingle: 'Selecione uma data',
    selectMultiple: 'Select as datas',
    selectRange: 'Selecione o período',
    notAccordingToDateFormat: (inputFormat) =>
      `Formado da data deve ser ${inputFormat}`,
    mustBeHigherThan: (date) => `Deve ser maior que ${date}`,
    mustBeLowerThan: (date) => `Deve ser anterior a ${date}`,
    mustBeBetween: (startDate, endDate) =>
      `Deve estar entre ${startDate} e ${endDate}`,
    dateIsDisabled: 'Dia não é permitido',
    previous: 'Anterior',
    next: 'Próximo',
    typeInDate: 'Escreva na data',
    pickDateFromCalendar: 'Escolha pelo calendário',
    close: 'Fechar',
  })
  dayjs.extend(require("dayjs/plugin/utc"))

  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
  });





AppRegistry.registerComponent(appName, () => App);