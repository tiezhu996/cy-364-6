import { Controller, Get, Post, Delete, Param, Body, ValidationPipe, UsePipes } from "@nestjs/common";
import { SkuCategoryService } from "./sku-category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Controller()
export class SkuCategoryController {
  constructor(private readonly categoryService: SkuCategoryService) {}

  @Get("api/sku-categories")
  async findAll() {
    return this.categoryService.findAll();
  }

  @Post("api/sku-categories")
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Delete("api/sku-categories/:id")
  async delete(@Param("id") id: string) {
    return this.categoryService.delete(parseInt(id, 10));
  }
}
