import { useState, useEffect } from 'react';
import { productService } from '../services';
import type { Product, GetProductsQuery, ApiError } from '../types';
import { ProductList } from '../components/products/ProductList';
import { ProductForm } from '../components/products/ProductForm';
import { ProductFilters } from '../components/products/ProductFilters';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<GetProductsQuery>({
    limit: 10,
    offset: 0,
    order: 'asc',
    sortBy: 'id',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productService.getAll(filters);
      setProducts(response.data);
      setTotal(response.total);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete === null) return;
    
    setDeleting(true);
    try {
      await productService.delete(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.statusCode === 500 
        ? 'No se puede eliminar el producto porque tiene órdenes asociadas'
        : (apiError.message || 'Error al eliminar producto');
      setError(errorMessage);
      setShowDeleteModal(false);
      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestiona el inventario de productos
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Producto
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showForm ? (
          <ProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : (
          <div className="space-y-6">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
            <ProductList
              products={products}
              loading={loading}
              total={total}
              filters={filters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          title="Eliminar Producto"
          message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isLoading={deleting}
        />
      </div>
    </div>
  );
};
