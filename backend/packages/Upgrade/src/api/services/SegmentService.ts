import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { SegmentRepository } from '../repositories/SegmentRepository';
import { IndividualForSegmentRepository } from '../repositories/IndividualForSegmentRepository';
import { GroupForSegmentRepository } from '../repositories/GroupForSegmentRepository';
import { Segment } from '../models/Segment';
import { UpgradeLogger } from '../../lib/logger/UpgradeLogger';
import { EXPERIMENT_STATE, SEGMENT_TYPE, SERVER_ERROR, SEGMENT_STATUS } from 'upgrade_types';
import { getConnection } from 'typeorm';
import uuid from 'uuid';
import { ErrorWithType } from '../errors/ErrorWithType';
import { IndividualForSegment } from '../models/IndividualForSegment';
import { GroupForSegment } from '../models/GroupForSegment';
import { SegmentInputValidator } from '../controllers/validators/SegmentInputValidator';
import { ExperimentSegmentExclusionRepository } from '../repositories/ExperimentSegmentExclusionRepository';
import { ExperimentSegmentInclusionRepository } from '../repositories/ExperimentSegmentInclusionRepository';
import { getSegmentData } from '../controllers/SegmentController';
import { globalExcludeSegment } from '../../init/seed/globalExcludeSegment';
import { CacheService } from './CacheService';
@Service()
export class SegmentService {
  constructor(
    @OrmRepository()
    private segmentRepository: SegmentRepository,
    @OrmRepository()
    private individualForSegmentRepository: IndividualForSegmentRepository,
    @OrmRepository()
    private groupForSegmentRepository: GroupForSegmentRepository,
    @OrmRepository()
    private experimentSegmentExclusionRepository: ExperimentSegmentExclusionRepository,
    @OrmRepository()
    private experimentSegmentInclusionRepository: ExperimentSegmentInclusionRepository,
    private cacheService: CacheService
  ) {}

  public async getAllSegments(logger: UpgradeLogger): Promise<Segment[]> {
    logger.info({ message: `Find all segments` });
    const queryBuilder = await this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.individualForSegment', 'individualForSegment')
      .leftJoinAndSelect('segment.groupForSegment', 'groupForSegment')
      .leftJoinAndSelect('segment.subSegments', 'subSegment')
      .where('segment.type != :private', { private: SEGMENT_TYPE.PRIVATE })
      .getMany();

    return queryBuilder;
  }

  public async getSegmentById(id: string, logger: UpgradeLogger): Promise<Segment> {
    logger.info({ message: `Find segment by id. segmentId: ${id}` });
    const segmentDoc = await this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.individualForSegment', 'individualForSegment')
      .leftJoinAndSelect('segment.groupForSegment', 'groupForSegment')
      .leftJoinAndSelect('segment.subSegments', 'subSegment')
      .where('segment.type != :private', { private: SEGMENT_TYPE.PRIVATE })
      .andWhere({ id })
      .getOne();

    return segmentDoc;
  }

  public async getSegmentByIds(ids: string[]): Promise<Segment[]> {
    return this.cacheService.wrapFunction(ids, async () => {
      const result = await this.segmentRepository
        .createQueryBuilder('segment')
        .leftJoinAndSelect('segment.individualForSegment', 'individualForSegment')
        .leftJoinAndSelect('segment.groupForSegment', 'groupForSegment')
        .leftJoinAndSelect('segment.subSegments', 'subSegment')
        .where('segment.id IN (:...ids)', { ids })
        .getMany();

      // sort according to ids
      const sortedData = ids.map((id) => {
        return result.find((data) => data.id === id);
      });

      return sortedData;
    });
  }

