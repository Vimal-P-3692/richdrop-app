import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct";
import AdminOrders from "./pages/AdminOrders";
import ProductManagement from "./pages/ProductManagement"; // 🛠 NEW

// User
import UserDashboard from "./pages/UserDashboard";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// 404 Page
function NotFound() {
  return (
    <div className="p-10 text-center text-xl">
      ❌ Page Not Found
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🏠 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔐 Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRole="admin">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* 🛠 Product Management (NEW 🔥) */}
        <Route
          path="/product-management"
          element={
            <ProtectedRoute allowedRole="admin">
              <ProductManagement />
            </ProtectedRoute>
          }
        />

        {/* 🧑‍💼 Admin Orders */}
        <Route
          path="/admin-orders"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        {/* 🔐 User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="user">
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 📦 Orders */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRole="user">
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRole="user">
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* 🛍️ Product */}
        <Route path="/product/:id" element={<ProductDetails />} />

        {/* 🛒 Cart */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRole="user">
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* 💳 Checkout */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRole="user">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* ❌ 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;