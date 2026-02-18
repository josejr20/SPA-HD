import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useCart } from "../../context/cartContext";
import "./Header.css";
import { getBusinessBasics } from "../../pages/Admin/components/JS/businessConfigService";

const MOBILE_BREAKPOINT = 768;

const Header = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, cartItemCount, totalCartPrice } =
    useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT,
  );
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token")),
  );
  const [businessName, setBusinessName] = useState("Relax Total");

  const navRef = useRef(null);

  const serviceCategories = useMemo(
    () => [
      { name: "Masajes", path: "/servicios/masajes" },
      { name: "Experiencias", path: "/servicios/experiencias" },
      { name: "Planes & Membresías", path: "/servicios/planes" },
    ],
    [],
  );

  const closeAllMenus = () => {
    setMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setIsServicesDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };

  const toggleCart = () => {
    setCartOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    closeAllMenus();
    navigate("/home");
  };

  // Detectar resize para modo mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Si pasa a desktop, cerramos menú hamburguesa para evitar bugs visuales
      if (!mobile) setMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Leer token (login) cuando se monta
  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  // Traer nombre del negocio una sola vez
  useEffect(() => {
    const fetchBusinessName = async () => {
      try {
        const data = await getBusinessBasics();
        if (data?.nombreSpa) setBusinessName(data.nombreSpa);
      } catch (error) {
        console.error("Error al cargar el nombre del spa:", error);
      }
    };

    fetchBusinessName();
  }, []);

  // Cerrar dropdowns al hacer click fuera del nav
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenServicesDropdown = () => {
    setIsServicesDropdownOpen((prev) => !prev);
    setIsUserDropdownOpen(false);
  };

  const handleOpenUserDropdown = () => {
    setIsUserDropdownOpen((prev) => !prev);
    setIsServicesDropdownOpen(false);
  };

  const handleNavigateAndClose = () => {
    closeAllMenus();
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <NavLink to="/" onClick={handleNavigateAndClose}>
              <h1>{businessName}</h1>
            </NavLink>
          </div>

          {/* Icono Hamburguesa */}
          <button
            type="button"
            className="menu-icon"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
          </button>

          {/* Navegación */}
          <nav
            ref={navRef}
            className={`nav ${menuOpen ? "active" : ""}`}
            onMouseLeave={() => {
              if (!isMobile) setIsServicesDropdownOpen(false);
            }}
          >
            <NavLink
              to="/reserva"
              className="nav-link"
              onClick={handleNavigateAndClose}
            >
              Reserva
            </NavLink>

            {/* Servicios */}
            <div
              className={`nav-link dropdown-item ${
                isMobile && isServicesDropdownOpen ? "mobile-open" : ""
              }`}
              onMouseEnter={() => {
                if (!isMobile) {
                  setIsServicesDropdownOpen(true);
                  setIsUserDropdownOpen(false);
                }
              }}
              onClick={() => {
                if (isMobile) handleOpenServicesDropdown();
              }}
            >
              <div className="dropdown-title">
                <span>Servicios</span>
              </div>

              {isServicesDropdownOpen && (
                <ul className="dropdown-menu">
                  {serviceCategories.map((category) => (
                    <li key={category.path}>
                      <Link
                        to={category.path}
                        onClick={() => {
                          handleNavigateAndClose();
                          setIsServicesDropdownOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <NavLink
              to="/nosotros"
              className="nav-link"
              onClick={handleNavigateAndClose}
            >
              Nosotros
            </NavLink>

            <NavLink
              to="/contact"
              className="nav-link"
              onClick={handleNavigateAndClose}
            >
              Contacto
            </NavLink>

            {isLoggedIn && (
              <NavLink
                to="/mis-pedidos"
                className="nav-link"
                onClick={handleNavigateAndClose}
              >
                Mis pedidos
              </NavLink>
            )}

            {/* Login / Usuario */}
            {isLoggedIn ? (
              <div className="nav-link user-menu">
                <span
                  onClick={handleOpenUserDropdown}
                  className="nav-cta-logged-in"
                >
                  Bienvenido
                </span>

                {isUserDropdownOpen && (
                  <ul className="dropdown-menu user-dropdown">
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        Cerrar Sesión
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="nav-link nav-cta"
                onClick={handleNavigateAndClose}
              >
                Inicia sesión
              </NavLink>
            )}

            {/* Carrito */}
            <button
              type="button"
              className="cart-icon"
              onClick={toggleCart}
              aria-label="Abrir carrito"
            >
              <AiOutlineShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Sidebar Carrito */}
      <div className={`cart-sidebar ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Tu carrito</h2>
          <FaTimes size={22} className="close-cart" onClick={toggleCart} />
        </div>

        <div className="cart-content">
          {cartItemCount === 0 ? (
            <p>Tu carrito está vacío</p>
          ) : (
            cartItems.map((item) => {
              const rawPrice =
                item.precio !== undefined ? item.precio : item.price;

              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-details">
                    <p>{item.name || item.title}</p>

                    <span>
                      {typeof rawPrice === "number"
                        ? `S/ ${rawPrice.toFixed(2)}`
                        : rawPrice}
                    </span>
                  </div>

                  <FaTimes
                    size={18}
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                  />
                </div>
              );
            })
          )}
        </div>

        {cartItemCount > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total:</strong>
              <strong>S/ {totalCartPrice.toFixed(2)}</strong>
            </div>

            <button
              className="checkout-btn"
              onClick={() => {
                navigate("/checkout");
                setCartOpen(false);
              }}
            >
              Pagar ahora
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
