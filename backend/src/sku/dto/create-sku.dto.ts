import { IsNotEmpty, IsString, IsInt, IsOptional } from "class-validator";

export class CreateSkuDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  spec!: string;

  @IsNotEmpty()
  @IsString()
  barcode!: string;

  @IsNotEmpty()
  @IsInt()
  categoryId!: number;

  @IsOptional()
  @IsString()
  status?: string;
}
