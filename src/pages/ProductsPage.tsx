import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router";
import {
  Tooltip,
  Button,
  Input,
  Table,
  Popconfirm,
  Message,
} from "@arco-design/web-react";
import type { TableProps, TableColumnProps } from "@arco-design/web-react";
import dayjs from "../lib/dayjs";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";
import type { ProductsResp } from "../types/productsResp";
import type { Product } from "../types/product";
import type { ProductCreate } from "../types/productCreate";
import ProductFormModal from "../components/ProductFormModal";

type OnChange = NonNullable<TableProps<Product>["onChange"]>;
type SortField = "price" | "stock";
type SortDir = "asc" | "desc";
const PageSize = 10;
const InputSearch = Input.Search;
type Status = Product["status"]; // "draft" | "active" | "archived"

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();

  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const sortBy = (params.get("sortBy") ?? "") as "" | SortField;
  const sortDir = (params.get("sortDir") ?? "asc") as SortDir;
  const searchQuery = (params.get("q") ?? "").trim();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [data, setData] = useState<ProductsResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<unknown>(null);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // 触发刷新
  const [refresh, setRefresh] = useState(0);

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
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      const val = searchInput.trim();
      if (val) next.set("q", val);
      else next.delete("q");
      next.set("page", "1");
      setParams(next, { replace: true });
    }, 300);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [searchInput, params, setParams]);

  useEffect(() => setSearchInput(searchQuery), [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const resp = await getProducts({
          q: searchInput || undefined,
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
  }, [page, sortBy, sortDir, refresh, searchInput]);

  // 打开新增
  const openCreate = () => {
    setModalMode("create");
    setCurrent(null);
    setModalOpen(true);
  };
  // 打开编辑 自动填充当前 record
  const openEdit = (record: Product) => {
    setModalMode("edit");
    setCurrent(record);
    setModalOpen(true);
  };

  // 删除（
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      Message.success("已删除");
      setRefresh((x) => x + 1);
    } catch (e) {
      Message.error("删除失败，请稍后重试");
      console.error("删除失败：", e);
    }
  };

  // Modal 提交
  const handleSubmit = async (values: {
    name: string;
    price: number;
    stock: number;
    status?: string;
  }) => {
    try {
      setModalLoading(true);
      if (modalMode === "create") {
        // 只传 ProductCreate 字段
        const payload: ProductCreate = {
          name: values.name,
          price: values.price,
          stock: values.stock,
        };
        await createProduct(payload);
        Message.success("新增成功");
      } else {
        if (!current) return;
        await updateProduct(current.id, {
          name: values.name,
          price: values.price,
          stock: values.stock,
          status: values.status as Status | undefined, // ← 再保险收窄一次
        });
        Message.success("保存成功");
      }
      setModalOpen(false);
      setRefresh((x) => x + 1);
    } finally {
      setModalLoading(false);
    }
  };

  const columns: TableColumnProps<Product>[] = [
    { title: "商品ID", dataIndex: "id" },
    { title: "商品名", dataIndex: "name", ellipsis: true },
    {
      title: "价格",
      dataIndex: "price",
      align: "right",
      sorter: true,
      sortOrder:
        sortBy === "price"
          ? sortDir === "asc"
            ? ("ascend" as const)
            : ("descend" as const)
          : undefined,
      render: (v: number) => `¥${v}`,
    },
    {
      title: "库存",
      dataIndex: "stock",
      align: "right",
      sorter: true,
      sortOrder:
        sortBy === "stock"
          ? sortDir === "asc"
            ? ("ascend" as const)
            : ("descend" as const)
          : undefined,
    },
    {
      title: "发布时间",
      dataIndex: "publishedAt",
      width: 220,
      render: (value?: string | null) =>
        value ? (
          <Tooltip
            position="tl"
            content={dayjs(value).format("YYYY-MM-DD HH:mm:ss")}
          >
            <span style={{ display: "block", width: "100%" }}>
              {dayjs(value).fromNow()}
            </span>
          </Tooltip>
        ) : (
          "-" // 后端初始 publish=null
        ),
    },
    { title: "状态", dataIndex: "status" },
    {
      title: "操作",
      dataIndex: "op",
      width: 180,
      render: (_, record) => (
        <>
          <Button size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除这条商品吗？"
            onOk={() => handleDelete(record.id)}
          >
            <Button size="small" status="danger" type="primary">
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

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

    if (nextPag?.current && nextPag.current !== page)
      next.set("page", String(nextPag.current));

    if (field && dir) {
      if (field === "price" || field === "stock") {
        next.set("sortBy", field);
        next.set("sortDir", dir === "ascend" ? "asc" : "desc");
        next.set("page", "1");
      }
    } else if (params.get("sortBy")) {
      next.delete("sortBy");
      next.delete("sortDir");
      next.set("page", "1");
    }
    setParams(next, { replace: true });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex w-full items-center gap-4">
        <InputSearch
          className="flex-1"
          allowClear
          placeholder="按商品名称搜索"
          style={{ width: 260 }}
          value={searchInput}
          onChange={(v) => {
            setSearchInput(v);
            // 如果想“点清空”立刻生效而不是等 300ms，可加这段：
            if (v === "") {
              const next = new URLSearchParams(params);
              next.delete("q");
              next.set("page", "1");
              setParams(next, { replace: true });
            }
          }}
          onSearch={(v) => {
            // 回车/点放大镜时，立即提交（不等防抖）
            const next = new URLSearchParams(params);
            const val = v.trim();
            if (val) next.set("q", val);
            else next.delete("q");
            next.set("page", "1");
            setParams(next, { replace: true });
          }}
        />
        <Button type="primary" onClick={openCreate}>
          新增
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={data?.items ?? []}
        pagination={pagination}
        onChange={handleChange}
        noDataElement={err ? "加载失败，请稍后再试" : "暂无数据"}
        renderPagination={(node) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {node}
          </div>
        )}
      />

      <ProductFormModal
        open={modalOpen}
        mode={modalMode}
        initial={current ?? undefined}
        confirmLoading={modalLoading}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
