import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaClient, Sku } from "@prisma/client";
import { CreateSkuDto } from "./dto/create-sku.dto";
import { UpdateSkuDto } from "./dto/update-sku.dto";

const prisma = new PrismaClient();

@Injectable()
export class SkuService {
  async findAll(categoryId?: number): Promise<Sku[]> {
    const where = categoryId ? { categoryId } : {};
    return prisma.sku.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number): Promise<Sku | null> {
    const sku = await prisma.sku.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!sku) {
      throw new NotFoundException("SKU不存在");
    }
    return sku;
  }

  async create(createSkuDto: CreateSkuDto): Promise<Sku> {
    const existing = await prisma.sku.findUnique({
      where: { barcode: createSkuDto.barcode },
    });
    if (existing) {
      throw new ConflictException("条码已存在，不允许重复");
    }

    const category = await prisma.skuCategory.findUnique({
      where: { id: createSkuDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException("分类不存在");
    }

    return prisma.sku.create({
      data: {
        name: createSkuDto.name,
        spec: createSkuDto.spec,
        barcode: createSkuDto.barcode,
        categoryId: createSkuDto.categoryId,
        status: createSkuDto.status || "active",
      },
      include: { category: true },
    });
  }

  async update(id: number, updateSkuDto: UpdateSkuDto): Promise<Sku> {
    const sku = await prisma.sku.findUnique({ where: { id } });
    if (!sku) {
      throw new NotFoundException("SKU不存在");
    }

    if (updateSkuDto.barcode && updateSkuDto.barcode !== sku.barcode) {
      const existing = await prisma.sku.findUnique({
        where: { barcode: updateSkuDto.barcode },
      });
      if (existing) {
        throw new ConflictException("条码已存在，不允许重复");
      }
    }

    if (updateSkuDto.categoryId) {
      const category = await prisma.skuCategory.findUnique({
        where: { id: updateSkuDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException("分类不存在");
      }
    }

    return prisma.sku.update({
      where: { id },
      data: updateSkuDto,
      include: { category: true },
    });
  }

  async checkBarcode(barcode: string, excludeId?: number): Promise<{ available: boolean }> {
    const where: any = { barcode };
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    const existing = await prisma.sku.findFirst({ where });
    return { available: !existing };
  }
}
