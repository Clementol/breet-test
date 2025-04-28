import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schemas';
import * as productsData from '../../mockData/products.json'
import { InjectModel } from '@nestjs/mongoose';
import { ProductResponseDto } from './dto/response.product.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationQueryParamsDto } from 'src/shared/src';


@Injectable()
export class ProductsService {

    private readonly logger = new Logger(ProductsService.name);
    private readonly PRODUCTS_CACHE_TTL  = 1_800_000;
    constructor(
      @InjectModel(Product.name) private readonly productModel: Model<Product>,
      @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

  async create(createProductDto?: CreateProductDto) {
    
    try {
      this.logger.log('products data setup')
      const productsCount = await this.productModel.countDocuments({});
      // const productsCount = await this.productModel.deleteMany({});
      if (productsCount < 1) {
        const editedProd = productsData.map((product) => ({ ...product, price: +product.price * 100, availableStocks: +product.availableStocks }))
        const _ = await this.productModel.insertMany(editedProd);
        // this.logger.log('products added to database collection')
      }
  
    } catch (error) {
      // this.logger.log('error inserting products to database collection' + error)
      return Promise.reject(error)
    }
  }

  async findAll({ page = 1, limit = 10}: PaginationQueryParamsDto) {
    try {
      const skip = (page - 1) * limit;
      const PRODUCTS_CACHE_KEY = `products_page_${page}_limit${limit}`;
      const cachedProducts = await this.cacheManager.get(PRODUCTS_CACHE_KEY);
      if (cachedProducts) return cachedProducts;
      const products = await this.productModel.find({}).skip(skip).limit(limit).lean();
      const productDtos = products.map(product => new ProductResponseDto(product))
      this.cacheManager.set(PRODUCTS_CACHE_KEY, productDtos, this.PRODUCTS_CACHE_TTL)
      return productDtos
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOne(id: string) {
    try {
      const productExist = await this.productModel.findOne({ _id: id }).lean<Product>();
      if (!productExist) return Promise.reject(new BadRequestException('product not found'));
      return new ProductResponseDto(productExist)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
