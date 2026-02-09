import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
    // Add productCount to each category
    return categories.map(cat => ({
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    }));
  }

  async findById(id: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
    if (!cat) throw new NotFoundException('Category not found');
    return {
      ...cat,
      productCount: cat._count.products,
      _count: undefined,
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
