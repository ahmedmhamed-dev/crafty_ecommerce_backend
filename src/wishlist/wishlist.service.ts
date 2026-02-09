import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AddToWishlistDto } from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
    });
  }

  async add(userId: string, dto: AddToWishlistDto) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });
    if (existing) throw new ConflictException('Already in wishlist');
    return this.prisma.wishlist.create({
      data: { userId, productId: dto.productId },
    });
  }

  async remove(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!item) throw new NotFoundException('Not in wishlist');
    return this.prisma.wishlist.delete({ where: { id: item.id } });
  }
}
