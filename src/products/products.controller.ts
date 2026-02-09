import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductImageDto } from './dto/product.dto';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(page || 1, limit || 10, search, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('VENDOR')
  @ApiOperation({ summary: 'Create product (Vendor only)' })
  async create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.sub, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('VENDOR')
  @ApiOperation({ summary: 'Update product (Vendor only)' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, user.sub, dto);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('VENDOR')
  @ApiOperation({ summary: 'Add product images' })
  async addImages(@Param('id') id: string, @CurrentUser() user: any, @Body() images: ProductImageDto[]) {
    return this.productsService.addImages(id, user.sub, images);
  }

  @Get('vendor/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('VENDOR')
  @ApiOperation({ summary: 'Get vendor products' })
  async vendorProducts(@CurrentUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.productsService.vendorProducts(user.sub, page || 1, limit || 10);
  }

  @Put(':id/status')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product status (Admin only)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.productsService.updateStatus(id, status);
  }
}
