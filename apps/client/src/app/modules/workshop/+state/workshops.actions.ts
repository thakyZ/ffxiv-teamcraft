import { Action } from '@ngrx/store';
import { Workshop } from '../../../model/other/workshop';

export enum WorkshopsActionTypes {
  LoadMyWorkshops = '[Workshops] Load My Workshops',
  LoadWorkshop = '[Workshops] Load Workshop',
  LoadSharedWorkshops = '[Workshops] Load Shared Workshops',
  SelectWorkshop = '[Workshops] Select Workshop',

  PropagateWorkshopPermissions = '[Workshops] Propagate Workshop Permissions',

  MyWorkshopsLoaded = '[Workshops] My Workshops Loaded',
  WorkshopLoaded = '[Workshops] Workshop Loaded',
  SharedWorkshopsLoaded = '[Workshops] Shared Workshops Loaded',
  UpdateWorkshopIndexes = '[Workshops] Update Workshops Indexes',

  CreateWorkshop = '[Workshops] Create Workshop',
  UpdateWorkshop = '[Workshops] Update Workshop',
  RemoveListFromWorkshop = '[Workshops] Remove List from Workshop',
  DeleteWorkshop = '[Workshops] Delete Workshop',
}

export class LoadMyWorkshops implements Action {
  readonly type = WorkshopsActionTypes.LoadMyWorkshops;
}

export class LoadWorkshop implements Action {
  readonly type = WorkshopsActionTypes.LoadWorkshop;

  constructor(public readonly key: string) {
  }
}

export class WorkshopLoaded implements Action {
  readonly type = WorkshopsActionTypes.WorkshopLoaded;

  constructor(public readonly workshop: Partial<Workshop>) {
  }
}

export class LoadSharedWorkshops implements Action {
  readonly type = WorkshopsActionTypes.LoadSharedWorkshops;
}

export class PropagateWorkshopPermissions implements Action {
  readonly type = WorkshopsActionTypes.PropagateWorkshopPermissions;

  constructor(public readonly workshop: Workshop) {
  }
}

export class SelectWorkshop implements Action {
  readonly type = WorkshopsActionTypes.SelectWorkshop;

  constructor(public readonly key: string) {
  }
}

export class MyWorkshopsLoaded implements Action {
  readonly type = WorkshopsActionTypes.MyWorkshopsLoaded;

  constructor(public payload: Workshop[]) {
  }
}

export class SharedWorkshopsLoaded implements Action {
  readonly type = WorkshopsActionTypes.SharedWorkshopsLoaded;

  constructor(public payload: Workshop[]) {
  }
}

export class CreateWorkshop implements Action {
  readonly type = WorkshopsActionTypes.CreateWorkshop;

  constructor(public readonly payload: Workshop) {
  }
}

export class UpdateWorkshop implements Action {
  readonly type = WorkshopsActionTypes.UpdateWorkshop;

  constructor(public readonly payload: Workshop) {
  }
}

export class RemoveListFromWorkshop implements Action {
  readonly type = WorkshopsActionTypes.RemoveListFromWorkshop;

  constructor(public readonly listKey: string, public readonly workshopKey: string) {
  }
}

export class UpdateWorkshopIndexes implements Action {
  readonly type = WorkshopsActionTypes.UpdateWorkshopIndexes;

  constructor(public readonly payload: Workshop[]) {
  }
}

export class DeleteWorkshop implements Action {
  readonly type = WorkshopsActionTypes.DeleteWorkshop;

  constructor(public readonly key: string) {
  }
}

export type WorkshopsAction =
  LoadMyWorkshops
  | MyWorkshopsLoaded
  | CreateWorkshop
  | SelectWorkshop
  | UpdateWorkshopIndexes
  | LoadSharedWorkshops
  | SharedWorkshopsLoaded
  | UpdateWorkshop
  | LoadWorkshop
  | WorkshopLoaded
  | DeleteWorkshop
  | PropagateWorkshopPermissions;
