export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}

export interface SkuCategory {
  id: number;
  name: string;
  createdAt: string;
}

export interface Sku {
  id: number;
  name: string;
  spec: string;
  barcode: string;
  categoryId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  category?: SkuCategory;
}

export interface CreateSkuRequest {
  name: string;
  spec: string;
  barcode: string;
  categoryId: number;
  status?: string;
}

export interface UpdateSkuRequest {
  name?: string;
  spec?: string;
  barcode?: string;
  categoryId?: number;
  status?: string;
}

export interface BarcodeCheckResponse {
  available: boolean;
}
