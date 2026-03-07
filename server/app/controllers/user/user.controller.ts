import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { EditUserDto } from '@app/model/dto/user/edit-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { UpdatePreferencesDto } from '@app/model/dto/user/update-preferences.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { UserService } from '@app/services/user/user.service';
import { UserPreferences } from '@common/interfaces/preferences';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Returns all users', type: [UserResponseDto] })
    @ApiQuery({ name: 'isLoggedIn', required: false, type: Boolean })
    async getAllUsers(@Query() filters?: Record<string, unknown>): Promise<UserResponseDto[]> {
        return this.userService.getAllUsers(filters);
    }

    @Get('check/:username')
    @ApiOperation({ summary: 'Check if username exists' })
    @ApiParam({ name: 'username', description: 'Username to check' })
    @ApiResponse({ status: 200, description: 'Returns true if username exists' })
    async checkUsername(@Param('username') username: string): Promise<{ exists: boolean }> {
        const exists = await this.userService.checkUserExists({ username });
        return { exists };
    }

    @Post('register')
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
    @ApiResponse({ status: 409, description: 'Username already exists' })
    async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.createUser(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login to account' })
    @ApiResponse({ status: 200, description: 'Login successful', type: UserResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiResponse({ status: 409, description: 'User already connected' })
    async login(@Body() loginUserDto: LoginUserDto): Promise<UserResponseDto> {
        return this.userService.login(loginUserDto);
    }

    @Post('logout/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Logout from account' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 204, description: 'Logout successful' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 409, description: 'User is not currently connected' })
    async logout(@Param('userId') userId: string): Promise<void> {
        return this.userService.logout(userId);
    }

    @Put('edit')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Edit account info' })
    @ApiResponse({ status: 200, description: 'Edit successful', type: UserResponseDto })
    @ApiResponse({ status: 409, description: 'Wrong password' })
    async edit(@Body() editUserDto: EditUserDto): Promise<UserResponseDto> {
        return this.userService.editUser(editUserDto);
    }

    @Delete(':userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user account' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Param('userId') userId: string): Promise<void> {
        return this.userService.deleteUser(userId);
    }

    @Patch(':userId/preferences')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update user preferences (theme, language)' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updatePreferences(@Param('userId') userId: string, @Body() dto: UpdatePreferencesDto): Promise<UserPreferences> {
        return this.userService.updatePreferences(userId, dto);
    }
}
