<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { routes } from "./routes";
import FeatureStrip from "./components/FeatureStrip.vue";
import MetricGrid from "./components/MetricGrid.vue";
import OperationsTable from "./components/OperationsTable.vue";
import SkuMaster from "./components/SkuMaster.vue";

const currentPath = ref(window.location.hash.slice(1) || "/");
const overview = ref<OverviewResponse>(createFallbackOverview());
const notice = ref(REQUEST_MESSAGES.overviewFallback);

const activeRoute = computed(() => {
  return routes.find((r) => r.path === currentPath.value) || routes[0];
});

const showOverview = computed(() => currentPath.value === "/" || !routes.find((r) => r.path === currentPath.value));
const showSkuMaster = computed(() => currentPath.value === "/sku-master");

function navigate(path: string) {
  currentPath.value = path;
  window.location.hash = path;
}

function goHealth() {
  window.location.href = REQUEST_MESSAGES.healthPath;
}

async function loadOverview() {
  try {
    overview.value = await fetchOverview();
    notice.value = "后端服务已联通，当前展示实时接口数据。";
  } catch {
    notice.value = REQUEST_MESSAGES.overviewFallback;
  }
}

onMounted(() => {
  window.addEventListener("hashchange", () => {
    currentPath.value = window.location.hash.slice(1) || "/";
  });
  loadOverview();
});
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <span class="brand-code">{{ APP_CODE }}</span>
        <h1 class="brand-title">{{ APP_NAME }}</h1>
      </div>
      <el-button type="primary" @click="goHealth">API Health</el-button>
    </header>

    <nav class="nav-tabs">
      <div class="nav-container">
        <button
          v-for="route in routes"
          :key="route.path"
          class="nav-tab"
          :class="{ active: currentPath === route.path }"
          @click="navigate(route.path)"
        >
          {{ route.label }}
        </button>
      </div>
    </nav>

    <template v-if="showOverview">
      <section class="workspace">
        <div class="lead-grid">
          <article class="hero-panel">
            <span class="pill">{{ notice }}</span>
            <h2>{{ overview.appName }}</h2>
            <p>{{ overview.description }}</p>
          </article>
          <MetricGrid :items="overview.kpis" />
        </div>
        <FeatureStrip :items="overview.features" />
        <section class="work-panel">
          <h2>运营任务流</h2>
          <OperationsTable :records="overview.records" />
        </section>
      </section>
    </template>

    <template v-else-if="showSkuMaster">
      <SkuMaster />
    </template>

    <template v-else>
      <section class="workspace">
        <article class="hero-panel">
          <h2>{{ activeRoute.label }}</h2>
          <p>该模块正在建设中...</p>
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.nav-tabs {
  background: color-mix(in srgb, #f6f5ee 86%, white 14%);
  border-bottom: 1px solid color-mix(in srgb, #1f2417 12%, transparent);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  width: min(1180px, calc(100vw - 32px));
  margin: 0 auto;
  display: flex;
  gap: 4px;
  padding: 0 16px;
}

.nav-tab {
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: color-mix(in srgb, #1f2417 65%, transparent);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-tab:hover {
  color: #1f2417;
  background: color-mix(in srgb, #7d8f2d 8%, transparent);
}

.nav-tab.active {
  color: #7d8f2d;
  border-bottom-color: #7d8f2d;
  background: color-mix(in srgb, #7d8f2d 10%, transparent);
}
</style>
