import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { UseRoles } from 'nest-access-control';
import { RoleGuard } from '../role.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({
    action: 'read',
    possession: 'any',
    resource: 'users',
  })
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({
    action: 'read',
    possession: 'own',
    resource: 'users',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({
    action: 'update',
    possession: 'own',
    resource: 'users',
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @UseRoles({
    action: 'delete',
    possession: 'own',
    resource: 'users',
  })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);

    return;
  }
}
