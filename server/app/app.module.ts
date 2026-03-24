import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BalanceController } from './controllers/balance/balance.controller';
import { GameController } from './controllers/game/game.controller';
import { UserController } from './controllers/user/user.controller';
import { ChatGateway } from './gateways/chat/chat.gateway';
import { CombatGateway } from './gateways/combat/combat.gateway';
import { LobbyGateway } from './gateways/lobby/lobby.gateway';
import { MatchGateway } from './gateways/match/match.gateway';
import { PlayGateway } from './gateways/play/play.gateway';
import { Channel, channelSchema } from './model/schema/channel.schema';
import { Game, gameSchema } from './model/schema/game.schema';
import { User, userSchema } from './model/schema/user.schema';
import { BalanceService } from './services/balance/balance.service';
import { BotService } from './services/bot/bot.service';
import { ChatService } from './services/chat/chat.service';
import { CombatService } from './services/combat/combat.service';
import { GameService } from './services/game/game.service';
import { ItemService } from './services/item/item.service';
import { LobbyService } from './services/lobby/lobby.service';
import { MapService } from './services/map/map.service';
import { MatchService } from './services/match/match.service';
import { PlayService } from './services/play/play.service';
import { TrackingService } from './services/tracking/tracking.service';
import { UserService } from './services/user/user.service';

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
            { name: Game.name, schema: gameSchema },
            { name: User.name, schema: userSchema },
            { name: Channel.name, schema: channelSchema },
        ]),
    ],
    controllers: [GameController, UserController, BalanceController],
    providers: [
        Logger,

        BalanceService,
        GameService,
        MatchService,
        LobbyService,
        PlayService,
        CombatService,
        MapService,
        ChatService,
        BotService,
        ItemService,
        UserService,

        MatchGateway,
        LobbyGateway,
        PlayGateway,
        CombatGateway,
        ChatGateway,
        TrackingService,
    ],
})
export class AppModule {}
