import { scheduleJobEndExperiment } from '../../mockData/experiment/index';
import { Logger as WinstonLogger } from '../../../../src/lib/logger';
import { ExperimentService } from '../../../../src/api/services/ExperimentService';
import { Container } from 'typedi';
import { ScheduledJobService } from '../../../../src/api/services/ScheduledJobService';
import { SCHEDULE_TYPE } from '../../../../src/api/models/ScheduledJob';
import { UserService } from '../../../../src/api/services/UserService';
import { systemUser } from '../../mockData/user/index';

export default async function EndExperiment(): Promise<void> {
  const logger = new WinstonLogger(__filename);
  const experimentService = Container.get<ExperimentService>(ExperimentService);
  const scheduledJobService = Container.get<ScheduledJobService>(ScheduledJobService);
  const userService = Container.get<UserService>(UserService);

  // creating new user
  const user = await userService.create(systemUser as any);

  // experiment object
  const experimentObject = scheduleJobEndExperiment;

  // create experiment
  await experimentService.create(scheduleJobEndExperiment as any, user);
  const experiments = await experimentService.find();
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

  await new Promise(r => setTimeout(r, 1000));
  const endExperiment = await scheduledJobService.getAllEndExperiment();

  expect(endExperiment).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        experimentId: experiments[0].id,
        type: SCHEDULE_TYPE.END_EXPERIMENT,
        timeStamp: new Date(experimentObject.endOn),
      }),
    ])
  );
}
