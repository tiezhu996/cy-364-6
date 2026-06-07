import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaClient, SkuCategory } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";

const prisma = new PrismaClient();

@Injectable()
export class SkuCategoryService {
  async findAll(): Promise<SkuCategory[]> {
    return prisma.skuCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<SkuCategory> {
    const existing = await prisma.skuCategory.findUnique({
      where: { name: createCategoryDto.name },
    });
    if (existing) {
      throw new ConflictException("分类名称已存在");
    }
    return prisma.skuCategory.create({
      data: { name: createCategoryDto.name },
    });
  }

  async delete(id: number): Promise<void> {
    const category = await prisma.skuCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("分类不存在");
    }
    const skuCount = await prisma.sku.count({ where: { categoryId: id } });
    if (skuCount > 0) {
      throw new ConflictException("该分类下还有SKU，无法删除");
    }
    await prisma.skuCategory.delete({ where: { id } });
  }
}
