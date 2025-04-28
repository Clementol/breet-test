import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors,  } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto, UpdateCartParamsDto } from './dto/update-cart.dto';
import { ApiOperation } from '@nestjs/swagger';


@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // @Post()
  // create(@Body() createCartDto: CreateCartDto) {
  //   return this.cartsService.create(createCartDto);
  // }

  @Get()
  findAll() {
    return this.cartsService.findAll();
  }

  @Post(':userId/products/:productId/quantity')
  @ApiOperation({ summary: 'add or remove from cart' })
  updateCartQty(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() { option }: UpdateCartParamsDto
  ) {
    return this.cartsService.updateCartQty(userId, { productId, option });
  }

  @Post(':userId/checkout')
  processCheckOut(
    @Param('userId') userId: string,
  ) {
    return this.cartsService.processCheckOut(userId);
  }

  @Post('bulk-checkout')
  processBulkCheckOut(
  ) {
    return this.cartsService.processBulkCheckOut();
  }

  @Get(':userId')
  findByUserId(@Param('userId') userId: string) {
    return this.cartsService.findByUserId(userId);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.cartsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
  //   return this.cartsService.update(+id, updateCartDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cartsService.remove(+id);
  // }
}
