export interface CountRow {
  label: string;
  count: number;
}

export interface LeadsSummary {
  total: number;
  newThisWeek: number;
  byCategory: CountRow[];
  recent: { id: string; name: string; number: string; source: string; category: string; createdAt: string }[];
}

export interface AppointmentsSummary {
  today: number;
  todayByStatus: CountRow[];
  nextSevenDays: number;
  upcoming: {
    id: string;
    name: string;
    service: string;
    treatment?: string;
    date: string;
    time: string;
    status: string;
    branch?: { id: string; name: string } | null;
  }[];
}

export interface ClientsSummary {
  total: number;
  newThisMonth: number;
  upcomingVisits: { id: string; name: string; concern?: string; nextVisit: string }[];
}

export interface BillingSummary {
  billedThisMonth: number;
  collectedThisMonth: number;
  billsThisMonth: number;
  outstanding: number;
  unpaidCount: number;
  recent: { id: string; invoiceNumber: string; clientName: string; date: string; total: number; paymentStatus: string }[];
}

export interface ExpensesSummary {
  approvedThisMonth: number;
  pendingCount: number;
  pendingAmount: number;
  pending: { id: string; date: string; category: string; amount: number; description?: string; submittedBy?: string }[];
}

export interface PayrollSummary {
  latestMonth: string | null;
  latestMonthTotal: number;
  latestMonthCount: number;
  pendingCount: number;
  pendingAmount: number;
}

export interface EmployeesSummary {
  active: number;
  inactive: number;
  byDepartment: CountRow[];
  monthlySalaries: number;
}

export interface ServicesSummary {
  total: number;
  active: number;
  online: number;
  categories: number;
}

export interface BranchesSummary {
  total: number;
  takingBookings: number;
  list: {
    id: string;
    name: string;
    city?: string;
    isActive: boolean;
    bookingEnabled: boolean;
    appointmentsToday: number;
  }[];
}

export interface TeamSummary {
  members: number;
  active: number;
  pendingInvites: number;
  byRole: CountRow[];
}

/** Only the sections the signed-in role may open are present. */
export interface DashboardSections {
  leads?: LeadsSummary;
  appointments?: AppointmentsSummary;
  clients?: ClientsSummary;
  billing?: BillingSummary;
  expenses?: ExpensesSummary;
  payroll?: PayrollSummary;
  employees?: EmployeesSummary;
  services?: ServicesSummary;
  branches?: BranchesSummary;
  team?: TeamSummary;
}

export interface ChartPoint {
  month: string;
  revenue?: number;
  expenses?: number;
}

export interface DashboardResponse {
  success: boolean;
  data: { today: string; sections: DashboardSections; chart: ChartPoint[] };
}
