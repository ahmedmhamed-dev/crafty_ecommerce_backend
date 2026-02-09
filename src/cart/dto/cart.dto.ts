import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class UpdateCartDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryId?: string;
}
