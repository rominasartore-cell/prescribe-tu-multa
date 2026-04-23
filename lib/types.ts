export interface User {
  id: string;
  email: string;
  phone?: string;
  rut?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractionResult {
  rut: string;
  patente: string;
  monto: number;
  articulo?: string;
  fechaIngreso: Date;
}

export interface PrescriptionResult {
  rut: string;
  patente: string;
  monto: number;
  articulo?: string;
  fechaIngreso: Date;
  fechaPrescripcion: Date;
  estado: 'PRESCRITA' | 'VIGENTE';
  diasRestantes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ExtractedData {
  rut?: string;
  patente?: string;
  monto?: number;
  articulo?: string;
  fechaIngreso?: string;
  errors?: ValidationError[];
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payer: {
    email: string;
  };
}
