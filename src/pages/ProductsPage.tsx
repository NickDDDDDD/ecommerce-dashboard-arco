import { useEffect, useMemo, useState } from "react";
import { Table } from "@arco-design/web-react";
import { useSearchParams } from "react-router";
import { getProducts } from "../api/products";
import type { ProductsResp } from "../types/productsResp";
import type { TableProps } from "@arco-design/web-react";
import type { TableColumnProps } from "@arco-design/web-react";
import { Tooltip } from "@arco-design/web-react";
import dayjs from "../lib/dayjs";

import type { Product } from "../types/product";
type OnChange = NonNullable<TableProps<Product>["onChange"]>;

type SortField = "price" | "stock";
type SortDir = "asc" | "desc";
const PageSize = 10;

const ProductsPage = () => {
  const [params, setParams] = useSearchParams();

  // URL 同步
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const sortBy = (params.get("sortBy") ?? "") as "" | SortField;
  const sortDir = (params.get("sortDir") ?? "asc") as SortDir;

  // 本地状态
  const [data, setData] = useState<ProductsResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  const pagination = useMemo(
    () => ({
      current: page,
      pageSize: PageSize,
      total: data?.total ?? 0,
      showTotal: false,
      sizeCanChange: false,
      pageSizeChangeResetCurrent: false,
    }),
    [page, data?.total],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const resp = await getProducts({
          page,
          pageSize: PageSize,
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
  }, [page, sortBy, sortDir]);

  // 列
  const columns: TableColumnProps<Product>[] = [
    { title: "商品ID", dataIndex: "id" },
    { title: "商品名", dataIndex: "name", ellipsis: true },
    {
      title: "价格",
      dataIndex: "price",
      sorter: true,
      sortOrder:
        sortBy === "price"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (v: number) => `¥${v}`,
    },
    {
      title: "库存",
      dataIndex: "stock",
      sorter: true,
      sortOrder:
        sortBy === "stock"
          ? sortDir === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },

    {
      title: "发布时间",
      dataIndex: "publishedAt",
      width: 220,
      render: (value: string) =>
        value ? (
          <Tooltip
            position="tl"
            content={dayjs(value).format("YYYY-MM-DD HH:mm:ss")}
          >
            <span className="block w-full">{dayjs(value).fromNow()}</span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    { title: "状态", dataIndex: "status" },
  ];

  // 交互：分页 / 排序 同步到 URL（服务端分页/排序）
  const handleChange: OnChange = (nextPag, sorter) => {
    const next = new URLSearchParams(params);

    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = (s && "field" in s ? s.field : undefined) as
      | keyof Product
      | undefined;
    const dir = (s && "direction" in s ? s.direction : undefined) as
      | "ascend"
      | "descend"
      | undefined;

    // 分页
    if (nextPag?.current && nextPag.current !== page) {
      next.set("page", String(nextPag.current));
    }

    // 排序
    if (field && dir) {
      // 只允许后端排序的字段
      if (field === "price" || field === "stock") {
        next.set("sortBy", field);
        next.set("sortDir", dir === "ascend" ? "asc" : "desc");
        next.set("page", "1");
      }
    } else {
      // 清除排序
      if (params.get("sortBy")) {
        next.delete("sortBy");
        next.delete("sortDir");
        next.set("page", "1");
      }
    }

    setParams(next, { replace: true });
  };

  return (
    <div className="h-full">
      <div>hello</div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={data?.items ?? []}
        pagination={pagination}
        onChange={handleChange}
        noDataElement={err ? "加载失败，请稍后再试" : "暂无数据"}
        renderPagination={(node) => (
          <div className="flex items-center justify-center">{node}</div>
        )}
      />
    </div>
  );
};

export default ProductsPage;
