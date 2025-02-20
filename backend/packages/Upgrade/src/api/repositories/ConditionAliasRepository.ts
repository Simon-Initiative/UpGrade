import { Repository, EntityRepository, EntityManager } from 'typeorm';
import repositoryError from './utils/repositoryError';
import { UpgradeLogger } from 'src/lib/logger/UpgradeLogger';
import { ConditionAlias } from '../models/ConditionAlias';

@EntityRepository(ConditionAlias)
export class ConditionAliasRepository extends Repository<ConditionAlias> {
  public async getAllConditionAlias(logger: UpgradeLogger): Promise<ConditionAlias[]> {
    return await this.createQueryBuilder('conditionAlias')
      .getMany()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError('conditionAliasRepository', 'getAllConditionAlias', {}, errorMsg);
        logger.error(errorMsg);
        throw errorMsgString;
      });
  }

  public async insertConditionAlias(
    conditionAliasDoc: ConditionAlias[],
    entityManager: EntityManager
  ): Promise<ConditionAlias[]> {
    const result = await entityManager
      .createQueryBuilder()
      .insert()
      .into(ConditionAlias)
      .values(conditionAliasDoc)
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(
          this.constructor.name,
          'insertConditionAlias',
          { conditionAliasDoc: conditionAliasDoc },
          errorMsg
        );
        throw errorMsgString;
      });
    return result.raw || [];
  }

  public async upsertConditionAlias(
    conditionAliasDoc: Partial<ConditionAlias>,
    entityManager: EntityManager
  ): Promise<ConditionAlias> {
    const result = await entityManager
      .createQueryBuilder()
      .insert()
      .into(ConditionAlias)
      .values(conditionAliasDoc)
      .onConflict(`("id") DO UPDATE SET "aliasName" = :aliasName`)
      .setParameter('aliasName', conditionAliasDoc.aliasName)
      .returning('*')
      .execute()
      .catch((error: any) => {
        const errorMsgString = repositoryError(
          'ConditionAliasRepository',
          'upsertConditionAlias',
          { conditionAliasDoc },
          error
        );
        throw errorMsgString;
      });

    return result.raw[0] || [];
  }

  public async deleteConditionAlias(id: string, logger: UpgradeLogger): Promise<ConditionAlias> {
    const result = await this.createQueryBuilder()
      .delete()
      .from(ConditionAlias)
      .where('id=:id', { id })
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError('conditionAliasRepository', 'deleteConditionAlias', { id }, errorMsg);
        logger.error(errorMsg);
        throw errorMsgString;
      });
    return result.raw;
  }
}
