<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  fetchSkus,
  fetchCategories,
  createSku,
  updateSku,
  checkBarcode,
  createCategory,
  deleteCategory,
} from "../api/client";
import type { Sku, SkuCategory } from "../types";

const skus = ref<Sku[]>([]);
const categories = ref<SkuCategory[]>([]);
const loading = ref(false);
const selectedCategory = ref<number | null>(null);

const skuDialogVisible = ref(false);
const categoryDialogVisible = ref(false);
const isEditMode = ref(false);
const editingSkuId = ref<number | null>(null);

const skuFormRef = ref<FormInstance>();
const skuForm = reactive({
  name: "",
  spec: "",
  barcode: "",
  categoryId: null as number | null,
  status: "active",
});

const categoryFormRef = ref<FormInstance>();
const categoryForm = reactive({
  name: "",
});

const skuFormRules: FormRules = {
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  spec: [{ required: true, message: "请输入规格", trigger: "blur" }],
  barcode: [
    { required: true, message: "请输入条码", trigger: "blur" },
    {
      validator: async (_rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入条码"));
          return;
        }
        try {
          const result = await checkBarcode(value, editingSkuId.value || undefined);
          if (!result.available) {
            callback(new Error("条码已存在，请更换"));
          } else {
            callback();
          }
        } catch {
          callback(new Error("条码校验失败，请重试"));
        }
      },
      trigger: "blur",
    },
  ],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
};

const categoryFormRules: FormRules = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    {
      validator: (_rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error("请输入分类名称"));
          return;
        }
        const exists = categories.value.some((c) => c.name === value.trim());
        if (exists) {
          callback(new Error("分类名称已存在"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const filteredSkus = computed(() => {
  if (!selectedCategory.value) return skus.value;
  return skus.value.filter((s) => s.categoryId === selectedCategory.value);
});

const categoryOptions = computed(() => {
  return categories.value.map((c) => ({ label: c.name, value: c.id }));
});

async function loadData() {
  loading.value = true;
  try {
    const [skuData, categoryData] = await Promise.all([
      fetchSkus(),
      fetchCategories(),
    ]);
    skus.value = skuData;
    categories.value = categoryData;
  } catch (e) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
}

function openAddSku() {
  isEditMode.value = false;
  editingSkuId.value = null;
  skuForm.name = "";
  skuForm.spec = "";
  skuForm.barcode = "";
  skuForm.categoryId = categories.value.length > 0 ? categories.value[0].id : null;
  skuForm.status = "active";
  skuDialogVisible.value = true;
}

function openEditSku(sku: Sku) {
  isEditMode.value = true;
  editingSkuId.value = sku.id;
  skuForm.name = sku.name;
  skuForm.spec = sku.spec;
  skuForm.barcode = sku.barcode;
  skuForm.categoryId = sku.categoryId;
  skuForm.status = sku.status;
  skuDialogVisible.value = true;
}

async function handleSkuSubmit() {
  if (!skuFormRef.value) return;
  await skuFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEditMode.value && editingSkuId.value) {
          await updateSku(editingSkuId.value, {
            name: skuForm.name,
            spec: skuForm.spec,
            barcode: skuForm.barcode,
            categoryId: skuForm.categoryId!,
            status: skuForm.status,
          });
          ElMessage.success("更新成功");
        } else {
          await createSku({
            name: skuForm.name,
            spec: skuForm.spec,
            barcode: skuForm.barcode,
            categoryId: skuForm.categoryId!,
            status: skuForm.status,
          });
          ElMessage.success("创建成功");
        }
        skuDialogVisible.value = false;
        await loadData();
      } catch (e: any) {
        ElMessage.error(e.message || "操作失败");
      }
    }
  });
}

function openAddCategory() {
  categoryForm.name = "";
  categoryDialogVisible.value = true;
}

async function handleCategorySubmit() {
  if (!categoryFormRef.value) return;
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createCategory(categoryForm.name.trim());
        ElMessage.success("分类创建成功");
        categoryDialogVisible.value = false;
        await loadData();
      } catch (e: any) {
        ElMessage.error(e.message || "操作失败");
      }
    }
  });
}

