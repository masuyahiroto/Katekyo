import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function save(key, data) {
  setDoc(doc(db, 'educate', key), { items: data });
}

export function subscribe(key, callback) {
  return onSnapshot(doc(db, 'educate', key), (snap) => {
    callback(snap.exists() ? snap.data().items : []);
  });
}
