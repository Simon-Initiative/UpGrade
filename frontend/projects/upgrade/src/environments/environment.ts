// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses 'environment.ts', but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  appName: 'UpGrade',
  envName: 'DEV',
  apiBaseUrl: 'http://localhost:3030/api',
  production: false,
  test: false,
  baseHrefPrefix: '',
  googleClientId: '135765367152-pq4jhd3gra10jda9l6bpnmu9gqt48tup.apps.googleusercontent.com',
  domainName: '',
  pollingEnabled: true,
  pollingInterval: 10 * 1000,
  pollingLimit: 600,
  api: {
    getAllExperiments: '/experiments/paginated',
    createNewExperiments: '/experiments',
    importExperiment: '/experiments/import',
    exportExperiment: '/experiments/export',
    updateExperiments: '/experiments',
    getExperimentById: '/experiments/single',
    getAllAuditLogs: '/audit',
    getAllErrorLogs: '/error',
    experimentsStats: '/stats/enrollment',
    experimentDetailStat: '/stats/enrollment/detail',
    generateCsv: '/stats/csv',
    experimentGraphInfo: '/stats/enrollment/date',
    deleteExperiment: '/experiments',
    updateExperimentState: '/experiments/state',
    users: '/users',
    loginUser: '/login/user', // Used to create a new user after login if doesn't exist in DB
    getAllUsers: '/users/paginated',
    userDetails: '/users/details',
    previewUsers: '/previewUsers',
    getAllPreviewUsers: '/previewUsers/paginated',
    previewUsersAssignCondition: '/previewUsers/assign',
    allPartitions: '/experiments/partitions',
    allExperimentNames: '/experiments/names',
    featureFlag: '/flags',
    updateFlagStatus: '/flags/status',
    getPaginatedFlags: '/flags/paginated',
    setting: '/setting',
    metrics: '/metric',
    metricsSave: '/metric/save',
    queryResult: '/query/analyse',
    getVersion: '/version',
    contextMetaData: '/experiments/contextMetaData',
    segments: '/segments',
    importSegment: '/segments/import',
    exportSegment: '/segments/export',
    getGroupAssignmentStatus: '/experiments/getGroupAssignmentStatus',
  },
};
