import { useState, useEffect } from 'react';
import type { Customer, GetCustomersQuery } from '../types';
import { customerService } from '../services';
import { CustomerList } from '../components/customers/CustomerList';
import { CustomerFilters } from '../components/customers/CustomerFilters';
import { CustomerForm } from '../components/customers/CustomerForm';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [filters, setFilters] = useState<GetCustomersQuery>({
    limit: 10,
    offset: 0,
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await customerService.getAll(filters);
      setCustomers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  const handleFilterChange = (newFilters: GetCustomersQuery) => {
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
    setEditingCustomer(undefined);
    setShowForm(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await customerService.delete(id);
      await loadCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar cliente');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingCustomer(undefined);
    await loadCustomers();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(undefined);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Nuevo Cliente
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm ? (
        <CustomerForm
          customer={editingCustomer}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <CustomerFilters onFilterChange={handleFilterChange} />
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Cargando clientes...</p>
            </div>
          ) : (
            <CustomerList
              customers={customers}
              total={total}
              limit={filters.limit || 10}
              offset={filters.offset || 0}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};
