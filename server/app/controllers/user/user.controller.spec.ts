import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { UpdatePreferencesDto } from '@app/model/dto/user/update-preferences.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { UserService } from '@app/services/user/user.service';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES } from '@common/interfaces/preferences';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { UserController } from './user.controller';

describe('UserController', () => {
    let controller: UserController;
    let userService: SinonStubbedInstance<UserService>;
    const fakeUserResponse: UserResponseDto = {
        userId: 'user123',
        username: 'testUser',
        isLoggedIn: false,
        email: 'user@test.com',
        profilePicture: '',
        fullProfilePicture: '',
        balance: 0,
        preferences: DEFAULT_PREFERENCES,
    };

    beforeEach(async () => {
        userService = createStubInstance(UserService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [{ provide: UserService, useValue: userService }],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllUsers', () => {
        it('should return all users', async () => {
            const fakeUsers = [fakeUserResponse, fakeUserResponse];
            userService.getAllUsers.resolves(fakeUsers);

            const res = await controller.getAllUsers();

            expect(res).toBe(fakeUsers);
            expect(userService.getAllUsers.calledOnce).toBeTruthy();
        });

        it('should return all users with filters', async () => {
            const fakeUsers = [fakeUserResponse];
            const filters = { isLoggedIn: true };
            userService.getAllUsers.resolves(fakeUsers);

            const res = await controller.getAllUsers(filters);

            expect(res).toBe(fakeUsers);
            expect(userService.getAllUsers.calledWith(filters)).toBeTruthy();
        });
    });

    describe('checkUsername', () => {
        it('should return true if username exists', async () => {
            const username = 'testUser';
            userService.checkUserExists.resolves(true);

            const res = await controller.checkUsername(username);

            expect(res).toEqual({ exists: true });
            expect(userService.checkUserExists.calledWith({ username })).toBeTruthy();
        });

        it('should return false if username does not exist', async () => {
            const username = 'nonExistentUser';
            userService.checkUserExists.resolves(false);

            const res = await controller.checkUsername(username);

            expect(res).toEqual({ exists: false });
            expect(userService.checkUserExists.calledWith({ username })).toBeTruthy();
        });
    });

    describe('register', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newUser',
                password: 'password123',
                email: 'abc@abc.abc',
                profilePicture: '',
            };
            userService.createUser.resolves(fakeUserResponse);

            const res = await controller.register(createUserDto);

            expect(res).toBe(fakeUserResponse);
            expect(userService.createUser.calledWith(createUserDto)).toBeTruthy();
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const loginUserDto: LoginUserDto = {
                username: 'testUser',
                password: 'password123',
            };
            userService.login.resolves(fakeUserResponse);

            const res = await controller.login(loginUserDto);

            expect(res).toBe(fakeUserResponse);
            expect(userService.login.calledWith(loginUserDto)).toBeTruthy();
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const userId = 'user123';
            userService.logout.resolves();

            await controller.logout(userId);

            expect(userService.logout.calledWith(userId)).toBeTruthy();
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const userId = 'user123';
            userService.deleteUser.resolves();

            await controller.deleteUser(userId);

            expect(userService.deleteUser.calledWith(userId)).toBeTruthy();
        });
    });

    describe('updatePreferences', () => {
        it('should update preferences successfully', async () => {
            const userId = 'user123';
            const dto: UpdatePreferencesDto = { language: AppLanguage.English };
            const updated = { theme: AppTheme.Default, language: AppLanguage.English };

            userService.updatePreferences.resolves(updated);

            const res = await controller.updatePreferences(userId, dto);

            expect(res).toEqual(updated);
            expect(userService.updatePreferences.calledWith(userId, dto)).toBeTruthy();
        });
    });
});
