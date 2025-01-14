import { AppState } from '../../core.module';
import { ExperimentCondition, ExperimentDecisionPoint } from '../../experiments/store/experiments.model';

// in PUT/POST request, parentCondition and decisionPoint are id string
export interface ExperimentConditionAliasRequestObject {
  id?: string;
  aliasName: string;
  parentCondition: string;
  decisionPoint?: string;
}

export interface FactorialConditionRequestObject {
  id: string;
  name: string;
  conditionCode: string;
  assignmentWeight: number;
  order: number;
  levelCombinationElements: { id: string; level: FactorialLevelTableRowData }[];
}
export interface SimpleExperimentAliasTableRow {
  id?: string;
  designTableCombinationId?: string;
  site: string;
  target: string;
  condition: string;
  alias: string;
  rowStyle?: string;
  useCustom?: boolean;
}

export interface SimpleExperimentFormData {
  decisionPoints?: SimpleExperimentFormDecisionPoints[];
  partitions?: SimpleExperimentFormDecisionPoints[];
  conditions: SimplerExperimentFormDecisionConditions[];
}

export interface SimpleExperimentFormDecisionPoints {
  site: string;
  target: string;
  excludeIfReached: string;
  order: number;
}

export interface SimplerExperimentFormDecisionConditions {
  conditionCode: string;
  assignmentWeight: string;
  description: string;
  order: number;
}

export interface SimpleExperimentDesignData {
  decisionPoints: ExperimentDecisionPoint[];
  conditions: ExperimentCondition[];
}

export interface DecisionPointsTableRowData {
  site: string;
  target: string;
  excludeIfReached: boolean;
  order: number;
}

export interface ConditionsTableRowData {
  conditionCode: string;
  assignmentWeight: string;
  description: string;
  order: number;
}

export interface FactorialConditionTableRowData {
  id: string;
  conditionAliasId?: string;
  levels: FactorialLevelTableRowData[];
  alias: string;
  weight: string;
  include: boolean;
}

export interface FactorialLevelTableRowData {
  id: string;
  name: string;
}

export interface ExperimentFactorialDesignData {
  factors: ExperimentFactorFormData[];
}

export interface ExperimentFactorFormData {
  factor: string;
  site: string;
  target: string;
  order: number;
  levels: ExperimentLevelFormData[];
}

export interface ExperimentLevelFormData {
  id: string;
  level: string;
  alias: string;
}

export interface ExperimentDesignStepperState {
  isSimpleExperimentAliasTableEditMode: boolean;
  isDecisionPointsTableEditMode: boolean;
  isConditionsTableEditMode: boolean;
  simpleExperimentAliasTableEditIndex: number | null;
  decisionPointsTableEditIndex: number | null;
  conditionsTableEditIndex: number | null;
  decisionPointsEditModePreviousRowData: DecisionPointsTableRowData;
  conditionsEditModePreviousRowData: ConditionsTableRowData;
  simpleExperimentDesignData: SimpleExperimentDesignData;
  simpleExperimentAliasTableData: SimpleExperimentAliasTableRow[];
  isFactorialConditionsTableEditMode: boolean;
  factorialConditionsTableEditIndex: number | null;
  factorialConditionsEditModePreviousRowData: FactorialConditionTableRowData;
  factorialDesignData: ExperimentFactorialDesignData;
  factorialConditionsTableData: FactorialConditionTableRowData[];
  hasExperimentStepperDataChanged: boolean;
}

export interface State extends AppState {
  experimentDesignStepper: ExperimentDesignStepperState;
}
