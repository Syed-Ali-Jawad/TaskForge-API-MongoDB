import { SortOrder } from "./common.enums";


interface TaskBody {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  reporterId: string;
}

interface TaskQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  assigneeId?: string[];
  reporterId?: string[];
  status?: string[];
  priority?: string[];
  sortBy?: TaskSortBy;
  sortOrder?: SortOrder;
}

enum TaskSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  COMPLETION_DATE = "completionDate",
  DUE_DATE = "dueDate",
  TITLE = "title",
}

export { TaskBody, TaskSortBy, TaskQueryParams };
