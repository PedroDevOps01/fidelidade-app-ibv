import React, { createContext, useContext, useReducer } from "react";

interface ContratosData  {
  data: ContratoResponse[] | null
}

const initialContratosDataState = {
  data: []
}


type Action =
  | { type: "SET_CONTRATOS_DATA"; payload: ContratosData }
  | { type: "CLEAR_CONTRATOS_DATA" }


const contratosReducer = (state: ContratosData, action: Action) => {
  switch(action.type) {
    case "SET_CONTRATOS_DATA":
      return {...state, data: action.payload.data}
    case "CLEAR_CONTRATOS_DATA":
      return initialContratosDataState
    default:
      return state
  }
}

const ContratosContext = createContext<{
  contratosData: ContratosData,
  setContratosData: (data: ContratosData) => void
  clearContratosData: () => void
}>({
  contratosData: initialContratosDataState,
  setContratosData: () => {},
  clearContratosData: () => {}
})


export const ContratosProvider: React.FC<{ children: React.ReactNode}> = ({
  children
}) => {
  const [contratosData, dispatch] = useReducer(
    contratosReducer,
    initialContratosDataState
  );


  const setContratosData = (data: ContratosData) => {
    dispatch({type: 'SET_CONTRATOS_DATA', payload: data})
  }

  const clearContratosData = () => {
    dispatch({type: 'CLEAR_CONTRATOS_DATA'});
  }

  return (
    <ContratosContext.Provider
    value={{
      contratosData,
      setContratosData,
      clearContratosData
    }}
    >
      {children}

    </ContratosContext.Provider>
  )


}


export const useContratos = () => {
  const context = useContext(ContratosContext);
  if (!context) {
    throw new Error("useContratos must be used within a ContratosProvider");
  }
  return context;
}




