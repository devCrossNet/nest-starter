import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TokensService } from '../tokens/tokens.service';
import { JwtGuard } from './jwt.guard';
import { UpdateRefreshTokenDto } from '../tokens/dto/update-refresh-token.dto';
import { UsersService } from '../users/users.service';

const TTL = 60 * 60 * 24 * 30; // 30 days

@Controller('auth')
export class AuthController {
  constructor(
    private tokenService: TokensService,
    private userService: UsersService,
  ) {}

  @Post('token')
  async createTokenPair(@Body() body) {
    const user = await this.userService.findByEmailAndPassword(
      body.email,
      body.password,
    );

    if (!user) {
      throw new NotFoundException();
    }

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken(
      user,
      TTL,
    );

    return {
      type: 'bearer',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  @Post('refresh')
  async reFreshTokenPair(@Body() body: UpdateRefreshTokenDto) {
    const {
      accessToken,
    } = await this.tokenService.createAccessTokenFromRefreshToken(
      body.refresh_token,
    );

    return {
      type: 'bearer',
      access_token: accessToken,
      refresh_token: body.refresh_token,
    };
  }

  @UseGuards(JwtGuard)
  @Get('user')
  async userInfo(@Request() req) {
    const user = await this.userService.findOne(req.user.id);

    if (!user) {
      throw new NotFoundException();
    }

    return {
      user,
    };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Request() req) {
    await this.tokenService.deleteRefreshTokensByUserId(req.user.id);

    return;
  }
}
