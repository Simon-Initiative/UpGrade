import { Container } from 'typedi';
import { ExperimentService } from '../../../../src/api/services/ExperimentService';
import { individualAssignmentExperiment } from '../../mockData/experiment/index';
// import { Logger as WinstonLogger } from '../../../../src/lib/logger';
import { UserService } from '../../../../src/api/services/UserService';
import { systemUser } from '../../mockData/user/index';
import { EXPERIMENT_STATE } from 'upgrade_types';

export default async function ExperimentEndDate(): Promise<void> {
  // const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  // experiment object
  const experimentObject = individualAssignmentExperiment;
  const userService = Container.get<UserService>(UserService);

  // creating new user
  const user = await userService.create(systemUser as any);

  // create experiment
  await experimentService.create(individualAssignmentExperiment as any, user);
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

  expect(experiments[0].stateTimeLogs).toHaveLength(0);

  const experiment = { ...experiments[0], state: EXPERIMENT_STATE.ENROLLMENT_COMPLETE };
  await experimentService.updateState(experiment.id, EXPERIMENT_STATE.ENROLLING, user);
  await experimentService.updateState(experiment.id, experiment.state, user);
  //await experimentService.update(experiment.id, experiment, user);

  experiments = await experimentService.find();
  
  expect(experiments[0].stateTimeLogs).toHaveLength(2);
  expect(experiments[0].stateTimeLogs.filter(state => state.toState === EXPERIMENT_STATE.ENROLLMENT_COMPLETE).map((timelogs) => timelogs.timeLog)).toHaveLength(1);

  await experimentService.delete(experiment.id, user);

  // with updated state
  await experimentService.create({ ...individualAssignmentExperiment } as any, user);
  experiments = await experimentService.find();

  expect(experiments[0].stateTimeLogs).toHaveLength(0);

  await experimentService.updateState(experiment.id, EXPERIMENT_STATE.ENROLLING, user);
  await experimentService.updateState(experiment.id, EXPERIMENT_STATE.ENROLLMENT_COMPLETE, user);
  experiments = await experimentService.find();

  expect(experiments[0].stateTimeLogs).toHaveLength(2);
  expect(experiments[0].stateTimeLogs.filter(state => state.toState === EXPERIMENT_STATE.ENROLLMENT_COMPLETE).map((timelogs) => timelogs.timeLog)).toHaveLength(1);

  // with second entry
  await experimentService.updateState(experiment.id, EXPERIMENT_STATE.ENROLLING, user);
  await experimentService.updateState(experiment.id, EXPERIMENT_STATE.ENROLLMENT_COMPLETE, user);
  experiments = await experimentService.find();

  expect(experiments[0].stateTimeLogs).toHaveLength(4);
  expect(experiments[0].stateTimeLogs.filter(state => state.toState === EXPERIMENT_STATE.ENROLLMENT_COMPLETE).map((timelogs) => timelogs.timeLog)).toHaveLength(2);
}
