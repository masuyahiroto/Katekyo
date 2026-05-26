import { useState, useCallback } from 'react';
import { load, save } from './storage';

function useCollection(key) {
  const [items, setItems] = useState(() => load(key));

  const add = useCallback((item) => {
    setItems((prev) => {
      const next = [...prev, { ...item, id: crypto.randomUUID() }];
      save(key, next);
      return next;
    });
  }, [key]);

  const update = useCallback((id, patch) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
      save(key, next);
      return next;
    });
  }, [key]);

  const remove = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      save(key, next);
      return next;
    });
  }, [key]);

  return { items, add, update, remove };
}

export function useStore() {
  const students = useCollection('students');
  const homework = useCollection('homework');
  const workbooks = useCollection('workbooks');
  const tests = useCollection('tests');
  const sessions = useCollection('sessions');
  return { students, homework, workbooks, tests, sessions };
}
