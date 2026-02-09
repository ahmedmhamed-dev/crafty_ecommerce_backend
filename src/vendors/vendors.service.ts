import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) throw new NotFoundException('Vendor already exists');
    const slug = dto.storeSlug || dto.storeName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    return this.prisma.vendor.create({
      data: { ...dto, storeSlug: slug, userId },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.vendor.findUnique({ where: { userId } });
  }

  async update(userId: string, dto: UpdateVendorDto) {
    const vendor = await this.findByUser(userId);
    return this.prisma.vendor.update({ where: { id: vendor!.id }, data: dto });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({ skip, take: limit, include: { user: { select: { email: true, firstName: true } } } }),
      this.prisma.vendor.count(),
    ]);
    return { data: vendors, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.vendor.update({ where: { id }, data: { status: status as any } });
  }
}
