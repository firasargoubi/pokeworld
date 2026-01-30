import { CreateUserDto } from '@app/model/dto/user/create-user.dto';
import { LoginUserDto } from '@app/model/dto/user/login-user.dto';
import { UserResponseDto } from '@app/model/dto/user/response-user.dto';
import { User, UserDocument } from '@app/model/schema/user.schema';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    private readonly passkey: string;

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
        this.passkey = process.env.PASSWORD_PASSKEY;
    }

    async getAllUsers(filters?: Record<string, unknown>): Promise<UserResponseDto[]> {
        const query = filters || {};
        const users = await this.userModel.find(query).select('-passwordHash').exec();
        return users.map((user) => this.toUserResponse(user));
    }

    async checkUsernameExists(username: string): Promise<boolean> {
        const user = await this.userModel.findOne({ username }).exec();
        return !!user;
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const exists = await this.checkUsernameExists(createUserDto.username);
        if (exists) {
            throw new ConflictException('Username already exists');
        }

        const passwordHash = this.hashPassword(createUserDto.password);
        const userId = uuidv4();

        const newUser = new this.userModel({
            username: createUserDto.username,
            passwordHash,
            userId,
            isLoggedIn: true,
        });

        const savedUser = await newUser.save();
        return this.toUserResponse(savedUser);
    }

    async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
        const user = await this.userModel.findOne({ username: loginUserDto.username }).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const passwordHash = this.hashPassword(loginUserDto.password);
        if (passwordHash !== user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.isLoggedIn) {
            throw new ConflictException('User is already connected');
        }

        user.isLoggedIn = true;
        await user.save();

        return this.toUserResponse(user);
    }

    async logout(userId: string): Promise<void> {
        const user = await this.userModel.findOne({ userId }).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.isLoggedIn) {
            throw new ConflictException('User is not currently connected');
        }

        user.isLoggedIn = false;
        await user.save();
    }

    async deleteUser(userId: string): Promise<void> {
        const result = await this.userModel.deleteOne({ userId }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('User not found');
        }
    }

    private hashPassword(password: string): string {
        return crypto.createHmac('sha256', this.passkey).update(password).digest('hex');
    }

    private toUserResponse(user: UserDocument): UserResponseDto {
        return {
            userId: user.userId,
            username: user.username,
            isLoggedIn: user.isLoggedIn,
        };
    }
}
