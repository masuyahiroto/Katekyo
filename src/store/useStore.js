import { useState, useCallback, useEffect } from 'react';
import { save, subscribe } from './storage';

function useCollection(key) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribe(key, (data, fromCache) => {
      setItems(data);
      // キャッシュが空の場合はサーバーの応答を待つ（スマホ初回アクセス時の誤検知防止）
      if (!fromCache || data.length > 0) {
        setReady(true);
      }
    });
    return unsub;
  }, [key]);

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

  return { items, add, update, remove, ready };
}

export function useStore() {
  const students = useCollection('students');
  const homework = useCollection('homework');
  const workbooks = useCollection('workbooks');
  const tests = useCollection('tests');
  const sessions = useCollection('sessions');
  const studentEvents = useCollection('studentEvents');
  const selfTests = useCollection('selfTests');

  const ready = students.ready && homework.ready && workbooks.ready && tests.ready && sessions.ready && studentEvents.ready;
  // selfTests は新規コレクションのため ready チェックから除外（存在しない場合でもブロックしない）

  return { students, homework, workbooks, tests, sessions, studentEvents, selfTests, ready };
}
