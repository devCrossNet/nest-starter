import { User } from './entities/user.entity';

export const UserFixture = () => {
  const user = new User();

  user.id = 'user-id';
  user.email = 'test@test.de';
  user.password = 'password';

  return user;
};
