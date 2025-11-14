import { useState } from 'react';
import type { Order } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface OrderListProps {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
  onView: (order: Order) => void;
  onConfirm: (id: number) => void;
  onPageChange: (newOffset: number) => void;
}

export const OrderList = ({
  orders,
  total,
  limit,
  offset,
  onView,
  onConfirm,
  onPageChange,
}: OrderListProps) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<number | null>(null);
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePrevious = () => {
    if (offset > 0) {
      onPageChange(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    if (offset + limit < total) {
      onPageChange(offset + limit);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    if (status === 'CONFIRMED') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getStatusText = (status: string) => {
    return status === 'CONFIRMED' ? 'Confirmado' : 'Pendiente';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.customer.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onView(order)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Ver
                  </button>
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => {
                        setOrderToConfirm(order.id);
                        setShowConfirmModal(true);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      Confirmar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron pedidos
        </div>
      )}

      {total > 0 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {offset + 1} - {Math.min(offset + limit, total)} de {total} pedidos
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={offset === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={offset + limit >= total}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar Pedido"
        message="¿Está seguro de que desea confirmar este pedido? Esta acción no se puede deshacer."
        onConfirm={() => {
          if (orderToConfirm) {
            onConfirm(orderToConfirm);
            setShowConfirmModal(false);
            setOrderToConfirm(null);
          }
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setOrderToConfirm(null);
        }}
      />
    </div>
  );
};
