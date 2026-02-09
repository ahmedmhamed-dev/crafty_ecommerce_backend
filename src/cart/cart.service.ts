import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { 
        product: { include: { images: true } },
        inventory: true,
      },
    });
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    // Check for existing cart item with same product and inventory
    const existing = await this.prisma.cartItem.findFirst({
      where: { 
        userId,
        productId: dto.productId,
        inventoryId: dto.inventoryId || null,
      },
    });
    
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (dto.quantity || 1) },
      });
    }
    return this.prisma.cartItem.create({
      data: { 
        userId, 
        productId: dto.productId, 
        inventoryId: dto.inventoryId,
        quantity: dto.quantity || 1 
      },
    });
  }

  async updateQuantity(userId: string, productId: string, dto: UpdateCartDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: { 
        userId,
        productId,
        inventoryId: dto.inventoryId || null,
      },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });
  }

  async removeFromCart(userId: string, productId: string, inventoryId?: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { 
        userId,
        productId,
        inventoryId: inventoryId || null,
      },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    return this.prisma.cartItem.delete({ where: { id: item.id } });
  }

  async clearCart(userId: string) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
