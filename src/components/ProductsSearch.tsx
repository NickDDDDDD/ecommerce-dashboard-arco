import { useEffect, useState } from "react";
import { Input } from "@arco-design/web-react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
const InputSearch = Input.Search;

export default function ProductsSearch({
  q,
  onQueryChange,
}: {
  q: string;
  onQueryChange: (next: string) => void;
}) {
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);

  const debounced = useDebouncedValue(text, 300);
  useEffect(() => {
    if (debounced !== q) onQueryChange(debounced);
  }, [debounced, q, onQueryChange]);

  return (
    <InputSearch
      className="flex-1"
      allowClear
      placeholder="按商品名称搜索"
      style={{ width: 260 }}
      value={text}
      onChange={setText}
      onSearch={(v) => onQueryChange(v.trim())}
    />
  );
}
