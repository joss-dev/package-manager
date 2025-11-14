import { useState, useEffect } from 'react';
import type { Customer, Product, CreateOrderItemRequest } from '../../types';
import { customerService, productService, orderService } from '../../services';
import { createOrderSchema } from '../../utils/validators';
import { ZodError } from 'zod';

interface OrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  qty: number;
}

export const OrderForm = ({ onSuccess, onCancel }: OrderFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          customerService.getAll({ limit: 100 }),
          productService.getAll({ limit: 100 }),
        ]);
        setCustomers(customersRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) {
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      return;
    }

    const existingItemIndex = items.findIndex((item) => item.productId === selectedProductId);
    const currentQtyInCart = existingItemIndex >= 0 ? items[existingItemIndex].qty : 0;
    const totalQty = currentQtyInCart + quantity;

    if (totalQty > product.stock) {
      setApiError(`Stock insuficiente. Disponible: ${product.stock}, En carrito: ${currentQtyInCart}`);
      return;
    }
    
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      newItems[existingItemIndex].qty = totalQty;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          qty: quantity,
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity(1);
    setApiError('');
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.stock) {
      setApiError(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
      return;
    }

    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, qty: newQty } : item
      )
    );
    setApiError('');
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    if (!customerId) {
      setErrors({ customerId: 'Debe seleccionar un cliente' });
      return;
    }

    if (items.length === 0) {
      setErrors({ items: 'Debe agregar al menos un producto' });
      return;
    }

    // Validar stock antes de enviar
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && item.qty > product.stock) {
        setApiError(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.qty}`);
        return;
      }
    }

    try {
      const orderItems: CreateOrderItemRequest[] = items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
      }));

      const validatedData = createOrderSchema.parse({
        customerId: Number(customerId),
        items: orderItems,
      });

      setIsLoading(true);
      await orderService.create(validatedData);
      onSuccess();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setApiError(error instanceof Error ? error.message : 'Error al crear el pedido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Nuevo Pedido</h2>

      {apiError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value ? Number(e.target.value) : '');
              if (errors.customerId) {
                setErrors((prev) => ({ ...prev, customerId: '' }));
              }
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.customerId
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
            }`}
          >
            <option value="">Seleccione un cliente</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Productos</h3>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccione un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id} disabled={product.stock === 0}>
                    {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                max={selectedProductId ? products.find((p) => p.id === selectedProductId)?.stock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProductId || quantity <= 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>

          {errors.items && (
            <p className="mb-4 text-sm text-red-600">{errors.items}</p>
          )}

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateQuantity(item.productId, Number(e.target.value))
                          }
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                        ${(item.price * item.qty).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-2 text-right text-lg font-bold text-indigo-600">
                      ${calculateTotal().toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isLoading || items.length === 0}
          >
            {isLoading ? 'Creando...' : 'Crear Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
};
