"use client";

import { Preloader } from "@/components/Preloader";

export default function Template({ children }) {
  return (
    <>
      <Preloader />
      {children}
    </>
  );
}
