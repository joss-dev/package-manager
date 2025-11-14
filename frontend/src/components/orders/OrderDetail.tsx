import type { Order } from '../../types';
import { orderService } from '../../services';
import { useState } from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { ErrorModal } from '../common/ErrorModal';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export const OrderDetail = ({ order, onClose, onOrderUpdated }: OrderDetailProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      setError('');
      await orderService.confirm(order.id);
      setShowConfirmModal(false);
      onOrderUpdated();
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Error al confirmar pedido';
      setError(errorMessage);
      setShowConfirmModal(false);
      setShowErrorModal(true);
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full';
    if (status === 'CONFIRMED') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getStatusText = (status: string) => {
    return status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Detalle del Pedido #{order.id}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Creado el {new Date(order.createdAt).toLocaleString('es-AR')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">Cliente</p>
          <p className="font-semibold">{order.customer?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Estado</p>
          <span className={getStatusBadge(order.status)}>
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.product?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.product?.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ${(item.price ?? 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">
                      {item.qty ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      ${((item.price ?? 0) * (item.qty ?? 0)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No hay productos en este pedido
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-4 text-right text-base font-bold text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 text-right text-xl font-bold text-indigo-600">
                  ${(order.total ?? 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cerrar
        </button>
        {order.status === 'PENDING' && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isConfirming}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            Confirmar Pedido
          </button>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar Pedido"
        message="¿Está seguro de que desea confirmar este pedido? Esta acción no se puede deshacer."
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={isConfirming}
      />

      <ErrorModal
        isOpen={showErrorModal}
        title="Error al confirmar pedido"
        message={error}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};
