import { Module } from "@nestjs/common";
import { OverviewController } from "./overview/overview.controller";
import { OverviewService } from "./overview/overview.service";
import { SkuController } from "./sku/sku.controller";
import { SkuService } from "./sku/sku.service";
import { SkuCategoryController } from "./sku-category/sku-category.controller";
import { SkuCategoryService } from "./sku-category/sku-category.service";
import { AppLogger } from "./common/app.logger";

@Module({
  controllers: [OverviewController, SkuController, SkuCategoryController],
  providers: [OverviewService, SkuService, SkuCategoryService, AppLogger],
})
export class AppModule {}
