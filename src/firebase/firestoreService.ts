// src/services/firestoreService.ts
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  QueryDocumentSnapshot,
  type DocumentData
} from "firebase/firestore";
import type { DocumentItem } from "@/utils/types";
import { db } from "./firebase";

const COLLECTION = "document";

export async function createDocument(payload: Partial<DocumentItem>): Promise<string> {
  const col = collection(db, COLLECTION);
  const dref = await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return dref.id;
}

export async function updateDocument(id: string, payload: Partial<DocumentItem>) {
  const dref = doc(db, COLLECTION, id);
  await updateDoc(dref, {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function getDocumentById(id: string): Promise<DocumentItem | null> {
  const dref = doc(db, COLLECTION, id);
  const snap = await getDoc(dref);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    id: snap.id,
    title: data.title ?? "",
    description: data.description ?? "",
    content: data.content ?? "",
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

// existing helpers you may already have:
export async function removeDocument(id: string) {
  const dref = doc(db, COLLECTION, id);
  await deleteDoc(dref);
}

export async function listDocumentsOnce(): Promise<DocumentItem[]> {
  const col = collection(db, COLLECTION);
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      content: data.content ?? "",
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    } as DocumentItem;
  });
}

export function subscribeDocuments(callback: (items: DocumentItem[]) => void) {
  const col = collection(db, COLLECTION);
  const q = query(col, orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    const items = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? "",
        content: data.content ?? "",
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      } as DocumentItem;
    });
    callback(items);
  }, (err) => {
    console.error("subscribeDocuments error:", err);
    callback([]);
  });

  return unsub;
}
