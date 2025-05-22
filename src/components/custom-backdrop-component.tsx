import React from 'react';
import { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

const CustomBackdrop = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0} // Mostra o backdrop quando o BottomSheet estiver aberto
      disappearsOnIndex={-1} // Esconde completamente quando fechado
      pressBehavior="close" // Fecha o BottomSheet ao tocar fora (pode trocar por "none" se quiser bloquear)
      style={{
        backgroundColor: 'rgba(140, 140, 140, 0.9)',
      }}
    />
  );
};

export default CustomBackdrop;