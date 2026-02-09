import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart items' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user.sub, dto);
  }

  @Put(':productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateQuantity(@CurrentUser() user: any, @Param('productId') productId: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateQuantity(user.sub, productId, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(user.sub, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.sub);
  }
}
