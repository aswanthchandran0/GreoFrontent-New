export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "recent" | "name" | "mostActive";
  filterBy?: "all" | "verified" | "active";
}
