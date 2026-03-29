import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsService } from './permissions.service';

@UseGuards(JwtAuthGuard)
@Controller('Permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('roles')
  roles() {
    return this.permissionsService.listRoles();
  }

  @Get('modules')
  modules() {
    return this.permissionsService.listModules();
  }

  @Get('available-claims')
  availableClaims() {
    return this.permissionsService.listAvailableClaims();
  }

  @Get('user/:userId/roles')
  userRoles(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.permissionsService.getUserRoles(userId);
  }

  @Post('user/:userId/roles')
  updateUserRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() roles: string[],
  ) {
    return this.permissionsService.updateUserRoles(userId, roles);
  }

  @Get('user/:userId/claims')
  userClaims(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.permissionsService.getUserClaims(userId);
  }

  @Post('user/:userId/claims')
  updateUserClaims(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() claims: string[],
  ) {
    return this.permissionsService.updateUserClaims(userId, claims);
  }
}
