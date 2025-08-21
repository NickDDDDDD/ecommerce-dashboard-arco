import { type Product } from "./product";

export interface ProductsResp {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
