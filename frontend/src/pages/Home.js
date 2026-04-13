import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { Card, Badge, Button, Spinner } from '../components/ui';

const Home = () => {
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    try {
      setLoading(true);

      // First fetch all categories
      const categoriesRes = await productService.getCategories();
      const categories = categoriesRes.data.categories;

      // Then fetch products for each category (limit 4 per category)
      const categoryPromises = categories.map(async (category) => {
        const productsRes = await productService.getProducts({
          category: category.slug,
          limit: 4
        });
        return {
          category,
          products: productsRes.data.products
        };
      });

      const results = await Promise.all(categoryPromises);
      // Filter out categories with no products
      setCategoriesWithProducts(results.filter(item => item.products.length > 0));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product._id}`}>
      <Card hover padding={false} className="overflow-hidden h-full">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
            }}
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500">per {product.unit}</span>
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Fresh Products <br className="hidden sm:block" />Delivered Daily
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-50 max-w-3xl mx-auto">
              Delivered straight from the farm to your doorstep. 100% fresh, organic, and locally sourced.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" variant="inverse" className="shadow-xl">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 text-3xl mb-6">
                🚚
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600 text-lg">Get your fresh produce delivered within 24 hours to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 text-green-600 text-3xl mb-6">
                🌱
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">100% Fresh</h3>
              <p className="text-gray-600 text-lg">All products sourced directly from local organic farms</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-600 text-3xl mb-6">
                💰
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Best Prices</h3>
              <p className="text-gray-600 text-lg">Competitive prices with no hidden charges or fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="xl" />
        </div>
      ) : (
        categoriesWithProducts.map((item, index) => (
          <div
            key={item.category._id}
            className={`py-20 ${index % 2 === 0 ? 'bg-gradient-to-b from-gray-50 to-white' : 'bg-white'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl font-bold text-gray-900">Fresh {item.category.name}</h2>
                <Link to={`/products?category=${item.category.slug}`}>
                  <Button variant="ghost" size="lg">
                    View All →
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {item.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to eat fresh and healthy?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us for their daily fresh produce needs
          </p>
          <Link to="/products">
            <Button size="lg" variant="inverse" className="shadow-xl">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
