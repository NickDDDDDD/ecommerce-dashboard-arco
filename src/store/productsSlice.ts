// src/store/productsSlice.ts
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../types/product";
import type { ProductsResp } from "../types/productsResp";
import type { ProductCreate } from "../types/productCreate";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";
import type { SortField } from "../hooks/useProductsQuery";

// 查询参数类型（和你 useProductsQuery 对齐）
export type SortDir = "asc" | "desc";
export type FetchParams = {
  q?: string;
  page: number;
  pageSize: number;
  sortBy?: SortField | "";
  sortDir: SortDir;
};

type ProductsState = {
  items: Product[];
  total: number;
  loading: boolean;
  error: string | null;

  // 记录最近一次查询参数（可用于决定是否需要刷新）
  lastQuery: (Omit<FetchParams, "pageSize"> & { pageSize: number }) | null;
};

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  lastQuery: null,
};

// —— 异步 thunk ——

// 列表查询
export const fetchProducts = createAsyncThunk<ProductsResp, FetchParams>(
  "products/fetch",
  async (params) => {
    const resp = await getProducts({
      q: params.q || undefined,
      page: params.page,
      pageSize: params.pageSize,
      sortBy: params.sortBy || undefined,
      sortDir: params.sortDir,
    });
    return resp;
  },
);

// 新增
export const createProductThunk = createAsyncThunk<void, ProductCreate>(
  "products/create",
  async (payload) => {
    await createProduct(payload);
  },
);

// 编辑
export const updateProductThunk = createAsyncThunk<
  void,
  { id: string; changes: Partial<Product> }
>("products/update", async ({ id, changes }) => {
  await updateProduct(id, changes);
});

// 删除
export const deleteProductThunk = createAsyncThunk<void, string>(
  "products/delete",
  async (id) => {
    await deleteProduct(id);
  },
);

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // 可选：本地乐观更新（这里先不做，保持简单）
  },
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchProducts.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      // 记录这次查询参数（方便之后判断是否需要刷新）
      const arg = action.meta.arg;
      state.lastQuery = { ...arg };
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Fetch failed";
    });

    // create/update/delete：只做动作本身，页面里成功后再触发 fetchProducts 统一刷新
    builder.addCase(createProductThunk.rejected, (state, action) => {
      state.error = action.error.message ?? "Create failed";
    });
    builder.addCase(updateProductThunk.rejected, (state, action) => {
      state.error = action.error.message ?? "Update failed";
    });
    builder.addCase(deleteProductThunk.rejected, (state, action) => {
      state.error = action.error.message ?? "Delete failed";
    });
  },
});

export default productsSlice.reducer;
