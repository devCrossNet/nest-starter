import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserFixture } from './users.fixture';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { AccessControlModule } from 'nest-access-control';
import { AppRoles } from '../app.roles';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AccessControlModule.forRoles(AppRoles),
      ],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        UsersService,
      ],
      controllers: [UsersController],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  describe('POST /users', () => {
    it('should create user', async () => {
      const userFixture = UserFixture();
      const mock = jest
        .spyOn(usersService, 'create')
        .mockImplementation(() => Promise.resolve(userFixture));

      await controller.create(userFixture);

      expect(mock).toHaveBeenCalledWith(userFixture);
    });
  });

  describe('GET /users', () => {
    it('should return list of users', async () => {
      const userFixture = UserFixture();

      jest
        .spyOn(usersService, 'findAll')
        .mockImplementation(() => Promise.resolve([userFixture]));

      const actual = await controller.findAll();
      const expected = [userFixture];

      expect(actual).toEqual(expected);
    });
  });

  describe('GET /users/:id', () => {
    it('should return list of users', async () => {
      const userFixture = UserFixture();

      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(() => Promise.resolve(userFixture));

      const actual = await controller.findOne(userFixture.id);
      const expected = userFixture;

      expect(actual).toEqual(expected);
    });

    it("should return 404 if user doesn't exist", async () => {
      const userFixture = UserFixture();

      jest
        .spyOn(usersService, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      try {
        await controller.findOne(userFixture.id);
      } catch (e) {
        expect(e.message).toBe('Not Found');
      }
    });
  });

  describe('PUT /users', () => {
    it('should create user', async () => {
      const userFixture = UserFixture();
      const mock = jest
        .spyOn(usersService, 'update')
        .mockImplementation(() => Promise.resolve(userFixture));

      await controller.update(userFixture.id, userFixture);

      expect(mock).toHaveBeenCalledWith(userFixture.id, userFixture);
    });
  });

  describe('DELETE /users', () => {
    it('should create user', async () => {
      const userFixture = UserFixture();
      const mock = jest
        .spyOn(usersService, 'remove')
        .mockImplementation(() => Promise.resolve(null));

      await controller.remove(userFixture.id);

      expect(mock).toHaveBeenCalledWith(userFixture.id);
    });
  });
});
