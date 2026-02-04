import { UserService } from '@app/services/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { UserController } from './user.controller';
import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';

describe('UserController', () => {
    let controller: UserController;
    let userService: SinonStubbedInstance<UserService>;
    const fakeUserResponse: UserResponseDto = {
        userId: 'user123',
        username: 'testUser',
        isLoggedIn: false,
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
            userService.checkUsernameExists.resolves(true);

            const res = await controller.checkUsername(username);

            expect(res).toEqual({ exists: true });
            expect(userService.checkUsernameExists.calledWith(username)).toBeTruthy();
        });

        it('should return false if username does not exist', async () => {
            const username = 'nonExistentUser';
            userService.checkUsernameExists.resolves(false);

            const res = await controller.checkUsername(username);

            expect(res).toEqual({ exists: false });
            expect(userService.checkUsernameExists.calledWith(username)).toBeTruthy();
        });
    });

    describe('register', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newUser',
                password: 'password123',
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
});
