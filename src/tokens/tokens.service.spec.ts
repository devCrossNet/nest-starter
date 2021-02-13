import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { UserFixture } from '../users/users.fixture';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RefreshTokenFixture } from './refresh-token.fixture';

describe('TokensService', () => {
  let service: TokensService;
  let refreshTokenRepository: Repository<RefreshToken>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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
      ],
    }).compile();

    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    service = module.get<TokensService>(TokensService);
  });

  it('should generate access token', async () => {
    const userFixture = UserFixture();

    const actual = await service.generateAccessToken(userFixture);
    expect(actual.length).toBeGreaterThan(64);
  });

  it('should generate refresh token', async () => {
    const userFixture = UserFixture();
    const refreshTokenFixture = RefreshTokenFixture();

    jest
      .spyOn(refreshTokenRepository, 'save')
      .mockImplementation(() => Promise.resolve(refreshTokenFixture));

    const actual = await service.generateRefreshToken(userFixture, 20);
    expect(actual.length).toBeGreaterThan(64);
  });

  describe('resolveRefreshToken', () => {
    it('should resolve user and refresh token', async () => {
      const userFixture = UserFixture();
      const refreshTokenFixture = RefreshTokenFixture();

      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(userFixture));

      const refreshToken = await service.generateRefreshToken(userFixture, 20);

      const actual = await service.resolveRefreshToken(refreshToken);
      const expected = {
        refreshToken: refreshTokenFixture,
        user: userFixture,
      };

      expect(actual).toEqual(expected);
    });

    it('should throw id refresh token is not in data base', async () => {
      const userFixture = UserFixture();
      const refreshTokenFixture = RefreshTokenFixture();

      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(userFixture));

      const refreshToken = await service.generateRefreshToken(userFixture, 20);

      try {
        await service.resolveRefreshToken(refreshToken);
      } catch (e) {
        expect(e.message).toBe('Refresh tokens not found');
      }
    });

    it('should throw if refresh token is revoked', async () => {
      const userFixture = UserFixture();
      const refreshTokenFixture = RefreshTokenFixture();

      refreshTokenFixture.isRevoked = true;

      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(userFixture));

      const refreshToken = await service.generateRefreshToken(userFixture, 20);

      try {
        await service.resolveRefreshToken(refreshToken);
      } catch (e) {
        expect(e.message).toBe('Refresh tokens revoked');
      }
    });

    it('should throw if user is not in data base', async () => {
      const userFixture = UserFixture();
      const refreshTokenFixture = RefreshTokenFixture();

      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      const refreshToken = await service.generateRefreshToken(userFixture, 20);

      try {
        await service.resolveRefreshToken(refreshToken);
      } catch (e) {
        expect(e.message).toBe('Refresh tokens malformed');
      }
    });

    it('should throw if token is expired', async () => {
      const userFixture = UserFixture();
      const refreshTokenFixture = RefreshTokenFixture();

      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(refreshTokenFixture));
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      const refreshToken = await service.generateRefreshToken(userFixture, 20);

      try {
        await service.resolveRefreshToken(refreshToken + '123');
      } catch (e) {
        expect(e.message).toBe('Refresh tokens expired');
      }
    });
  });

  it('should create access token from refresh token', async () => {
    const userFixture = UserFixture();
    const refreshTokenFixture = RefreshTokenFixture();

    jest
      .spyOn(refreshTokenRepository, 'save')
      .mockImplementation(() => Promise.resolve(refreshTokenFixture));
    jest
      .spyOn(refreshTokenRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(refreshTokenFixture));
    jest
      .spyOn(userRepository, 'findOne')
      .mockImplementation(() => Promise.resolve(userFixture));

    const refreshToken = await service.generateRefreshToken(userFixture, 20);

    const actual = await service.createAccessTokenFromRefreshToken(
      refreshToken,
    );
    expect(actual.user).toEqual(userFixture);
    expect(actual.accessToken.length).toBeGreaterThan(64);
  });

  it('should delete refresh tokens', async () => {
    const deletionResult = { raw: null, affected: 1337 };

    jest
      .spyOn(refreshTokenRepository, 'delete')
      .mockImplementation(() => Promise.resolve(deletionResult));

    const actual = await service.deleteRefreshTokensByUserId('test');
    const expected = deletionResult;

    expect(actual).toEqual(expected);
  });
});
