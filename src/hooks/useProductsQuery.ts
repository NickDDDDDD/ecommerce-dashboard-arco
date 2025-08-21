import { useSearchParams } from "react-router";

export type SortField = "price" | "stock";
export type SortDir = "asc" | "desc";

export function useProductsQuery() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const sortBy = (params.get("sortBy") ?? "") as "" | SortField;
  const sortDir = (params.get("sortDir") ?? "asc") as SortDir;

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };

  const setQuery = (value: string) =>
    update((next) => {
      const v = value.trim();
      if (v) next.set("q", v);
      else next.delete("q");
      next.set("page", "1");
    });

  const setPage = (p: number) =>
    update((next) => next.set("page", String(Math.max(1, p))));

  const setSort = (field?: SortField, direction?: "ascend" | "descend") =>
    update((next) => {
      if (field && direction) {
        next.set("sortBy", field);
        next.set("sortDir", direction === "ascend" ? "asc" : "desc");
        next.set("page", "1");
      } else {
        next.delete("sortBy");
        next.delete("sortDir");
        next.set("page", "1");
      }
    });

  return { q, page, sortBy, sortDir, setQuery, setPage, setSort };
}
