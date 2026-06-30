import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function save(key, data) {
  setDoc(doc(db, 'educate', key), { items: data });
}

export function subscribe(key, callback) {
  console.log('[FB] subscribing:', key);
  return onSnapshot(
    doc(db, 'educate', key),
    { includeMetadataChanges: true },
    (snap) => {
      console.log('[FB] snapshot:', key, 'exists:', snap.exists(), 'fromCache:', snap.metadata.fromCache);
      callback(snap.exists() ? snap.data().items : [], snap.metadata.fromCache);
    },
    (error) => {
      console.error('[FB] error:', key, error.code, error.message);
    }
  );
}
