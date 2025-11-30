import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { COLLECTION, type DocumentItem } from "@/utils/types";
import { db } from "@/firebase/firebase";

export default function useDocuments() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setDocs(items);
      setLoading(false);
    }, (err) => {
      console.error("snapshot error", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { docs, loading };
}
