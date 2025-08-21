// src/components/ProductFormModal.tsx
import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
} from "@arco-design/web-react";
import type { Product } from "../types/product";
type Status = Product["status"]; // "draft" | "active" | "archived"

type Mode = "create" | "edit";
const STATUS_OPTIONS: { label: string; value: Status }[] = [
  { label: "草稿", value: "draft" },
  { label: "上架", value: "active" },
  { label: "归档", value: "archived" },
];

export interface ProductFormModalProps {
  open: boolean;
  mode: Mode;
  initial?: Partial<Product>;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    price: number;
    stock: number;
    status?: Status; // ✅ 用字面量联合
  }) => Promise<void> | void;
}

export default function ProductFormModal({
  open,
  mode,
  initial,
  confirmLoading,
  onCancel,
  onSubmit,
}: ProductFormModalProps) {
  const [form] = Form.useForm(); // ✅ 受控实例

  // 打开/切换记录时：reset → set
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      name: initial?.name ?? "",
      price: initial?.price ?? 0,
      stock: initial?.stock ?? 0,
      ...(mode === "edit"
        ? { status: (initial?.status as Status) ?? "draft" }
        : {}),
    });
  }, [open, initial, mode, form]);

  const handleOk = async () => {
    const values = await form.validate();
    if (mode === "create") {
      await onSubmit({
        name: values.name as string,
        price: Number(values.price),
        stock: Number(values.stock),
      });
    } else {
      await onSubmit({
        name: values.name as string,
        price: Number(values.price),
        stock: Number(values.stock),
        status: values.status as Status,
      });
    }
  };

  return (
    <Modal
      visible={open} // ✅ 用 visible
      title={mode === "create" ? "新增商品" : "编辑商品"}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      unmountOnExit // 关闭卸载，避免脏状态
      // 可选：强制按记录重建 Modal
      // key={mode === 'edit' ? initial?.id : 'create'}
    >
      <Form form={form}>
        <Form.Item
          label="商品名"
          field="name"
          rules={[{ required: true, message: "请输入商品名" }]}
        >
          <Input placeholder="请输入商品名" />
        </Form.Item>
        <Form.Item
          label="价格"
          field="price"
          rules={[{ required: true, message: "请输入价格" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="库存"
          field="stock"
          rules={[{ required: true, message: "请输入库存" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        {mode === "edit" && (
          <Form.Item
            label="状态"
            field="status"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
