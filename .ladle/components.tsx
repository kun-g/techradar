import React from "react";
import type { GlobalProvider } from "@ladle/react";
import { Toaster } from "sonner";
import "../styles/globals.css";

export const Provider: GlobalProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}; 