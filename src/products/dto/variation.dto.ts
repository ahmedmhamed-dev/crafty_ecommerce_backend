import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// Create Variation DTO
export class CreateVariationDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // e.g., "Color", "Size"

  @IsArray()
  @IsString({ each: true })
  options!: string[]; // e.g., ["Red", "Blue", "Green"]
}

export class CreateInventoryItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStock?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  options!: string[]; // e.g., ["Red", "L"]
}

export class CreateProductWithVariationsDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStock?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsString()
  @IsOptional()
  dimensions?: string;

  @IsString()
  categoryId!: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  hasVariations!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariationDto)
  @IsOptional()
  variations?: CreateVariationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryItemDto)
  @IsOptional()
  inventory?: CreateInventoryItemDto[];
}

// Update Variation DTO
export class UpdateVariationDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class UpdateInventoryItemDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStock?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

// Response DTOs
export class VariationResponseDto {
  id!: string;
  name!: string;
  options!: string[];
}

export class InventoryItemResponseDto {
  id!: string;
  sku!: string;
  price!: number;
  comparePrice!: number | null;
  quantity!: number;
  lowStock!: number;
  weight!: number | null;
  imageUrl!: string | null;
  isActive!: boolean;
  options!: string[];
}

export class ProductWithVariationsResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  price!: number;
  comparePrice!: number | null;
  sku!: string | null;
  hasVariations!: boolean;
  totalQuantity!: number;
  variations!: VariationResponseDto[];
  inventory!: InventoryItemResponseDto[];
  images!: { id: string; url: string; isPrimary: boolean }[];
}
