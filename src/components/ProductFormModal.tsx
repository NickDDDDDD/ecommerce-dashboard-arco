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
    status?: Status;
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
  const [form] = Form.useForm();

  // 打开/切换记录时：reset → set
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue({
      name: initial?.name ?? "",
      price: initial?.price ?? "",
      stock: initial?.stock ?? "",
      ...(mode === "edit"
        ? { status: (initial?.status as Status) ?? "draft" }
        : {}),
    });
  }, [open, initial, mode, form]);

  const handleOk = async () => {
    const values = await form.validate();
    if (mode === "create") {
      await onSubmit({
        name: values.name.trim() as string,
        price: Number(values.price),
        stock: Number(values.stock),
      });
    } else {
      await onSubmit({
        name: values.name.trim() as string,
        price: Number(values.price),
        stock: Number(values.stock),
        status: values.status as Status,
      });
    }
  };

  return (
    <Modal
      visible={open}
      title={mode === "create" ? "新增商品" : "编辑商品"}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      unmountOnExit
    >
      <Form form={form} layout="horizontal">
        <Form.Item
          label="商品名"
          field="name"
          rules={[
            { required: true, message: "请输入商品名" },
            {
              validator(value, cb) {
                if (!value || String(value).trim() === "") {
                  return cb("用户名不能为空或全为空格");
                }

                return cb();
              },
            },
          ]}
          className="m-0 flex items-center justify-center"
        >
          <Input placeholder="请输入商品名" />
        </Form.Item>
        <Form.Item
          label="价格"
          field="price"
          rules={[
            { required: true, message: "请输入价格" },
            {
              validator(value, cb) {
                if (value <= 0) {
                  return cb("价格必须大于 0");
                }
                if (!Number.isInteger(value)) {
                  const str = String(value);
                  const decimal = str.split(".")[1];
                  if (decimal && decimal.length > 2) {
                    return cb("价格最多保留两位小数");
                  }
                }
                return cb();
              },
            },
          ]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          label="库存"
          field="stock"
          rules={[
            { required: true, message: "请输入库存" },
            {
              validator(value, cb) {
                if (value < 0) {
                  return cb("库存不能小于 0");
                } else if (!Number.isInteger(value)) {
                  return cb("库存必须为整数");
                }
                return cb();
              },
            },
          ]}
        >
          <InputNumber min={0} />
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
