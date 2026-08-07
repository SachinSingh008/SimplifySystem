"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { Invoice } from "@/types";

export function useInvoices(statusFilter?: Invoice["status"]) {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const constraints: any[] = [
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(100),
    ];

    if (statusFilter) {
      constraints.splice(1, 0, where("status", "==", statusFilter));
    }

    const q = query(collection(db, "invoices"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? "",
          updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? "",
        })) as Invoice[];
        setInvoices(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, statusFilter]);

  return { invoices, loading, error };
}
