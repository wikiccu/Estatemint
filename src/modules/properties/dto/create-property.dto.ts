import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Light-filled city apartment' })
  @IsString()
  @MinLength(5)
  @MaxLength(140)
  title!: string;

  @ApiProperty({ example: 'A thoughtfully renovated home close to transit.' })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 425000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price!: number;

  @ApiPropertyOptional({ enum: Currency, default: Currency.USD })
  @IsOptional()
  @IsEnum(Currency)
  currency: Currency = Currency.USD;

  @ApiProperty({ example: 'Austin' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

  @ApiProperty({ example: '1200 Market Street' })
  @IsString()
  @MinLength(5)
  @MaxLength(240)
  address!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ example: 1180 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  area!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  bedrooms!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  bathrooms!: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  parkingSpaces: number = 0;

  @ApiPropertyOptional({ example: 2019 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear() + 2)
  yearBuilt?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  imageUrls?: string[];
}
