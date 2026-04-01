import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalesGoalsService } from '../sales-goals.service';

@Injectable()
export class SalesGoalsScheduler {
  private readonly logger = new Logger(SalesGoalsScheduler.name);

  constructor(private readonly salesGoalsService: SalesGoalsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateCurrentValues() {
    this.logger.log('Iniciando atualização dos valores atuais das metas de vendas');

    try {
      await this.salesGoalsService.updateCurrentValues();
      this.logger.log('Atualização dos valores atuais das metas concluída com sucesso');
    } catch (error) {
      this.logger.error('Erro ao atualizar valores atuais das metas', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
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
      } catch (error) {
        this.logger.error('Erro na atualização horária', error);
      }
    }
  }
}