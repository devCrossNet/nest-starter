import { RolesBuilder } from 'nest-access-control';

const grantsObject = {
  user: {
    users: {
      'create:own': ['*'],
      'read:own': ['*'],
      'update:own': ['*'],
      'delete:own': ['*'],
    },
  },
};

export const AppRoles = new RolesBuilder(grantsObject);
