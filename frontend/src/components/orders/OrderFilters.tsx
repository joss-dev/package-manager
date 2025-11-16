import { useState, useEffect } from 'react';
import type { GetOrdersQuery, OrderStatus, Customer } from '../../types';
import { customerService } from '../../services';

interface OrderFiltersProps {
  onFilterChange: (filters: GetOrdersQuery) => void;
}

export const OrderFilters = ({ onFilterChange }: OrderFiltersProps) => {
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customerService.getAll({ limit: 100 });
        setCustomers(response.data);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    onFilterChange({
      status: status || undefined,
      customerId: customerId || undefined,
    });
  }, [status, customerId]);

  const handleSearch = () => {
    onFilterChange({
      status: status || undefined,
      customerId: customerId || undefined,
    });
  };

  const handleClear = () => {
    setStatus('');
    setCustomerId('');
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <input
            type="text"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
              if (e.target.value === '') {
                setCustomerId('');
              }
            }}
            onFocus={() => setShowCustomerDropdown(true)}
            onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
            placeholder="Buscar cliente o ver todos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {showCustomerDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <div
                onClick={() => {
                  setCustomerId('');
                  setCustomerSearch('');
                  setShowCustomerDropdown(false);
                }}
                className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b font-medium text-gray-700"
              >
                Todos los clientes
              </div>
              {customers
                .filter((c) =>
                  customerSearch === '' ||
                  c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                  c.email.toLowerCase().includes(customerSearch.toLowerCase())
                )
                .map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => {
                      setCustomerId(customer.id);
                      setCustomerSearch(`${customer.name}`);
                      setShowCustomerDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </div>
                ))}
              {customers.filter((c) =>
                customerSearch === '' ||
                c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                c.email.toLowerCase().includes(customerSearch.toLowerCase())
              ).length === 0 && customerSearch !== '' && (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No se encontraron clientes
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Buscar
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};
