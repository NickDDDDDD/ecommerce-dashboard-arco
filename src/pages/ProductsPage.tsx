import { useMemo, useState, useEffect } from "react";
import { Button, Message } from "@arco-design/web-react";
import ProductsSearch from "../components/ProductsSearch";
import ProductsTable from "../components/ProductsTable";
import ProductFormModal from "../components/ProductFormModal";
import { useProductsQuery, type SortField } from "../hooks/useProductsQuery";
import type { Product } from "../types/product";
import type { ProductCreate } from "../types/productCreate";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProducts,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  type FetchParams,
} from "../store/productsSlice";

const PageSize = 10;
type Status = Product["status"];

export default function ProductsPage() {
  // URL 查询与写入（q/page/sort）
  const { q, page, sortBy, sortDir, setQuery, setPage, setSort } =
    useProductsQuery();

  const dispatch = useAppDispatch();
  const { items, total, loading, error } = useAppSelector((s) => s.products);

  useEffect(() => {
    const params: FetchParams = {
      q,
      page,
      pageSize: PageSize,
      sortBy,
      sortDir,
    };
    dispatch(fetchProducts(params));
  }, [q, page, sortBy, sortDir, dispatch]);

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
    const params: FetchParams = {
      q,
      page,
      pageSize: PageSize,
      sortBy,
      sortDir,
    };

    try {
      setModalLoading(true);
      if (modalMode === "create") {
        const payload: ProductCreate = {
          name: values.name,
          price: values.price,
          stock: values.stock,
        };
        await dispatch(createProductThunk(payload)).unwrap();
        Message.success({ content: "新增成功" });
      } else {
        if (!current) return;
        await dispatch(
          updateProductThunk({
            id: current.id,
            changes: {
              name: values.name,
              price: values.price,
              stock: values.stock,
              status: values.status,
            },
          }),
        ).unwrap();
        Message.success({ content: "更新成功" });
      }
      setModalOpen(false);
      await dispatch(fetchProducts(params));
    } catch (err) {
      Message.error({ content: "更新失败，请稍后重试" });
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const params: FetchParams = {
      q,
      page,
      pageSize: PageSize,
      sortBy,
      sortDir,
    };
    try {
      await dispatch(deleteProductThunk(id)).unwrap();
      Message.success({ content: "已删除" });
      await dispatch(fetchProducts(params));
    } catch (err) {
      Message.error({ content: "删除失败，请稍后重试" });
      console.error(err);
    }
  };

  // 分页、排序回调给表格
  const onSort = (field?: SortField, dir?: "ascend" | "descend") =>
    setSort(field, dir);

  const itemsMemo = useMemo(() => items ?? [], [items]);
  const totalMemo = total ?? 0;

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
          data={itemsMemo}
          loading={loading}
          page={page}
          total={totalMemo}
          pageSize={PageSize}
          sortBy={sortBy}
          sortDir={sortDir}
          err={error}
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
