/* eslint-disable max-lines */
import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { EditUserDto } from '@app/model/dto/user/edit-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { User, UserDocument, userSchema } from '@app/model/schema/user.schema';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES } from '@common/interfaces/preferences';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let userModel: Model<UserDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;
    let gameService: SinonStubbedInstance<GameService>;
    let matchServiceMock: { updateUsernameInMatches: jest.Mock };

    beforeAll(async () => {
        process.env.PASSWORD_PASSKEY = 'test-passkey';
        gameService = createStubInstance(GameService);
        gameService.getAllGames.resolves([]);
        gameService.deleteGamesByOwner.resolves();
        gameService.updateOwnerUsername.resolves();
        matchServiceMock = { updateUsernameInMatches: jest.fn() };

        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
            ],
            providers: [UserService, { provide: GameService, useValue: gameService }, { provide: MatchService, useValue: matchServiceMock }],
        }).compile();

        service = module.get<UserService>(UserService);
        userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach(async () => {
        await userModel.deleteMany({});
        matchServiceMock.updateUsernameInMatches.mockReset();
        gameService.getAllGames.resetHistory();
        gameService.deleteGame.resetHistory();
        gameService.deleteGamesByOwner.resetHistory();
        gameService.updateOwnerUsername.resetHistory();
    });

    afterAll(async () => {
        await connection.close();
        await mongoServer.stop({ doCleanup: true });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(userModel).toBeDefined();
    });

    describe('Socket Management', () => {
        describe('associateSocket', () => {
            it('should associate a socket with a user', () => {
                const userId = 'user123';
                const socketId = 'socket123';

                service.associateSocket(userId, socketId);

                expect(service.getSocketId(userId)).toBe(socketId);
            });
        });

        describe('disassociateSocket', () => {
            it('should remove socket association', () => {
                const userId = 'user123';
                const socketId = 'socket123';

                service.associateSocket(userId, socketId);
                service.disassociateSocket(userId);

                expect(service.getSocketId(userId)).toBeUndefined();
            });
        });

        describe('getSocketId', () => {
            it('should return socket id for user', () => {
                const userId = 'user123';
                const socketId = 'socket123';

                service.associateSocket(userId, socketId);

                expect(service.getSocketId(userId)).toBe(socketId);
            });

            it('should return undefined for non-existent user', () => {
                expect(service.getSocketId('nonexistent')).toBeUndefined();
            });
        });

        describe('getUserId', () => {
            it('should return user id for socket', () => {
                const userId = 'user123';
                const socketId = 'socket123';

                service.associateSocket(userId, socketId);

                expect(service.getUserId(socketId)).toBe(userId);
            });

            it('should return undefined for non-existent socket', () => {
                expect(service.getUserId('nonexistent')).toBeUndefined();
            });
        });
    });

    describe('getAllUsers', () => {
        it('should return all users without filters', async () => {
            await service.createUser({ username: 'user1', password: 'pass1', email: 'user1@example.com', profilePicture: '' });
            await service.createUser({ username: 'user2', password: 'pass2', email: 'user2@example.com', profilePicture: '' });

            const users = await service.getAllUsers();

            expect(users.length).toBe(2);
            expect(users[0]).toHaveProperty('userId');
            expect(users[0]).toHaveProperty('username');
            expect(users[0]).not.toHaveProperty('passwordHash');
        });

        it('should return filtered users by isLoggedIn', async () => {
            await service.createUser({ username: 'user1', password: 'pass1', email: 'user1@example.com', profilePicture: '' });
            const user2 = await service.createUser({ username: 'user2', password: 'pass2', email: 'user2@example.com', profilePicture: '' });

            await service.logout(user2.userId);

            const loggedInUsers = await service.getAllUsers({ isLoggedIn: true });
            const loggedOutUsers = await service.getAllUsers({ isLoggedIn: false });

            expect(loggedInUsers.length).toBe(1);
            expect(loggedOutUsers.length).toBe(1);
        });

        it('should return empty array when no users exist', async () => {
            const users = await service.getAllUsers();
            expect(users).toEqual([]);
        });
    });

    describe('checkUsernameExists', () => {
        it('should return true if username exists', async () => {
            await service.createUser({ username: 'testUser', password: 'password123', email: 'testUser@example.com', profilePicture: '' });

            const exists = await service.checkUserExists({ username: 'testUser', deleted: false });

            expect(exists).toBe(true);
        });

        it('should return false if username does not exist', async () => {
            const exists = await service.checkUserExists({ username: 'nonExistent', deleted: false });

            expect(exists).toBe(false);
        });
    });

    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'newUser',
                password: 'password123',
                email: 'newUser@example.com',
                profilePicture: '',
            };

            const result = await service.createUser(createUserDto);

            expect(result).toBeDefined();
            expect(result.username).toBe('newUser');
            expect(result.userId).toBeDefined();
            expect(result.isLoggedIn).toBe(true);
            expect(result.preferences).toEqual(DEFAULT_PREFERENCES);
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('should throw ConflictException if username exists', async () => {
            const createUserDto: CreateUserDto = {
                username: 'existingUser',
                password: 'password123',
                email: 'existingUser@example.com',
                profilePicture: '',
            };

            await service.createUser(createUserDto);

            await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
            await expect(service.createUser(createUserDto)).rejects.toThrow('Username already exists');
        });

        it('should hash the password', async () => {
            const createUserDto: CreateUserDto = {
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            };

            await service.createUser(createUserDto);

            const userInDb = await userModel.findOne({ username: 'testUser' }).exec();
            expect(userInDb.passwordHash).toBeDefined();
            expect(userInDb.passwordHash).not.toBe('password123');
        });

        it('should persist full profile picture when provided', async () => {
            const createUserDto: CreateUserDto = {
                username: 'avatarUser',
                password: 'password123',
                email: 'avatar@example.com',
                profilePicture: 'smallAvatar',
                fullProfilePicture: 'fullAvatar',
            };

            const result = await service.createUser(createUserDto);

            expect(result.fullProfilePicture).toBe('fullAvatar');
        });

        it('should fallback to profile picture when full profile picture is missing', async () => {
            const createUserDto: CreateUserDto = {
                username: 'fallbackUser',
                password: 'password123',
                email: 'fallback@example.com',
                profilePicture: 'smallAvatar',
            };

            const result = await service.createUser(createUserDto);

            expect(result.fullProfilePicture).toBe('smallAvatar');
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const createUserDto: CreateUserDto = {
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            };

            const createdUser = await service.createUser(createUserDto);
            await service.logout(createdUser.userId);

            const loginUserDto: LoginUserDto = {
                username: 'testUser',
                password: 'password123',
            };

            const result = await service.login(loginUserDto);

            service.associateSocket(result.userId, 'socket123');

            expect(result).toBeDefined();
            expect(result.username).toBe('testUser');
            expect(result.isLoggedIn).toBe(true);
            expect(result.preferences).toBeDefined();
            expect(service.getSocketId(result.userId)).toBe('socket123');
        });

        it('should throw NotFoundException for invalid password', async () => {
            await service.createUser({ username: 'testUser', password: 'password123', email: 'testUser@example.com', profilePicture: '' });

            const loginUserDto: LoginUserDto = {
                username: 'testUser',
                password: 'wrongPassword',
            };

            await expect(service.login(loginUserDto)).rejects.toThrow(NotFoundException);
            await expect(service.login(loginUserDto)).rejects.toThrow('User not found');
        });

        it('should throw NotFoundException for non-existent user', async () => {
            const loginUserDto: LoginUserDto = {
                username: 'nonExistent',
                password: 'password123',
            };

            await expect(service.login(loginUserDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if user already logged in', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });

            // Simulate user already connected by associating socket
            service.associateSocket(user.userId, 'socket123');

            const loginUserDto: LoginUserDto = {
                username: 'testUser',
                password: 'password123',
            };

            await expect(service.login(loginUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('editUser', () => {
        it('should update password when old password matches', async () => {
            const user = await service.createUser({
                username: 'editPasswordUser',
                password: 'oldPass123',
                email: 'editPasswordUser@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
                password: 'newSecret456',
                oldPassword: 'oldPass123',
            };

            const result = await service.editUser(editDto);
            expect(result.userId).toBe(user.userId);

            await service.logout(user.userId);
            await expect(
                service.login({
                    username: 'editPasswordUser',
                    password: 'newSecret456',
                }),
            ).resolves.toBeDefined();
        });

        it('should update username when new username is available', async () => {
            const user = await service.createUser({
                username: 'oldUsername',
                password: 'password123',
                email: 'oldUsername@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
                username: 'newusername',
            };

            const result = await service.editUser(editDto);
            expect(result.username).toBe('NEWUSERNAME');
            expect(gameService.updateOwnerUsername.calledWith(user.userId, 'NEWUSERNAME')).toBe(true);
            expect(matchServiceMock.updateUsernameInMatches).toHaveBeenCalledWith(user.userId, 'NEWUSERNAME');
        });

        it('should not propagate username update to matches when only password changes', async () => {
            const user = await service.createUser({
                username: 'editPasswordOnly',
                password: 'oldPass123',
                email: 'editpasswordonly@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
                password: 'newSecret456',
                oldPassword: 'oldPass123',
            };

            await service.editUser(editDto);
            expect(matchServiceMock.updateUsernameInMatches).not.toHaveBeenCalled();
            expect(gameService.updateOwnerUsername.called).toBe(false);
        });

        it('should throw ConflictException when username already exists', async () => {
            await service.createUser({
                username: 'TAKENUSERNAME',
                password: 'password123',
                email: 'taken@example.com',
                profilePicture: '',
            });

            const user = await service.createUser({
                username: 'editable',
                password: 'password123',
                email: 'editable@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
                username: 'takenusername',
            };

            await expect(service.editUser(editDto)).rejects.toThrow(ConflictException);
        });

        it('should throw UnauthorizedException when old password is invalid', async () => {
            const user = await service.createUser({
                username: 'wrongPwdUser',
                password: 'correctPassword',
                email: 'wrongPwd@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
                password: 'newPassword',
                oldPassword: 'incorrect',
            };

            await expect(service.editUser(editDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException when no changes are provided', async () => {
            const user = await service.createUser({
                username: 'noChangeUser',
                password: 'password123',
                email: 'nochange@example.com',
                profilePicture: '',
            });

            const editDto: EditUserDto = {
                userId: user.userId,
            };

            await expect(service.editUser(editDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw UnauthorizedException when user is not logged in', async () => {
            const user = await service.createUser({
                username: 'loggedOutUser',
                password: 'password123',
                email: 'loggedout@example.com',
                profilePicture: '',
            });

            await service.logout(user.userId);

            const editDto: EditUserDto = {
                userId: user.userId,
                username: 'SOMETHING',
            };

            await expect(service.editUser(editDto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });
            service.associateSocket(user.userId, 'socket123');

            await service.logout(user.userId);

            const userInDb = await userModel.findOne({ userId: user.userId }).exec();
            expect(userInDb.isLoggedIn).toBe(false);
            expect(service.getSocketId(user.userId)).toBeUndefined();
        });

        it('should throw UnauthorizedException if user not found', async () => {
            await expect(service.logout('nonExistentUserId')).rejects.toThrow(UnauthorizedException);
            await expect(service.logout('nonExistentUserId')).rejects.toThrow('Invalid user or not currently connected');
        });

        it('should throw UnauthorizedException if user already logged out', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });
            await service.logout(user.userId);

            await expect(service.logout(user.userId)).rejects.toThrow(UnauthorizedException);
        });

        it('should logout without error if socket not associated', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });

            await expect(service.logout(user.userId)).resolves.not.toThrow();
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });

            await service.deleteUser(user.userId);

            const userCount = await userModel.countDocuments({ userId: user.userId }).exec();
            expect(userCount).toBe(1);
        });

        it('should throw NotFoundException if user not found', async () => {
            await expect(service.deleteUser('nonExistentUserId')).rejects.toThrow(NotFoundException);
            await expect(service.deleteUser('nonExistentUserId')).rejects.toThrow('User not found');
        });

        it('should allow deleting user even if logged in', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });

            await expect(service.deleteUser(user.userId)).resolves.not.toThrow();

            const userCount = await userModel.countDocuments({ userId: user.userId }).exec();
            expect(userCount).toBe(1);
        });

        it('should delete owned games when deleting user', async () => {
            const user = await service.createUser({
                username: 'testUser',
                password: 'password123',
                email: 'testUser@example.com',
                profilePicture: '',
            });
            await service.deleteUser(user.userId);
            expect(gameService.deleteGamesByOwner.calledWith(user.userId)).toBe(true);
        });
    });

    describe('updatePreferences', () => {
        it('should update language and preserve existing theme', async () => {
            const user = await service.createUser({
                username: 'prefUser',
                password: 'password123',
                email: 'pref@user.com',
                profilePicture: '',
                preferences: {
                    theme: AppTheme.Dark,
                    language: AppLanguage.French,
                },
            });

            const updated = await service.updatePreferences(user.userId, { language: AppLanguage.English });

            expect(updated).toEqual({
                theme: AppTheme.Dark,
                language: AppLanguage.English,
            });

            const userInDb = await userModel.findOne({ userId: user.userId }).exec();
            expect(userInDb.preferences.theme).toBe(AppTheme.Dark);
            expect(userInDb.preferences.language).toBe(AppLanguage.English);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            await expect(service.updatePreferences('missing-user', { theme: AppTheme.Dark })).rejects.toThrow(NotFoundException);
        });
    });
});