  public async getAllSegmentWithStatus(logger: UpgradeLogger): Promise<getSegmentData> {
    const segmentsData = await getConnection().transaction(async () => {
      const segmentsData = await this.getAllSegments(logger);
      const allExperimentSegmentsInclusion = await this.getExperimentSegmenInclusionData();
      const allExperimentSegmentsExclusion = await this.getExperimentSegmenExclusionData();

      const segmentsUsedLockedList = [];
      const segmentsUsedUnlockedList = [];

      if (allExperimentSegmentsInclusion) {
        allExperimentSegmentsInclusion.forEach((ele) => {
          const subSegments = ele.segment.subSegments;
          subSegments.forEach((subSegment) => {
            ele.experiment.state === EXPERIMENT_STATE.ENROLLING
              ? segmentsUsedLockedList.push(subSegment.id)
              : segmentsUsedUnlockedList.push(subSegment.id);
          });
        });
      }

      if (allExperimentSegmentsExclusion) {
        allExperimentSegmentsExclusion.forEach((ele) => {
          const subSegments = ele.segment.subSegments;
          subSegments.forEach((subSegment) => {
            ele.experiment.state === EXPERIMENT_STATE.ENROLLING
              ? segmentsUsedLockedList.push(subSegment.id)
              : segmentsUsedUnlockedList.push(subSegment.id);
          });
        });
      }

      const segmentsDataWithStatus = segmentsData.map((segment) => {
        if (segment.id === globalExcludeSegment.id) {
          return { ...segment, status: SEGMENT_STATUS.GLOBAL };
        } else if (segmentsUsedLockedList.find((segmentId) => segmentId === segment.id)) {
          return { ...segment, status: SEGMENT_STATUS.USED }; // TODO change to locked
        } else if (segmentsUsedUnlockedList.find((segmentId) => segmentId === segment.id)) {
          return { ...segment, status: SEGMENT_STATUS.USED }; // TODO change to unlocked
        } else {
          return { ...segment, status: SEGMENT_STATUS.UNUSED };
        }
      });

      return {
        segmentsData: segmentsDataWithStatus,
        experimentSegmentInclusionData: allExperimentSegmentsInclusion,
        experimentSegmentExclusionData: allExperimentSegmentsExclusion,
      };
    });

    return segmentsData;
  }

  public async getExperimentSegmenExclusionData() {
    const queryBuilder = await this.experimentSegmentExclusionRepository.getExperimentSegmentExclusionData();
    return queryBuilder;
  }

  public async getExperimentSegmenInclusionData() {
    const queryBuilder = await this.experimentSegmentInclusionRepository.getExperimentSegmentInclusionData();
    return queryBuilder;
  }

  public upsertSegment(segment: SegmentInputValidator, logger: UpgradeLogger): Promise<Segment> {
    logger.info({ message: `Upsert segment => ${JSON.stringify(segment, undefined, 2)}` });
    return this.addSegmentDataInDB(segment, logger);
  }

  public async deleteSegment(id: string, logger: UpgradeLogger): Promise<Segment> {
    logger.info({ message: `Delete segment by id. segmentId: ${id}` });
    return await this.segmentRepository.deleteSegment(id, logger);
  }

  public async importSegment(segment: SegmentInputValidator, logger: UpgradeLogger): Promise<Segment> {
    const duplicateSegment = await this.segmentRepository.findOne(segment.id);
    if (duplicateSegment && segment.id !== undefined) {
      const error = new Error('Duplicate segment');
      (error as any).type = SERVER_ERROR.QUERY_FAILED;
      logger.error(error);
      throw error;
    }

    // check for each subSegment to exists
    const allSegments = await this.segmentRepository.getAllSegments(logger);
    segment.subSegmentIds.forEach((subSegmentId) => {
      const subSegment = allSegments.find((segmentId) => subSegmentId === segmentId.id);
      if (!subSegment) {
        const error = new Error(
          'SubSegment: ' + subSegmentId + ' not found. Please import subSegment and link in experiment.'
        );
        (error as any).type = SERVER_ERROR.QUERY_FAILED;
        logger.error(error);
        throw error;
      }
    });

    logger.info({ message: `Import segment => ${JSON.stringify(segment, undefined, 2)}` });
    return this.addSegmentDataInDB(segment, logger);
  }

