import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // // generate a nestjs post controller for change password
  // @Post('change-password')
  // async changePassword(
  //   @UserDeco() user: UserPayloadDto,
  //   @Body() body: UserChangePasswordDto,
  // ) {
  //   return this.userService.changePassword(user.id, body);
  // }
}
