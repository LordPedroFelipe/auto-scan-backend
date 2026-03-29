import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'Listar papeis disponiveis' })
  @Get('roles')
  roles() {
    return this.permissionsService.listRoles();
  }

  @ApiOperation({ summary: 'Listar modulos disponiveis para claims' })
  @Get('modules')
  modules() {
    return this.permissionsService.listModules();
  }

  @ApiOperation({ summary: 'Listar claims disponiveis' })
  @Get('available-claims')
  availableClaims() {
    return this.permissionsService.listAvailableClaims();
  }

  @ApiOperation({ summary: 'Listar papeis de um usuario' })
  @Get('user/:userId/roles')
  userRoles(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.permissionsService.getUserRoles(userId);
  }

  @ApiOperation({ summary: 'Atualizar papeis de um usuario' })
  @ApiBody({ schema: { type: 'array', items: { type: 'string' }, example: ['Admin', 'Support'] } })
  @Post('user/:userId/roles')
  updateUserRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() roles: string[],
  ) {
    return this.permissionsService.updateUserRoles(userId, roles);
  }

  @ApiOperation({ summary: 'Listar claims de um usuario' })
  @Get('user/:userId/claims')
  userClaims(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.permissionsService.getUserClaims(userId);
  }

  @ApiOperation({ summary: 'Atualizar claims de um usuario' })
  @ApiBody({ schema: { type: 'array', items: { type: 'string' }, example: ['Module.Users:Permission.View'] } })
  @Post('user/:userId/claims')
  updateUserClaims(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() claims: string[],
  ) {
    return this.permissionsService.updateUserClaims(userId, claims);
  }
}
