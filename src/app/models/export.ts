import { Item } from './item';
import { User } from './user';

export interface ExportDetail {
  item: Item;
  quantity: number;
  forUser: User;
}

export interface AddExportDetail {
  itemId: string;
  quantity: number;
  forUserId: string;
}

export interface Export {
  id: number;
  description: string;
  createdDate: Date;
  createdByUser: User;
}

export interface ExportPagination {
  data: Export[];
  pageIndex: number;
  pageSize: number;
  totalPage: number;
  totalRecords: number;
}

export interface ExportWithDetail {
  id: number;
  description: string;
  createdDate: Date;
  createdByUser: User;
  details: ExportDetail[];
}

export interface AddExport {
  description: string;
  details: AddExportDetail[];
}