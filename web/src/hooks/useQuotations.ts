"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Quotation } from "@/types";

export function useQuotations(statusFilter?: Quotation["status"] | "all") {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const constraints: any[] = [
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(100),
    ];

    if (statusFilter && statusFilter !== "all") {
      constraints.splice(1, 0, where("status", "==", statusFilter));
    }

    const q = query(collection(db, "quotations"), ...constraints);

    const unsubscribe = onSnapshot(q, (snap) => {
      setQuotations(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? "",
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? "",
        })) as Quotation[]
      );
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, statusFilter]);

  return { quotations, loading, error };
}
