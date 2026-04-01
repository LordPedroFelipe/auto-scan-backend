"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesGoalsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sale_closure_entity_1 = require("../sales/entities/sale-closure.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const sales_goals_controller_1 = require("./sales-goals.controller");
const sales_goals_scheduler_1 = require("./schedulers/sales-goals.scheduler");
const sales_goals_service_1 = require("./sales-goals.service");
const sales_goal_entity_1 = require("./entities/sales-goal.entity");
let SalesGoalsModule = class SalesGoalsModule {
};
exports.SalesGoalsModule = SalesGoalsModule;
exports.SalesGoalsModule = SalesGoalsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                sales_goal_entity_1.SalesGoalEntity,
                shop_entity_1.ShopEntity,
                user_entity_1.UserEntity,
                sale_closure_entity_1.SaleClosureEntity,
            ]),
        ],
        controllers: [sales_goals_controller_1.SalesGoalsController],
        providers: [sales_goals_service_1.SalesGoalsService, sales_goals_scheduler_1.SalesGoalsScheduler],
        exports: [sales_goals_service_1.SalesGoalsService],
    })
], SalesGoalsModule);
