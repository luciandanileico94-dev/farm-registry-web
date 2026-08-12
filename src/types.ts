export type ParcelStatus = 'Valid' | 'Review' | 'Blocked';

export type Parcel = {
  id: string;
  farmer: string;
  area: number;
  status: ParcelStatus;
  crop: string;
  center: [number, number];
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  /** Optional additions keep the original Python /parcels contract valid. */
  farmId?: string;
  farmName?: string;
  fieldName?: string;
  season?: string;
  plantingDate?: string;
  harvestWindow?: string;
};

export type Farm = {
  id: string;
  name: string;
  county: string;
  manager: string;
  fieldIds: string[];
};

export type TaskStatus = 'Open' | 'InProgress' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export type FarmTask = {
  id: string;
  fieldId: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  createdAt: string;
};

export type ObservationStatus = 'Pending' | 'Approved' | 'NeedsReview';

export type Observation = {
  id: string;
  fieldId: string;
  note: string;
  category: 'Cultură' | 'Irigare' | 'Dăunători' | 'Infrastructură';
  status: ObservationStatus;
  author: string;
  observedAt: string;
};

export type ActivityRecord = {
  id: string;
  fieldId: string;
  action: string;
  actor: string;
  at: string;
  detail: string;
};

export type WorkspaceData = {
  farms: Farm[];
  fields: Parcel[];
  tasks: FarmTask[];
  observations: Observation[];
  activity: ActivityRecord[];
};

export type DataMode = 'demo' | 'api';
