import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';

const BASE_OPTIONS: SignOptions = {
  issuer: 'https://my-app.com',
  audience: 'https://my-app.com',
};

export interface RefreshTokenPayload {
  jti: number;
  jwtid: number;
  sub: number;
}

@Injectable()
export class TokensService {
  public constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  public async generateAccessToken(user: User): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return await this.jwtService.signAsync({ ...user }, opts);
  }

  public async generateRefreshToken(
    user: User,
    expiresIn: number,
  ): Promise<string> {
    const refreshToken = new RefreshToken();

    refreshToken.userId = user.id;
    refreshToken.isRevoked = false;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + expiresIn);

    refreshToken.expires = expiration;

    const newRefreshToken = await this.refreshTokenRepository.save(
      refreshToken,
    );

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: user.id,
      jwtid: newRefreshToken.id,
    };

    return await this.jwtService.signAsync({}, opts);
  }

  public async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: User; refreshToken: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded);
    const refreshToken = await this.getStoredTokenFromRefreshTokenPayload(
      payload,
    );

    if (!refreshToken) {
      throw new UnprocessableEntityException('Refresh tokens not found');
    }

    if (refreshToken.isRevoked) {
      throw new UnprocessableEntityException('Refresh tokens revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh tokens malformed');
    }

    return { user, refreshToken };
  }

  public async createAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: User }> {
    const { user } = await this.resolveRefreshToken(refreshToken);

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw new UnprocessableEntityException('Refresh tokens expired');
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<User> {
    const userId = payload.sub;

    /* istanbul ignore next */
    if (!userId) {
      throw new UnprocessableEntityException('Refresh tokens malformed');
    }

    return this.userRepository.findOne(userId);
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<RefreshToken | null> {
    const refreshTokenId = payload.jti;

    /* istanbul ignore next */
    if (!refreshTokenId) {
      throw new UnprocessableEntityException('Refresh tokens malformed');
    }

    return this.refreshTokenRepository.findOne(refreshTokenId);
  }

  async deleteRefreshTokensByUserId(userId: string) {
    return await this.refreshTokenRepository.delete({ userId });
  }
}
