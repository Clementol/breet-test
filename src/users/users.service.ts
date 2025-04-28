import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as usersData from '../../mockData/users.json'
import { UserResponseDto } from './dto/user-response.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationQueryParamsDto } from 'src/shared/src';

@Injectable()
export class UsersService {
  // private readonly logger = new Logger(UsersService.name)f;
  private readonly USERS_CACHE_TTL  = 1_800_000;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async create(createUserDto?: CreateUserDto) {
    try {
      const userCount = await this.userModel.countDocuments({});
      if (userCount < 1) {
        const _ = await this.userModel.insertMany(usersData);
        // this.logger.log('users added to database')
      }
    } catch (error) {
      // this.logger.log('error inserting users to database collection' + error)
      return Promise.reject(error)
    }
  }

  async findAll({ page = 1, limit = 10}: PaginationQueryParamsDto) {
    try {
      const skip = (page - 1) * limit;
      const USERS_CACHE_KEY = `users_page_${page}_limit${limit}`;
      const cachedUsers = await this.cacheManager.get(USERS_CACHE_KEY);
      if (cachedUsers) return cachedUsers;
      const users = await this.userModel.find({}).skip(skip).limit(limit).lean();
      const usersDtos = users.map(user => new UserResponseDto(user))
      await this.cacheManager.set(USERS_CACHE_KEY, usersDtos, this.USERS_CACHE_TTL);
      return usersDtos;

    } catch (error) {

      return Promise.reject(error)
    }
  }

  async findOne(id: string) {
    try {
      const userExist = await this.userModel.findOne({ _id: id }).lean();
      if (!userExist) return Promise.reject('no user found!')
      return new UserResponseDto(userExist)
    } catch (error) {

      return Promise.reject(error)
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
