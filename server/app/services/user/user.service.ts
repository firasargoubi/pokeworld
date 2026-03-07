import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { EditUserDto } from '@app/model/dto/user/edit-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { UpdatePreferencesDto } from '@app/model/dto/user/update-preferences.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { User, UserDocument } from '@app/model/schema/user.schema';
import { AppLanguage, AppTheme, DEFAULT_PREFERENCES, UserPreferences } from '@common/interfaces/preferences';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    private readonly passkey: string;
    private userSocketMap: Map<string, string> = new Map<string, string>();

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        this.passkey = process.env.PASSWORD_PASSKEY;
    }

    associateSocket(userId: string, socketId: string) {
        this.userSocketMap.set(userId, socketId);
    }

    disassociateSocket(userId: string) {
        this.userSocketMap.delete(userId);
    }

    getSocketId(userId: string): string | undefined {
        return this.userSocketMap.get(userId);
    }

    getUserId(socketId: string): string | undefined {
        const ids = this.userSocketMap.entries();
        for (const [user, socket] of ids) {
            if (socket === socketId) return user;
        }
        return undefined;
    }

    async getUserById(userId: string): Promise<User | null> {
        const user = await this.userModel.findOne({ userId }).exec();
        return user ? user : null;
    }

    async getAllUsers(filters?: Record<string, unknown>): Promise<UserResponseDto[]> {
        const query = filters || {};
        const users = await this.userModel.find(query).select('-passwordHash').exec();
        return users.map((user) => this.toUserResponse(user));
    }

    async checkUserExists(filters?: Record<string, unknown>): Promise<boolean> {
        const query = filters || {};
        const user = await this.userModel.findOne(query).exec();
        return !!user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const exists = await this.checkUserExists({ username: createUserDto.username, deleted: false });
        if (exists) {
            throw new ConflictException('Username already exists');
        }

        const passwordHash = this.hashPassword(createUserDto.password);
        const userId = uuidv4();

        const newUser = new this.userModel({
            email: createUserDto.email,
            username: createUserDto.username,
            profilePicture: createUserDto.profilePicture,
            passwordHash,
            userId,
            isLoggedIn: true,
            preferences: createUserDto.preferences ?? DEFAULT_PREFERENCES,
        });

        const savedUser = await newUser.save();
        return this.toUserResponse(savedUser);
    }

    async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
        const passwordHash = this.hashPassword(loginUserDto.password);
        const user = await this.userModel.findOne({ username: loginUserDto.username, passwordHash, deleted: false }).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (this.userSocketMap.has(user.userId)) {
            throw new ConflictException('User is already connected');
        }

        user.isLoggedIn = true;
        await user.save();

        return this.toUserResponse(user);
    }

    async logout(userId: string): Promise<void> {
        const user = await this.userModel.findOneAndUpdate({ userId, isLoggedIn: true }, { $set: { isLoggedIn: false } }, { new: true }).exec();
        if (!user) {
            throw new UnauthorizedException('Invalid user or not currently connected');
        }
        if (this.userSocketMap.has(userId)) {
            this.userSocketMap.delete(userId);
        }
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await this.userModel.findOne({ userId }).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.username = '[supprimé]';
        user.email = 'None';
        user.passwordHash = 'None';
        user.deleted = true;
        await user.save();
        if (this.userSocketMap.has(userId)) {
            this.userSocketMap.delete(userId);
        }
    }

    async editUser(editUserDto: EditUserDto): Promise<UserResponseDto> {
        const passwordHash = this.hashPassword(editUserDto.password);
        const oldPasswordHash = this.hashPassword(editUserDto.oldPassword);
        const user = await this.userModel.findOne({ userId: editUserDto.userId, passwordHash: oldPasswordHash, isLoggedIn: true }).exec();
        if (!user) {
            throw new UnauthorizedException('Wrong password');
        }
        user.passwordHash = passwordHash;
        await user.save();
        return this.toUserResponse(user);
    }

    async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserPreferences> {
        const user = await this.userModel.findOne({ userId, deleted: false }).exec();
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        const currentPreferences: UserPreferences = user.preferences
            ? {
                  theme: user.preferences.theme as AppTheme,
                  language: user.preferences.language as AppLanguage,
              }
            : { ...DEFAULT_PREFERENCES };

        const nextPreferences: UserPreferences = {
            ...currentPreferences,
            ...dto,
        };

        user.preferences = nextPreferences;
        await user.save();

        return nextPreferences;
    }

    private hashPassword(password: string): string {
        return crypto.createHmac('sha256', this.passkey).update(password).digest('hex');
    }

    private toUserResponse(user: UserDocument): UserResponseDto {
        const preferences: UserPreferences = user.preferences
            ? { theme: user.preferences.theme as AppTheme, language: user.preferences.language as AppLanguage }
            : { ...DEFAULT_PREFERENCES };

        return {
            userId: user.userId,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            balance: user.balance,
            isLoggedIn: user.isLoggedIn,
            preferences,
        };
    }
}
