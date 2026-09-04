export type Customer = {
  id: number;
  name: string;
  phone: string;
  appliedAt: string;
  manageMonth: string;
  assignee: string;
  status: string;
  region: string;
  debtAmount: string;
  job: string;
  source: string;
  memo: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ListResponse = {
  customers: Customer[];
  total: number;
  assignees: string[];
  statusCounts: Record<string, number>;
  appliedMonths: string[];
  manageMonths: string[];
};
