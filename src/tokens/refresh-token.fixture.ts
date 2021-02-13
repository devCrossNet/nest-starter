import { RefreshToken } from './entities/refresh-token.entity';

export const RefreshTokenFixture = () => {
  const refreshToken = new RefreshToken();

  refreshToken.id = 'refresh-token-id';
  refreshToken.userId = 'refresh-token-user-id';
  refreshToken.isRevoked = false;

  const expiration = new Date();
  expiration.setTime(expiration.getTime() + 60);

  refreshToken.expires = expiration;

  return refreshToken;
};
