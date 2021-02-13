import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly salt: string;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.salt = configService.get('ENCRYPT_SALT');
  }

  async create(createUserDto: CreateUserDto) {
    createUserDto.password = hashSync(createUserDto.password, this.salt);

    const newUser = await this.userRepository.save(createUserDto);

    delete newUser.password;

    return newUser;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async findByEmailAndPassword(email: string, password: string) {
    password = hashSync(password, this.salt);

    return await this.userRepository.findOne({ email, password });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);

    return this.findOne(id);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
