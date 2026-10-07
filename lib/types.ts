export type RoleEnum = 'landlord' | 'tenant';

export interface LandlordProfile {
  company_name?: string;
  phone?: string;
}

export interface TenantProfile {
  phone?: string;
  emergency_contact?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role?: RoleEnum;
  landlord_profile?: LandlordProfile;
  tenant_profile?: TenantProfile;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  address: string;
  rent_amount: string;
  image?: string | null;
  landlord: number;
  landlord_username: string;
}

export interface PropertyInput {
  title: string;
  description?: string;
  address: string;
  rent_amount: string;
  image?: string | null;
}

export type RentalStatusEnum = 'pending' | 'active' | 'completed' | 'canceled';

export interface Rental {
  id: number;
  property: number;
  property_title: string;
  tenant: number;
  tenant_username: string;
  start_date: string;
  end_date: string;
  status: RentalStatusEnum;
}

export interface RentalInput {
  property: number;
  start_date: string;
  end_date: string;
  status: RentalStatusEnum;
  tenant?: number;
}

export type PaymentStatusEnum = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: number;
  rental: number;
  property_title: string;
  tenant_username: string;
  amount: string;
  date_paid: string;
  status: PaymentStatusEnum;
  payment_method?: string;
}

export interface PaymentInput {
  rental: number;
  amount: string;
  status: PaymentStatusEnum;
  payment_method?: string;
  date_paid?: string;
}

export type PriorityEnum = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceRequestStatusEnum = 'pending' | 'in_progress' | 'resolved' | 'cancelled';

export interface MaintenanceRequest {
  id: number;
  rental: number;
  tenant: number;
  tenant_username: string;
  property_title: string;
  title: string;
  description: string;
  priority: PriorityEnum;
  status: MaintenanceRequestStatusEnum;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequestInput {
  rental: number;
  title: string;
  description: string;
  priority: PriorityEnum;
  status: MaintenanceRequestStatusEnum;
}

export type ViewTab = 'overview' | 'properties' | 'rentals' | 'payments' | 'maintenance';

export interface ApiState {
  useMock: boolean;
  token: string | null;
  user: User | null;
}
