"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SalesGoalsScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesGoalsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const sales_goals_service_1 = require("../sales-goals.service");
let SalesGoalsScheduler = SalesGoalsScheduler_1 = class SalesGoalsScheduler {
    constructor(salesGoalsService) {
        this.salesGoalsService = salesGoalsService;
        this.logger = new common_1.Logger(SalesGoalsScheduler_1.name);
    }
    async updateCurrentValues() {
        this.logger.log('Iniciando atualização dos valores atuais das metas de vendas');
        try {
            await this.salesGoalsService.updateCurrentValues();
            this.logger.log('Atualização dos valores atuais das metas concluída com sucesso');
        }
        catch (error) {
            this.logger.error('Erro ao atualizar valores atuais das metas', error);
        }
    }
    async updateCurrentValuesHourly() {
        // Atualização mais frequente durante o dia útil
        const now = new Date();
        const hour = now.getHours();
        // Só executa durante horário comercial (8h às 18h)
        if (hour >= 8 && hour <= 18) {
            this.logger.log('Atualização horária dos valores atuais das metas de vendas');
            try {
                await this.salesGoalsService.updateCurrentValues();
                this.logger.log('Atualização horária concluída com sucesso');
            }
            catch (error) {
                this.logger.error('Erro na atualização horária', error);
            }
        }
    }
};
exports.SalesGoalsScheduler = SalesGoalsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesGoalsScheduler.prototype, "updateCurrentValues", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesGoalsScheduler.prototype, "updateCurrentValuesHourly", null);
exports.SalesGoalsScheduler = SalesGoalsScheduler = SalesGoalsScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sales_goals_service_1.SalesGoalsService])
], SalesGoalsScheduler);
