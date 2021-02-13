import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IQueryInfo } from 'accesscontrol';
import { InjectRolesBuilder, Role, RolesBuilder } from 'nest-access-control';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRolesBuilder() private readonly roleBuilder: RolesBuilder,
  ) {}

  protected async getUser(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  protected async getParams(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    return request.params;
  }

  protected async getUserRoles(
    context: ExecutionContext,
  ): Promise<string | string[]> {
    const user = await this.getUser(context);
    if (!user) throw new UnauthorizedException();
    return user.roles;
  }

  protected async getUserId(
    context: ExecutionContext,
  ): Promise<string | string[]> {
    const user = await this.getUser(context);
    if (!user) throw new UnauthorizedException();
    return user.id;
  }

  protected async getRessourceId(
    context: ExecutionContext,
  ): Promise<string | string[]> {
    const params = await this.getParams(context);

    return params.id;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const userRoles = await this.getUserRoles(context);
    const userId = await this.getUserId(context);
    const resourceId = await this.getRessourceId(context);

    return roles.every((role) => {
      if (role.possession === 'own' && userId !== resourceId) {
        return false;
      }

      const queryInfo: IQueryInfo = role;
      queryInfo.role = userRoles;
      const permission = this.roleBuilder.permission(queryInfo);
      return permission.granted;
    });
  }
}