async function handleDeleteCategory(category: SkuCategory) {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？\n注意：分类下有SKU时无法删除。`,
      "删除确认",
      { type: "warning" },
    );
    await deleteCategory(category.id);
    ElMessage.success("删除成功");
    if (selectedCategory.value === category.id) {
      selectedCategory.value = null;
    }
    await loadData();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e.message || "删除失败");
    }
  }
}

async function toggleSkuStatus(sku: Sku) {
  const newStatus = sku.status === "active" ? "inactive" : "active";
  const actionText = newStatus === "active" ? "启用" : "停用";
  try {
    await updateSku(sku.id, { status: newStatus });
    ElMessage.success(`${actionText}成功`);
    await loadData();
  } catch (e: any) {
    ElMessage.error(e.message || "操作失败");
  }
}

function getStatusLabel(status: string) {
  return status === "active" ? "启用" : "停用";
}

function getRowClassName({ row }: { row: Sku }) {
  return row.status === "inactive" ? "row-inactive" : "";
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="sku-master">
    <div class="page-header">
      <div>
        <h2 class="page-title">SKU主数据管理</h2>
        <p class="page-subtitle">统一维护商品基础信息，支持分类管理与条码校验</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openAddCategory">
          新增分类
        </el-button>
        <el-button type="primary" :plain="false" @click="openAddSku">
          新增SKU
        </el-button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-section">
        <span class="filter-label">分类筛选：</span>
        <el-radio-group v-model="selectedCategory" size="default">
          <el-radio-button :value="null">全部</el-radio-button>
          <el-radio-button
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="category-manage">
        <span class="category-count">共 {{ categories.length }} 个分类</span>
      </div>
    </div>

    <div class="category-list">
      <el-card v-for="cat in categories" :key="cat.id" class="category-card" shadow="hover">
        <div class="category-card-header">
          <span class="category-name">{{ cat.name }}</span>
          <el-button
            type="danger"
            size="small"
            text
            @click="handleDeleteCategory(cat)"
          >
            删除
          </el-button>
        </div>
        <div class="category-count-info">
          {{ skus.filter((s) => s.categoryId === cat.id).length }} 个SKU
        </div>
      </el-card>
    </div>

    <div class="work-panel">
      <div class="panel-header">
        <h3>SKU列表</h3>
        <span class="sku-count">共 {{ filteredSkus.length }} 条记录</span>
      </div>

      <el-table
        :data="filteredSkus"
        v-loading="loading"
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" min-width="160">
          <template #default="{ row }">
            <span :class="{ 'text-inactive': row.status === 'inactive' }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" min-width="140">
          <template #default="{ row }">
            <span :class="{ 'text-inactive': row.status === 'inactive' }">
              {{ row.spec }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="barcode" label="条码" min-width="160">
          <template #default="{ row }">
            <el-tag type="info" size="small" :class="{ 'tag-inactive': row.status === 'inactive' }">
              {{ row.barcode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <span :class="{ 'text-inactive': row.status === 'inactive' }">
              {{ row.category?.name || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="openEditSku(row)">
              编辑
            </el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              text
              @click="toggleSkuStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="skuDialogVisible"
      :title="isEditMode ? '编辑SKU' : '新增SKU'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="skuFormRef"
        :model="skuForm"
        :rules="skuFormRules"
        label-width="80px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="skuForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="规格" prop="spec">
          <el-input v-model="skuForm.spec" placeholder="如：75g 原味" />
        </el-form-item>
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="skuForm.barcode" placeholder="请输入条码，系统自动校验重复" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="skuForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="opt in categoryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="skuForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSkuSubmit">
          {{ isEditMode ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="categoryDialogVisible"
      title="新增分类"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryFormRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCategorySubmit">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.sku-master {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  padding: clamp(24px, 5vw, 56px) 0 64px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-title {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: color-mix(in srgb, #1f2417 62%, #7d8f2d 38%);
  margin: 0;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: color-mix(in srgb, #f6f5ee 86%, white 14%);
  border: 1px solid color-mix(in srgb, #1f2417 12%, transparent);
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: #1f2417;
}

.category-manage {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-count {
  font-size: 13px;
  color: color-mix(in srgb, #1f2417 60%, transparent);
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.category-card {
  border: 1px solid color-mix(in srgb, #1f2417 12%, transparent) !important;
  background: color-mix(in srgb, #f6f5ee 86%, white 14%) !important;
}

.category-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-name {
  font-weight: 700;
  font-size: 16px;
}

.category-count-info {
  font-size: 13px;
  color: color-mix(in srgb, #1f2417 55%, #7d8f2d 45%);
}

.work-panel {
  border: 1px solid color-mix(in srgb, #1f2417 13%, transparent);
  background: color-mix(in srgb, #f6f5ee 86%, white 14%);
  box-shadow: 0 18px 50px color-mix(in srgb, #1f2417 10%, transparent);
  border-radius: 8px;
  padding: clamp(22px, 4vw, 32px);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.sku-count {
  font-size: 14px;
  color: color-mix(in srgb, #1f2417 55%, transparent);
}

:deep(.row-inactive) {
  background: color-mix(in srgb, #909399 8%, transparent) !important;
}

:deep(.row-inactive:hover > td) {
  background: color-mix(in srgb, #909399 12%, transparent) !important;
}

.text-inactive {
  color: #909399 !important;
}

.tag-inactive {
  opacity: 0.6;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }
}
</style>
