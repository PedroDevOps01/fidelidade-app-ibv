import { createContext, ReactNode, useContext, useState } from "react";

interface CreateMdvContextProps {
  mdvBankData: CreateMdvData | null
  setMdvBankData: (data: CreateMdvData) => void
  clearMdvBankData: () => void
}


const initialValue: CreateMdvContextProps = {
  mdvBankData: null,
  setMdvBankData: () => {},
  clearMdvBankData: () => {}
}


const CreateMdvContext = createContext<CreateMdvContextProps>(initialValue);


export const CreateMdvProvider = ({ children }: { children: ReactNode }) => {
  const [mdvContext, setMdvContext] = useState<CreateMdvData>();

  return (
    <CreateMdvContext.Provider value={{
      clearMdvBankData: () => setMdvContext(undefined),
      mdvBankData: mdvContext!,
      setMdvBankData: (data: CreateMdvData) => setMdvContext(data)
    }}>
      {children}

    </CreateMdvContext.Provider>
  )
  
}


export const useCreateMdv = () => {
  const context = useContext(CreateMdvContext);
  if (!context) {
    throw new Error("useCreateMdv must be used within a useAccquirePlanProvider");
  }
  return context;
};
