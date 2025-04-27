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

@Injectable()
export class UsersService {
  // private readonly logger = new Logger(UsersService.name);
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
      const users = await this.userModel.find({})
      this.cacheManager.set('users', users.map(product => new UserResponseDto(product)), this.USERS_CACHE_TTL)
    } catch (error) {
      // this.logger.log('error inserting users to database collection' + error)
      return Promise.reject(error)
    }
  }

  async findAll() {
    try {
      const cachedUsers = await this.cacheManager.get('users')
      if (cachedUsers) return cachedUsers;
      const users = await this.userModel.find({})//.limit(20).lean()
      const usersDtos = users.map(user => new UserResponseDto(user))
      this.cacheManager.set('users', usersDtos, this.USERS_CACHE_TTL);
      return usersDtos;
      return
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
