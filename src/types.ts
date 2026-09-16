export type UserRole = 'manager' | 'operator' | 'farmer'

export interface User {
  user_id: number
  full_name: string
  email: string
  role: UserRole
  phone?: string
  profile_image?: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Farmer extends User {
  farmer_id: number
  farmer_code: string
  location: string
  momo_account: string
  national_id: string
}

export interface Operator extends User {
  operator_id: number
  operator_code: string
}

export interface Manager extends User {
  manager_id: number
}

export interface MilkDelivery {
  delivery_id: number
  farmer_id: number
  operator_id: number
  delivery_person: string
  quantity_kg: number
  unit_price: number
  total_cost: number
  delivery_date: string
  delivery_time: string
  status: 'accepted' | 'rejected'
  payment_status: 'paid' | 'unpaid'
  created_at: string
}

export interface MilkQualityTest {
  quality_test_id: number
  delivery_id: number
  appearance: 'good' | 'bad'
  smell: 'good' | 'bad'
  taste: 'good' | 'bad'
  temperature: number
  lactometer_reading: number
  acidity_test: 'normal' | 'abnormal'
  antibiotic_test: 'positive' | 'negative'
  organoleptic_result: 'pass' | 'fail'
  final_decision: 'accepted' | 'rejected'
  tested_by: number
  tested_at: string
}

export interface Product {
  product_id: number
  product_name: string
  current_price: number
  unit: string
  created_by: number
  created_at: string
}

export interface Sale {
  sale_id: number
  product_id: number
  operator_id: number
  client_name: string
  quantity: number
  unit_price: number
  total_cost: number
  payment_status: 'paid' | 'unpaid'
  sale_date: string
  created_at: string
}

export interface Payment {
  payment_id: number
  farmer_id: number
  delivery_id: number
  amount_paid: number
  unpaid_balance: number
  payment_method: 'momo' | 'cash' | 'bank'
  payment_date: string
  processed_by: number
}

export interface Announcement {
  announcement_id: number
  title: string
  message: string
  target_role?: 'farmer' | 'operator' | 'all'
  created_by: number
  created_at: string
}

export interface Message {
  message_id: number
  sender_id: number
  receiver_id: number
  message: string
  sent_at: string
  status: 'seen' | 'unseen'
}