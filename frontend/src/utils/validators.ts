import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede superar 255 caracteres'),
  sku: z
    .string()
    .min(1, 'El SKU es requerido')
    .max(100, 'El SKU no puede superar 100 caracteres'),
  price: z
    .number({ message: 'El precio es requerido' })
    .min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z
    .number({ message: 'El stock es requerido' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock debe ser mayor o igual a 0'),
});

export const updateProductSchema = createProductSchema.partial();

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede superar 255 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createOrderItemSchema = z.object({
  productId: z
    .number({ message: 'El ID del producto es requerido' })
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser positivo'),
  qty: z
    .number({ message: 'La cantidad es requerida' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor a 0'),
});

export const createOrderSchema = z.object({
  customerId: z
    .number({ message: 'El ID del cliente es requerido' })
    .int('El ID debe ser un número entero')
    .positive('El ID debe ser positivo'),
  items: z
    .array(createOrderItemSchema)
    .min(1, 'El pedido debe tener al menos un producto'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
