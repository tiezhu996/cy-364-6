import { API_BASE_URL } from "../constants/app";
import type {
  OverviewResponse,
  Sku,
  SkuCategory,
  CreateSkuRequest,
  UpdateSkuRequest,
  BarcodeCheckResponse,
} from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchSkus(categoryId?: number): Promise<Sku[]> {
  const url = categoryId
    ? `${API_BASE_URL}/skus?categoryId=${categoryId}`
    : `${API_BASE_URL}/skus`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`SKU list request failed: ${response.status}`);
  }

  return response.json() as Promise<Sku[]>;
}

export async function fetchSku(id: number): Promise<Sku> {
  const response = await fetch(`${API_BASE_URL}/skus/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`SKU detail request failed: ${response.status}`);
  }

  return response.json() as Promise<Sku>;
}

export async function createSku(data: CreateSkuRequest): Promise<Sku> {
  const response = await fetch(`${API_BASE_URL}/skus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `SKU create failed: ${response.status}`);
  }

  return response.json() as Promise<Sku>;
}

export async function updateSku(id: number, data: UpdateSkuRequest): Promise<Sku> {
  const response = await fetch(`${API_BASE_URL}/skus/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `SKU update failed: ${response.status}`);
  }

  return response.json() as Promise<Sku>;
}

export async function checkBarcode(barcode: string, excludeId?: number): Promise<BarcodeCheckResponse> {
  const url = excludeId
    ? `${API_BASE_URL}/skus/check-barcode/${encodeURIComponent(barcode)}?excludeId=${excludeId}`
    : `${API_BASE_URL}/skus/check-barcode/${encodeURIComponent(barcode)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Barcode check failed: ${response.status}`);
  }

  return response.json() as Promise<BarcodeCheckResponse>;
}

export async function fetchCategories(): Promise<SkuCategory[]> {
  const response = await fetch(`${API_BASE_URL}/sku-categories`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }

  return response.json() as Promise<SkuCategory[]>;
}

export async function createCategory(name: string): Promise<SkuCategory> {
  const response = await fetch(`${API_BASE_URL}/sku-categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Category create failed: ${response.status}`);
  }

  return response.json() as Promise<SkuCategory>;
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/sku-categories/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Category delete failed: ${response.status}`);
  }
}
