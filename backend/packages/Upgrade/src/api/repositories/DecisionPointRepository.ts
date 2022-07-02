import { DecisionPoint } from '../models/DecisionPoint';
import { Repository, EntityRepository, EntityManager } from 'typeorm';
import repositoryError from './utils/repositoryError';

@EntityRepository(DecisionPoint)
export class DecisionPointRepository extends Repository<DecisionPoint> {
  public async upsertDecisionPoint(
    decisionPointDoc: Partial<DecisionPoint>,
    entityManager: EntityManager
  ): Promise<DecisionPoint> {
    const result = await entityManager
      .createQueryBuilder()
      .insert()
      .into(DecisionPoint)
      .values(decisionPointDoc)
      .onConflict(`("id") DO UPDATE SET "target" = :target, "description" = :description, "order" = :order`)
      .setParameter('target', decisionPointDoc.target)
      .setParameter('description', decisionPointDoc.description)
      .setParameter('order', decisionPointDoc.order)
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(
          this.constructor.name,
          'upsertExperimentPartition',
          { partitionDoc: decisionPointDoc },
          errorMsg
        );
        throw errorMsgString;
      });

    return result.raw[0];
  }

  public async deleteByIds(ids: string[], entityManager: EntityManager): Promise<DecisionPoint[]> {
    const result = await entityManager
      .createQueryBuilder()
      .delete()
      .from(DecisionPoint)
      .where('id IN (:...ids)', { ids })
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(this.constructor.name, 'deleteByIds', { ids }, errorMsg);
        throw errorMsgString;
      });

    return result.raw;
  }

  public async insertDecisionPoint(
    decisionPointDoc: DecisionPoint[],
    entityManager: EntityManager
  ): Promise<DecisionPoint[]> {
    const result = await entityManager
      .createQueryBuilder()
      .insert()
      .into(DecisionPoint)
      .values(decisionPointDoc)
      .returning('*')
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(this.constructor.name, 'insertPartitions', { partitionsDocs: decisionPointDoc }, errorMsg);
        throw errorMsgString;
      });

    return result.raw;
  }

  public async deleteDecisionPoint(id: string, entityManager: EntityManager): Promise<void> {
    entityManager
      .createQueryBuilder()
      .delete()
      .from(DecisionPoint)
      .where('id = :id', { id })
      .execute()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(this.constructor.name, 'deletePartition', { id }, errorMsg);
        throw errorMsgString;
      });
  }

  public async partitionPointAndName(): Promise<Array<Pick<DecisionPoint, 'target' | 'site'>>> {
    return this.createQueryBuilder('experimentPartition')
      .select(['experimentPartition.site', 'experimentPartition.target'])
      .getMany()
      .catch((errorMsg: any) => {
        const errorMsgString = repositoryError(this.constructor.name, 'partitionPointAndName', undefined, errorMsg);
        throw errorMsgString;
      });
  }

  public async getAllUniqueIdentifier(): Promise<string[]> {
    const experimentPartitions = await this.createQueryBuilder('experimentPartition')
      .select('experimentPartition.twoCharacterId')
      .getMany();
    const uniqueIdentifier = experimentPartitions.map((experimentPartition) => experimentPartition.twoCharacterId);
    return uniqueIdentifier;
  }
}