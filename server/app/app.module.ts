import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Course, courseSchema } from '@app/model/database/course';
import { CourseController } from '@app/controllers/course/course.controller';
import { CourseService } from '@app/services/course/course.service';
import { DateController } from '@app/controllers/date/date.controller';
import { DateService } from '@app/services/date/date.service';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ExampleService } from '@app/services/example/example.service';
import { ExampleController } from '@app/controllers/example/example.controller';
import { GameController } from './controllers/game/game.controller';
import { GameService } from './services/game/game.service';
import { Game, gameSchema } from './model/schema/game.schema';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forFeature([
            { name: Course.name, schema: courseSchema },
            { name: Game.name, schema: gameSchema },
        ]),
    ],
    controllers: [CourseController, DateController, ExampleController, GameController],
    providers: [ChatGateway, CourseService, DateService, ExampleService, Logger, GameService],
})
export class AppModule {}
