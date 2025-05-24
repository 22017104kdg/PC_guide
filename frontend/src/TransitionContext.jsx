import { createContext, useContext, useState } from "react";

const TransitionContext = createContext();

export function TransitionProvider({ children }) {
  const [direction, setDirection] = useState("forward");

  return (
    <TransitionContext.Provider value={{ direction, setDirection }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitionDirection() {
  return useContext(TransitionContext);
}
