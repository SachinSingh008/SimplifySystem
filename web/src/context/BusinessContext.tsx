"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import type { Business } from "@/types";

interface BusinessContextType {
  business: Business | null;
  loading: boolean;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
  loading: true,
});

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBusiness(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "businesses", user.uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setBusiness(snap.data() as Business);
        } else {
          setBusiness(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Business onSnapshot error:", error);
        setBusiness(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return (
    <BusinessContext.Provider value={{ business, loading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
