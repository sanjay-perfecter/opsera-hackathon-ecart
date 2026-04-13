import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import productService from '../services/productService';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { Card, Badge, Input, Select, Spinner, EmptyState, PageHeader, Toolbar } from '../components/ui';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ category, search }),
        productService.getCategories()
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    const params = {};
    if (newCategory) params.category = newCategory;
    if (search) params.search = search;
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    const newSearch = e.target.value;
    const params = {};
    if (category) params.category = category;
    if (newSearch) params.search = newSearch;
    setSearchParams(params);
  };

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product._id}`}>
      <Card hover padding={false} className="overflow-hidden h-full">
        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-6">{product.description}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-primary-700">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-slate-500">per {product.unit}</span>
          </div>
          {product.quantity === 0 ? (
            <Badge variant="danger" size="sm">Out of stock</Badge>
          ) : product.quantity < 10 ? (
            <Badge variant="warning" size="sm">Only {product.quantity} left!</Badge>
          ) : (
            <Badge variant="success" size="sm">In stock</Badge>
          )}
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Products"
          description="Browse inventory and find products quickly using search and filters."
        />

        {/* Filters */}
        <Toolbar
          left={
            <Card className="w-full" padding={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                <Input
                  label="Search"
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search products..."
                />
                <Select
                  label="Category"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            </Card>
          }
          right={
            !loading ? (
              <div className="text-sm text-slate-600">
                {products.length} product{products.length !== 1 ? 's' : ''}
              </div>
            ) : null
          }
        />

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="xl" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-6 w-6" aria-hidden="true" />}
            title="No products found"
            description="Try adjusting your filters or search terms"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
