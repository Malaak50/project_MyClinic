import { useEffect, useRef, useState } from "react";
import { query as q, collection, orderBy, where, limit, startAfter, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export function usePaginatedQuery({ collectionName, filters = [], orderByField = "createdAt", order = "desc", pageSize = 10 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef(null);

  async function loadFirstPage() {
    setLoading(true);
    const base = q(
      collection(db, collectionName),
      ...filters.map(f => where(f.field, f.op, f.value)),
      orderBy(orderByField, order),
      limit(pageSize)
    );
    const snap = await getDocs(base);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setItems(docs);
    cursorRef.current = snap.docs[snap.docs.length - 1] || null;
    setHasMore(!!cursorRef.current);
    setLoading(false);
  }

  async function loadNextPage() {
    if (!hasMore || loading) return;
    setLoading(true);
    const base = q(
      collection(db, collectionName),
      ...filters.map(f => where(f.field, f.op, f.value)),
      orderBy(orderByField, order),
      startAfter(cursorRef.current),
      limit(pageSize)
    );
    const snap = await getDocs(base);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setItems(prev => [...prev, ...docs]);
    cursorRef.current = snap.docs[snap.docs.length - 1] || null;
    setHasMore(!!cursorRef.current);
    setLoading(false);
  }

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(filters), orderByField, order, pageSize]);

  return { items, loading, hasMore, loadNextPage, reload: loadFirstPage };
}

