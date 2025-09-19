import React, { useState, useEffect } from 'react';
import { Menu, Drawer, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  BarChartOutlined,
  OrderedListOutlined,
  MenuOutlined,
} from '@ant-design/icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const selectedKey = location.pathname;

  const items = [
    { key: '/', icon: <HomeOutlined />, label: 'Home' },
    { key: '/list', icon: <OrderedListOutlined />, label: 'List of Expenses' },
    { key: '/grouped-transactions', icon: <OrderedListOutlined />, label: 'Transactions in Group' },
    { key: '/dashboard', icon: <BarChartOutlined />, label: 'Dashboard' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setOpen(false);
  };

  // Detect scroll to resize navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        backgroundColor: scrolled ? '#000c17' : '#001529',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      {/* Logo with scroll animation */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img
          src="/logo.png" // Put logo in public folder as /public/logo.png
          alt="Logo"
          style={{
            height: scrolled ? '32px' : '48px',
            width: 'auto',
            marginRight: '10px',
            transition: 'height 0.3s ease',
          }}
        />
      </div>

      {/* Desktop Menu */}
      <div className="desktop-menu" style={{ display: 'none', flex: 1, marginLeft: 20 }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={handleMenuClick}
        />
      </div>

      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-button"
        type="text"
        icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />}
        onClick={() => setOpen(true)}
      />

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
      >
        <Menu
          mode="vertical"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={handleMenuClick}
        />
      </Drawer>

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu {
            display: block !important;
          }
          .mobile-menu-button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
