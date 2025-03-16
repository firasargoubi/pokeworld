import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { CombatGateway } from './gateways/combat/combat.gateway';
import { LobbyGateway } from './gateways/lobby/lobby.gateway';
import { PlayGateway } from './gateways/play/play.gateway';
import { Game, gameSchema } from './model/schema/game.schema';
import { CombatService } from './services/combat/combat.service';
import { GameService } from './services/game/game.service';
import { LobbyService } from './services/lobby/lobby.service';
import { MatchService } from './services/match/match.service';
import { PlayService } from './services/play/play.service';

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
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [Logger, GameService, MatchService, LobbyGateway, LobbyService, PlayGateway, PlayService, CombatGateway, CombatService],
})
export class AppModule {}
