import { Container } from 'typedi';
import { groupAssignmentWithExperimentConsistencyExperiment } from '../mockData/experiment';
import { multipleUsers } from '../mockData/experimentUsers';
import { ExperimentService } from '../../../src/api/services/ExperimentService';
import { ExperimentAssignmentService } from '../../../src/api/services/ExperimentAssignmentService';
import { EXPERIMENT_STATE } from 'ees_types';
import { Logger as WinstonLogger } from '../../../src/lib/logger';
import { getAllExperimentCondition, markExperimentPoint } from '../utils';
import { checkMarkExperimentPointForUser, checkExperimentAssignedIsNotDefault } from '../utils/index';
import { UserService } from '../../../src/api/services/UserService';
import { systemUser } from '../mockData/user/index';

export default async function testCase(): Promise<void> {
  const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const experimentAssignmentService = Container.get<ExperimentAssignmentService>(ExperimentAssignmentService);
  const userService = Container.get<UserService>(UserService);

  // creating new user
  const user = await userService.create(systemUser as any);

  // experiment object
  const experimentObject = groupAssignmentWithExperimentConsistencyExperiment;

  const experimentName = experimentObject.partitions[0].name;
  const experimentPoint = experimentObject.partitions[0].point;

  // create experiment
  await experimentService.create(experimentObject as any, user);
  let experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: experimentObject.state,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // get all experiment condition for user 1
  let experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[0]);
  expect(experimentConditionAssignments).toHaveLength(0);

  // mark experiment point
  let markedExperimentPoint = await markExperimentPoint(multipleUsers[0], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[0].id, experimentName, experimentPoint);

  // change experiment status to Enrolling
  const experimentId = experiments[0].id;
  await experimentAssignmentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLING, user);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLING,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[1]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(multipleUsers[1], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[1].id, experimentName, experimentPoint);

  // get all experiment condition for user 1
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[0]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 1
  markedExperimentPoint = await markExperimentPoint(multipleUsers[0], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[0].id, experimentName, experimentPoint);

  // get all experiment condition for user 3
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[2]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 1
  markedExperimentPoint = await markExperimentPoint(multipleUsers[2], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[2].id, experimentName, experimentPoint);

  // change experiment status to complete
  await experimentAssignmentService.updateState(experimentId, EXPERIMENT_STATE.ENROLLMENT_COMPLETE, user);

  // fetch experiment
  experiments = await experimentService.find();
  expect(experiments).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: experimentObject.name,
        state: EXPERIMENT_STATE.ENROLLMENT_COMPLETE,
        postExperimentRule: experimentObject.postExperimentRule,
        assignmentUnit: experimentObject.assignmentUnit,
        consistencyRule: experimentObject.consistencyRule,
      }),
    ])
  );

  // get all experiment condition for user 1
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[0]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 1
  markedExperimentPoint = await markExperimentPoint(multipleUsers[0], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[0].id, experimentName, experimentPoint);

  // get all experiment condition for user 2
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[1]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 2
  markedExperimentPoint = await markExperimentPoint(multipleUsers[1], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[1].id, experimentName, experimentPoint);

  // get all experiment condition for user 3
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[2]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 3
  markedExperimentPoint = await markExperimentPoint(multipleUsers[2], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[2].id, experimentName, experimentPoint);

  // get all experiment condition for user 4
  experimentConditionAssignments = await getAllExperimentCondition(multipleUsers[3]);
  checkExperimentAssignedIsNotDefault(experimentConditionAssignments, experimentName, experimentPoint);

  // mark experiment point for user 4
  markedExperimentPoint = await markExperimentPoint(multipleUsers[3], experimentName, experimentPoint);
  checkMarkExperimentPointForUser(markedExperimentPoint, multipleUsers[3].id, experimentName, experimentPoint);
}
