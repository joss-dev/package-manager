import { useState, useEffect } from 'react';
import type { Order, GetOrdersQuery } from '../types';
import { orderService } from '../services';
import { OrderList } from '../components/orders/OrderList';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrderForm } from '../components/orders/OrderForm';
import { OrderDetail } from '../components/orders/OrderDetail';
import { ErrorModal } from '../components/common/ErrorModal';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState<GetOrdersQuery>({
    limit: 10,
    offset: 0,
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderService.getAll(filters);
      setOrders(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters: GetOrdersQuery) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0,
    }));
  };

  const handlePageChange = (offset: number) => {
    setFilters((prev) => ({ ...prev, offset }));
  };

  const handleCreate = () => {
    setShowForm(true);
  };

  const handleView = async (order: Order) => {
    try {
      setLoadingDetail(true);
      setError('');
      const fullOrder = await orderService.getById(order.id);
      console.log('Loaded order detail:', fullOrder);
      console.log('OrderItems:', fullOrder.orderItems);
      setSelectedOrder(fullOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalle del pedido');
      console.error('Error loading order detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await orderService.confirm(id);
      await loadOrders();
    } catch (err: unknown) {
      const errorMessage = (err as { message?: string })?.message || 'Error al confirmar pedido';
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    await loadOrders();
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDetailClose = () => {
    setSelectedOrder(undefined);
  };

  const handleOrderUpdated = async () => {
    setSelectedOrder(undefined);
    await loadOrders();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        {!showForm && !selectedOrder && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Nuevo Pedido
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm ? (
        <OrderForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      ) : loadingDetail ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando detalle del pedido...</p>
        </div>
      ) : selectedOrder ? (
        <OrderDetail
          order={selectedOrder}
          onClose={handleDetailClose}
          onOrderUpdated={handleOrderUpdated}
        />
      ) : (
        <>
          <OrderFilters onFilterChange={handleFilterChange} />
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : (
            <OrderList
              orders={orders}
              total={total}
              limit={filters.limit || 10}
              offset={filters.offset || 0}
              onView={handleView}
              onConfirm={handleConfirm}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <ErrorModal
        isOpen={showErrorModal}
        title="Error al confirmar pedido"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};