  public async exportSegment(segmentId: string, logger: UpgradeLogger): Promise<Segment> {
    logger.info({ message: `Export segment by id. segmentId: ${segmentId}` });
    const segmentDoc = await this.segmentRepository.findOne({
      where: { id: segmentId },
      relations: ['individualForSegment', 'groupForSegment', 'subSegments'],
    });
    if (!segmentDoc) {
      throw new Error(SERVER_ERROR.QUERY_FAILED);
    }
    return segmentDoc;
  }

  private async addSegmentDataInDB(segment: SegmentInputValidator, logger: UpgradeLogger): Promise<Segment> {
    const createdSegment = await getConnection().transaction(async (transactionalEntityManager) => {
      let segmentDoc: Segment;

      if (segment.id) {
        try {
          // get segment by ids
          segmentDoc = await transactionalEntityManager
            .getRepository(Segment)
            .findOne(segment.id, { relations: ['individualForSegment', 'groupForSegment', 'subSegments'] });

          // delete individual for segment
          if (segmentDoc && segmentDoc.individualForSegment && segmentDoc.individualForSegment.length > 0) {
            const usersToDelete = segmentDoc.individualForSegment.map((individual) => {
              return { userId: individual.userId, segment: segment.id };
            });
            await transactionalEntityManager.getRepository(IndividualForSegment).delete(usersToDelete as any);
          }

          // delete group for segment
          if (segmentDoc && segmentDoc.groupForSegment && segmentDoc.groupForSegment.length > 0) {
            const groupToDelete = segmentDoc.groupForSegment.map((group) => {
              return { groupId: group.groupId, type: group.type, segment: segment.id };
            });
            await transactionalEntityManager.getRepository(GroupForSegment).delete(groupToDelete as any);
          }
        } catch (err) {
          const error = err as ErrorWithType;
          error.details = 'Error in deleting segment from DB';
          error.type = SERVER_ERROR.QUERY_FAILED;
          logger.error(error);
          throw error;
        }
      }

      // create/update segment document
      segment.id = segment.id || uuid();
      const { id, name, description, context, type } = segment;
      const allSegments = await this.segmentRepository.getAllSegments(logger);
      const subSegmentData = segment.subSegmentIds
        .filter((subSegmentId) => {
          // check if segment exists:
          const subSegment = allSegments.find((segmentId) => subSegmentId === segmentId.id);
          if (subSegment) {
            return true;
          } else {
            const error = new Error(
              'SubSegment: ' + subSegmentId + ' not found. Please import subSegment and link in experiment.'
            );
            (error as any).type = SERVER_ERROR.QUERY_FAILED;
            logger.error(error);
            return false;
          }
        })
        .map((subSegmentId) => ({ id: subSegmentId }));

      try {
        segmentDoc = await transactionalEntityManager
          .getRepository(Segment)
          .save({ id, name, description, context, type, subSegments: subSegmentData });
      } catch (err) {
        const error = err as ErrorWithType;
        error.details = 'Error in saving segment in DB';
        error.type = SERVER_ERROR.QUERY_FAILED;
        logger.error(error);
        throw error;
      }

      const individualForSegmentDocsToSave = segment.userIds.map((userId) => ({
        userId,
        segment: segmentDoc,
      }));

      const groupForSegmentDocsToSave = segment.groups.map((group) => {
        return { ...group, segment: segmentDoc };
      });

      try {
        await Promise.all([
          this.individualForSegmentRepository.insertIndividualForSegment(
            individualForSegmentDocsToSave,
            transactionalEntityManager,
            logger
          ),
          this.groupForSegmentRepository.insertGroupForSegment(
            groupForSegmentDocsToSave,
            transactionalEntityManager,
            logger
          ),
        ]);
      } catch (err) {
        const error = err as Error;
        error.message = `Error in creating individualDocs, groupDocs in "addSegmentInDB"`;
        logger.error(error);
        throw error;
      }

      // reset caching
      this.cacheService.resetCache();

      return transactionalEntityManager
        .getRepository(Segment)
        .findOne(segmentDoc.id, { relations: ['individualForSegment', 'groupForSegment', 'subSegments'] });
    });

    return createdSegment;
  }
}
