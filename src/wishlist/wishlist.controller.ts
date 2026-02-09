import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/wishlist.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist' })
  async getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add to wishlist' })
  async add(@CurrentUser() user: any, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.add(user.sub, dto);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove from wishlist' })
  async remove(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(user.sub, productId);
  }
}
