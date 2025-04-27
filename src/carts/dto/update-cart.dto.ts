import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartDto extends PartialType(CreateCartDto) {}

export enum CartQuantityOptions {
    INC = 'inc',
    DEC = 'dec'
}

export class UpdateCartQuantityOptionsDto {

    @IsNotEmpty()
    @IsEnum(CartQuantityOptions)
    option: CartQuantityOptions;
}

export class UpdateCartParamsDto {
    // @IsNotEmpty()
    // @IsString()
    // userId: string;

    // @IsNotEmpty()
    // @IsString()
    // productId: string;

    @IsNotEmpty()
    @IsEnum(CartQuantityOptions)
    @ApiProperty({ enum: CartQuantityOptions })
    option: CartQuantityOptions;
}
