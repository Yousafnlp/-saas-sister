'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth-context';
import type { Appointment, AppointmentFormData } from '@/components/pages/appointments/types';

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (data: AppointmentFormData) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
}

interface ApiAppointment extends Omit<Appointment, 'leadId'> {
  lead: string | null;
}

interface AppointmentListResponse {
  success: boolean;
  data: ApiAppointment[];
}

interface AppointmentResponse {
  success: boolean;
  data: ApiAppointment;
}

function fromApi(apt: ApiAppointment): Appointment {
  const { lead, ...rest } = apt;
  return { ...rest, leadId: lead, date: toDateOnly(rest.date) };
}

const AppointmentsContext = createContext<AppointmentsState | undefined>(undefined);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    api
      .get<AppointmentListResponse>('/appointments?limit=100')
      .then((res) => setAppointments(res.data.map(fromApi)))
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load appointments');
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const addAppointment = async (data: AppointmentFormData) => {
    const { leadId, ...rest } = data;
    const res = await api.post<AppointmentResponse>('/appointments', { ...rest, lead: leadId });
    setAppointments((prev) => [...prev, fromApi(res.data)]);
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    const res = await api.put<AppointmentResponse>(`/appointments/${id}`, { status });
    setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? fromApi(res.data) : appointment)));
  };

  const removeAppointment = async (id: string) => {
    await api.delete(`/appointments/${id}`);
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
  };

  return (
    <AppointmentsContext.Provider
      value={{ appointments, isLoading, addAppointment, updateAppointmentStatus, removeAppointment }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const ctx = useContext(AppointmentsContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentsProvider');
  return ctx;
}
