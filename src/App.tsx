import { useEffect, useState } from 'react';
import { Product, CartItem, Sale, ShopInfo } from './types';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import ProductForm from './components/ProductForm';
import EditProductForm from './components/EditProductForm';
import Receipt from './components/Receipt';
import SalesJournal from './components/SalesJournal';
import ShopSettings from './components/ShopSettings';
import { History, Plus, Home, Store } from 'lucide-react';
import './index.css';

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  });

  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => {
    const saved = localStorage.getItem('shopInfo');
    return saved ? JSON.parse(saved) : {
      name: 'SimplePay',
      address: '',
      phone: '',
      email: ''
    };
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [showSalesJournal, setShowSalesJournal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showShopSettings, setShowShopSettings] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('shopInfo', JSON.stringify(shopInfo));
  }, [shopInfo]);

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
    };
    setProducts([...products, newProduct]);
    setShowProductForm(false);
  };

  const handleEditProduct = (productData: Product) => {
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === productData.id ? productData : p
      )
    );
    setEditingProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { productId: product.id, quantity: 1 }];
    });
    
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    if (item) {
      setProducts(currentProducts =>
        currentProducts.map(p =>
          p.id === productId ? { ...p, stock: p.stock + item.quantity } : p
        )
      );
    }
    setCart(currentCart => currentCart.filter(item => item.productId !== productId));
  };

  const handleCheckout = (amountPaid: number, change: number, customerName: string) => {
    const total = cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const sale: Sale = {
      id: crypto.randomUUID(),
      items: [...cart],
      total,
      timestamp: Date.now(),
      payment: {
        amountPaid,
        change
      },
      notes: amountPaid >= total ? 'Lunas' : 'Dp',
      customerName
    };

    setSales([...sales, sale]);
    setCart([]);
    setShowReceipt(sale);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    setSales(currentSales =>
      currentSales.map(sale =>
        sale.id === updatedSale.id ? updatedSale : sale
      )
    );
  };

  const handleGoHome = () => {
    setShowSalesJournal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{shopInfo.name}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShopSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Store size={20} />
                <span>Data Toko</span>
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Input Produk</span>
              </button>
              <button
                onClick={() => setShowSalesJournal(!showSalesJournal)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History size={20} />
                <span>Data Penjualan</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-6 px-4">
            {showSalesJournal ? (
              <SalesJournal 
                sales={sales} 
                products={products}
                onUpdateSale={handleUpdateSale}
              />
            ) : (
              <>
                <ProductList
                  products={products}
                  onAddToCart={handleAddToCart}
                  onEditProduct={setEditingProduct}
                />
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-80">
        <Cart
          items={cart}
          products={products}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
      </div>
      {showReceipt && (
        <Receipt
          sale={showReceipt}
          products={products}
          shopInfo={shopInfo}
          onClose={() => setShowReceipt(null)}
        />
      )}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Input Produk</h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <ProductForm onSubmit={handleAddProduct} />
            </div>
          </div>
        </div>
      )}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Edit Produk</h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4">
              <EditProductForm
                product={editingProduct}
                onSubmit={handleEditProduct}
              />
            </div>
          </div>
        </div>
      )}
      {showShopSettings && (
        <ShopSettings
          shopInfo={shopInfo}
          onSave={setShopInfo}
          onClose={() => setShowShopSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
