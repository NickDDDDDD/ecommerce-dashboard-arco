import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import type { ProductsResp } from "../types/productsResp";
import type { SortField, SortDir } from "./useProductsQuery";

export function useProductsData(params: {
  q?: string;
  page: number;
  pageSize: number;
  sortBy?: SortField | "";
  sortDir: SortDir;
  refresh: number;
}) {
  const { q, page, pageSize, sortBy, sortDir, refresh } = params;
  const [data, setData] = useState<ProductsResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const resp = await getProducts({
          q: q || undefined,
          page,
          pageSize,
          sortBy: sortBy || undefined,
          sortDir,
        });
        if (!cancelled) setData(resp);
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, page, pageSize, sortBy, sortDir, refresh]);

  return { data, loading, err };
}
