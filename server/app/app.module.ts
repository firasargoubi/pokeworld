import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { LobbyGateway } from './gateways/lobby/lobby.gateway';
import { TurnGateway } from './gateways/turn/turn.gateway';
import { Game, gameSchema } from './model/schema/game.schema';
import { GameService } from './services/game/game.service';
import { CombatGateway } from './gateways/combat/combat.gateway';

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
    providers: [LobbyGateway, TurnGateway, CombatGateway, Logger, GameService],
})
export class AppModule {}
