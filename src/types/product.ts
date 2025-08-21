export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: "draft" | "active" | "archived";
  publishedAt: string | null;
}
