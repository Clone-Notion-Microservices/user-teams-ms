import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UserService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Users database service connected');
  }

  create(createUserDto: CreateUserDto) {
    // const hashedPassword = await bcryptjs.hash(password, 10)
    return 'This action adds a new user';
  }

  async findAll(queryDto: PaginationDto) {
    const { page, limit, query } = queryDto;
    const total = await this.user.count({
      where: {
        AND: query
          ? [
              { name: { contains: query } },
              { email: { contains: query } },
              { role: { contains: query } },
            ]
          : undefined, // Si query está vacío, no aplica el filtro
      },
    });

    const lastPage = Math.ceil(total / limit!);

    const result = await this.user.findMany({
      skip: (page - 1) * limit!,
      take: limit,
      where: {
        OR: query
          ? [
              { name: { contains: query } },
              { email: { contains: query } },
              { role: { contains: query } },
            ]
          : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { data: result, meta: { page, total, lastPage } };
  }

  async findOne(data: string | { email: string }) {
    if (typeof data === 'object') {
      const { email } = data;
      const user = await this.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          message: `User with email ${email} not found`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      return user;
    }

    const user = await this.user.findFirst({
      where: { id: Number(data) },
    });
    if (!user) {
      throw new RpcException({
        message: `User with id ${data} not found`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { projects_permission, tasks_permission, ...res } = updateUserDto;

    await this.findOne(String(id));

    return this.user.update({
      where: { id },
      data: {
        ...res,
        ...(Array.isArray(projects_permission) &&
          projects_permission.length > 0 && {
            projects_permission: JSON.stringify(projects_permission),
          }),
        ...(Array.isArray(tasks_permission) &&
          tasks_permission.length > 0 && {
            tasks_permission: JSON.stringify(tasks_permission),
          }),
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
