import { useMemo, useState } from "react";
import { Button, Message } from "@arco-design/web-react";
import ProductsSearch from "../components/ProductsSearch";
import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../components/ProductFormModal";
import { useProductsQuery, type SortField } from "../hooks/useProductsQuery";
import { useProductsData } from "../hooks/useProductsData";
import { createProduct, updateProduct, deleteProduct } from "../api/products";
import type { Product } from "../types/product";
import type { ProductCreate } from "../types/productCreate";

const PageSize = 10;
type Status = Product["status"];

export default function ProductsPage() {
  // URL 查询与写入（q/page/sort）
  const { q, page, sortBy, sortDir, setQuery, setPage, setSort } =
    useProductsQuery();

  // 列表数据
  const [refresh, setRefresh] = useState(0);
  const { data, loading, err } = useProductsData({
    q,
    page,
    pageSize: PageSize,
    sortBy,
    sortDir,
    refresh,
  });

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const openCreate = () => {
    setModalMode("create");
    setCurrent(null);
    setModalOpen(true);
  };
  const openEdit = (record: Product) => {
    setModalMode("edit");
    setCurrent(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values: {
    name: string;
    price: number;
    stock: number;
    status?: Status;
  }) => {
    try {
      setModalLoading(true);
      if (modalMode === "create") {
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
          status: values.status,
        });
        Message.success("保存成功");
      }
      setModalOpen(false);
      setRefresh((x) => x + 1); // 重新拉取
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      Message.success("已删除");
      setRefresh((x) => x + 1);
    } catch {
      Message.error("删除失败，请稍后重试");
    }
  };

  // 分页、排序回调给表格
  const onSort = (field?: SortField, dir?: "ascend" | "descend") =>
    setSort(field, dir);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex w-full items-center gap-4">
        <ProductsSearch q={q} onQueryChange={setQuery} />
        <Button type="primary" onClick={openCreate}>
          新增
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <ProductsTable
          data={items}
          loading={loading}
          page={page}
          total={total}
          pageSize={PageSize}
          sortBy={sortBy}
          sortDir={sortDir}
          err={err}
          onPage={setPage}
          onSort={onSort}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

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
