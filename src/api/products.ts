import http from "../lib/http";
import { type ProductsResp } from "../types/productsResp";
import type { ProductCreate } from "../types/productCreate";
import type { Product } from "../types/product";
export async function getProducts(params: {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}) {
  const { data } = await http.get<ProductsResp>("/products", { params });
  return data;
}

export async function createProduct(product: ProductCreate) {
  const { data } = await http.post<Product>("/products", product);
  return data;
}

export async function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "name" | "price" | "stock" | "status">>,
) {
  const { data } = await http.put<Product>(`/products/${id}`, patch);
  return data;
}
