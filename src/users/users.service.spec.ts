import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserFixture } from './users.fixture';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        UsersService,
      ],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    service = module.get<UsersService>(UsersService);
  });

  it('should create user', async () => {
    const userFixture = UserFixture();
    const expected = {
      ...userFixture,
    };

    delete expected.password;

    jest
      .spyOn(userRepository, 'save')
      .mockImplementation(() => Promise.resolve(expected));

    const actual = await service.create(userFixture);

    expect(actual).toEqual(expected);
  });

  it('should list users', async () => {
    const userFixture = UserFixture();
    const expected = [userFixture];

    jest
      .spyOn(userRepository, 'find')
      .mockImplementation(() => Promise.resolve(expected));

    const actual = await service.findAll();

    expect(actual).toEqual(expected);
  });

  it('should find user by id', async () => {
    const userFixture = UserFixture();

    jest
      .spyOn(userRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(userFixture));

    const actual = await service.findOne('user-id');
    const expected = userFixture;

    expect(actual).toEqual(expected);
  });

  it('should find user by email and password', async () => {
    const userFixture = UserFixture();

    const mock = jest
      .spyOn(userRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(userFixture));

    const actual = await service.findByEmailAndPassword(
      'test@test.com',
      '1337!leet!',
    );
    const expected = userFixture;

    expect(actual).toEqual(expected);
    expect(mock).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '$2b$10$TUJomrwUDAQsiPPXVJNBe.HiBDParAgQhclqBNtoRmnqLabKApZDm',
    });
  });

  it('should update user', async () => {
    const userFixture = UserFixture();

    const mock = jest
      .spyOn(userRepository, 'update')
      .mockImplementation(() => Promise.resolve(null));

    jest
      .spyOn(userRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(null));

    await service.update('user-id', userFixture);

    expect(mock).toHaveBeenCalledWith('user-id', {
      email: 'test@test.de',
      id: 'user-id',
      password: 'password',
    });
  });

  it('should delete user', async () => {
    const mock = jest
      .spyOn(userRepository, 'delete')
      .mockImplementation(() => Promise.resolve(null));

    await service.remove('user-id');

    expect(mock).toHaveBeenCalledWith('user-id');
  });
});
