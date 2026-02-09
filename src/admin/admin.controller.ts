import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('pending-vendors')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending vendors' })
  async getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Get('pending-products')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending products' })
  async getPendingProducts() {
    return this.adminService.getPendingProducts();
  }
}
