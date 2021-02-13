import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from '../tokens/entities/refresh-token.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserFixture } from '../users/users.fixture';

describe('AuthController', () => {
  let controller: AuthController;
  let tokensService: TokensService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        JwtModule.register({
          secret: '1337',
          signOptions: { expiresIn: '24h' },
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(RefreshToken),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        TokensService,
        UsersService,
      ],
      controllers: [AuthController],
    }).compile();

    tokensService = module.get<TokensService>(TokensService);
    userService = module.get<UsersService>(UsersService);
    controller = module.get<AuthController>(AuthController);
  });

  describe('/auth/token', () => {
    it('should return token pair', async () => {
      const userFixture = new User();

      userFixture.id = 'user-id';
      userFixture.email = 'test@test.de';
      userFixture.password = 'password';

      jest
        .spyOn(userService, 'findByEmailAndPassword')
        .mockImplementation(() => Promise.resolve(userFixture));

      jest
        .spyOn(tokensService, 'generateAccessToken')
        .mockImplementation(() => Promise.resolve('access_token'));

      jest
        .spyOn(tokensService, 'generateRefreshToken')
        .mockImplementation(() => Promise.resolve('refresh_token'));

      const actual = await controller.createTokenPair({});
      const expected = {
        type: 'bearer',
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      expect(actual).toEqual(expected);
    });

    it('should throw error', async () => {
      jest
        .spyOn(userService, 'findByEmailAndPassword')
        .mockImplementation(() => Promise.resolve(null));

      jest
        .spyOn(tokensService, 'generateAccessToken')
        .mockImplementation(() => Promise.resolve('access_token'));

      jest
        .spyOn(tokensService, 'generateRefreshToken')
        .mockImplementation(() => Promise.resolve('refresh_token'));

      try {
        await controller.createTokenPair({});
      } catch (e) {
        expect(e.message).toBe('Not Found');
      }
    });
  });

  describe('/auth/refresh', () => {
    it('should return token pair', async () => {
      const userFixture = new User();

      userFixture.id = 'user-id';
      userFixture.email = 'test@test.de';
      userFixture.password = 'password';

      jest
        .spyOn(tokensService, 'createAccessTokenFromRefreshToken')
        .mockImplementation(() =>
          Promise.resolve({ accessToken: 'access_token', user: null }),
        );

      const actual = await controller.reFreshTokenPair({
        refresh_token: 'refresh_token',
      });
      const expected = {
        type: 'bearer',
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('/auth/user', () => {
    it('should return user-info', async () => {
      const userFixture = UserFixture();

      jest
        .spyOn(userService, 'findOne')
        .mockImplementation(() => Promise.resolve(userFixture));

      const actual = await controller.userInfo({ user: { id: 'user-id' } });
      const expected = { user: userFixture };

      expect(actual).toEqual(expected);
    });

    it('should throw error', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      try {
        await controller.userInfo({ user: { id: 'user-id' } });
      } catch (e) {
        expect(e.message).toBe('Not Found');
      }
    });
  });

  describe('/auth/logout', () => {
    it('should return user-info', async () => {
      jest
        .spyOn(tokensService, 'deleteRefreshTokensByUserId')
        .mockImplementation(() => Promise.resolve(null));

      const actual = await controller.logout({ user: { id: 'user-id' } });
      const expected = undefined;

      expect(actual).toEqual(expected);
    });
  });
});
