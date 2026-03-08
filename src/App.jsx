import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { BrandingProvider } from './context/BrandingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import SuccessPage from './pages/SuccessPage';
import CancelOrderPage from './pages/CancelOrderPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  return (
    <BrowserRouter>
      <BrandingProvider>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/cancel-order" element={<CancelOrderPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  </Routes>
                </div>
                <Footer />
                <CartDrawer />
                <Toast />
              </div>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </BrandingProvider>
    </BrowserRouter>
  );
}

export default App;