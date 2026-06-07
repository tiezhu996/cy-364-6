import { Controller, Get, Post, Put, Param, Body, Query, ValidationPipe, UsePipes } from "@nestjs/common";
import { SkuService } from "./sku.service";
import { CreateSkuDto } from "./dto/create-sku.dto";
import { UpdateSkuDto } from "./dto/update-sku.dto";

@Controller()
export class SkuController {
  constructor(private readonly skuService: SkuService) {}

  @Get("api/skus")
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query("categoryId") categoryId?: string) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.skuService.findAll(catId);
  }

  @Get("api/skus/:id")
  async findOne(@Param("id") id: string) {
    return this.skuService.findOne(parseInt(id, 10));
  }

  @Post("api/skus")
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createSkuDto: CreateSkuDto) {
    return this.skuService.create(createSkuDto);
  }

  @Put("api/skus/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param("id") id: string, @Body() updateSkuDto: UpdateSkuDto) {
    return this.skuService.update(parseInt(id, 10), updateSkuDto);
  }

  @Get("api/skus/check-barcode/:barcode")
  async checkBarcode(
    @Param("barcode") barcode: string,
    @Query("excludeId") excludeId?: string,
  ) {
    const exId = excludeId ? parseInt(excludeId, 10) : undefined;
    return this.skuService.checkBarcode(barcode, exId);
  }
}
