import {
  Table,
  Button,
  Popconfirm,
  Tooltip,
  Pagination,
} from "@arco-design/web-react";
import type { TableProps, TableColumnProps } from "@arco-design/web-react";
import type { Product } from "../types/product";
import type { SortField, SortDir } from "../hooks/useProductsQuery";
import dayjs from "../lib/dayjs";

type OnChange = NonNullable<TableProps<Product>["onChange"]>;

export default function ProductsTable({
  data,
  loading,
  page,
  total,
  pageSize,
  sortBy,
  sortDir,
  err,
  onPage,
  onSort,
  onEdit,
  onDelete,
}: {
  data: Product[];
  loading: boolean;
  page: number;
  total: number;
  pageSize: number;
  sortBy: "" | SortField;
  sortDir: SortDir;
  err: unknown;
  onPage: (p: number) => void;
  onSort: (field?: SortField, dir?: "ascend" | "descend") => void;
  onEdit: (record: Product) => void;
  onDelete: (id: string) => void | Promise<void>;
}) {
  const columns: TableColumnProps<Product>[] = [
    { title: "商品ID", dataIndex: "id", ellipsis: true },
    { title: "商品名", dataIndex: "name", ellipsis: true },
    {
      title: "价格",
      dataIndex: "price",
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
            <span className="block w-full">{dayjs(value).fromNow()}</span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    { title: "状态", dataIndex: "status" },
    {
      title: "操作",
      dataIndex: "op",
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button size="small" onClick={() => onEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除这条商品吗？"
            onOk={() => onDelete(record.id)}
          >
            <Button size="small" status="danger" type="primary">
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleChange: OnChange = (_, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = (s && "field" in s ? s.field : undefined) as
      | keyof Product
      | undefined;
    const dir = (s && "direction" in s ? s.direction : undefined) as
      | "ascend"
      | "descend"
      | undefined;

    // 只有当 field+dir 同时存在时才设置排序
    if ((field === "price" || field === "stock") && dir) {
      const nextDir = dir === "ascend" ? "asc" : "desc";
      if (sortBy !== field || sortDir !== nextDir) {
        onSort(field, dir);
      }
    } else if (sortBy) {
      // 第三次点击清空排序
      onSort(undefined, undefined);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Table
        className="flex-1"
        rowKey="id"
        loading={loading}
        columns={columns}
        data={data}
        pagination={false}
        onChange={handleChange}
        noDataElement={err ? "加载失败，请稍后再试" : "暂无数据"}
      />

      <div className="flex w-full items-center justify-center">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showTotal={false}
          sizeCanChange={false}
          onChange={onPage}
          onPageSizeChange={() => {
            // 分页大小不可变更，留空
          }}
        />
      </div>
    </div>
  );
}
