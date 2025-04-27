import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { ProductsService } from './products/products.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  async onApplicationBootstrap() {
    await this.cacheManager.clear()
    await Promise.all([
      this.userService.create(),
      this.productService.create(),
    ]);
  }

  async getHello(): Promise<string> {
    await this.cacheManager.set('cached_item', { key: 32 })
    // await this.cacheManager.del('cached_item')
    const cachedItem = await this.cacheManager.get('cached_item');
    console.log({ cachedItem });
    return 'Hello World!';
  }
}
