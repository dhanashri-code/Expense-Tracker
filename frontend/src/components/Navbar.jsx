import React from 'react';
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,
    BarChartOutlined,
    OrderedListOutlined,
} from '@ant-design/icons';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const selectedKey = location.pathname;

    const items = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Home',
        },

        {
            key: '/list',
            icon: <OrderedListOutlined />,
            label: 'List of Expenses'
        },

        {
            key: '/dashboard',
            icon: <BarChartOutlined />,
            label: 'Dashboard',
        },

    ];

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={({ key }) => navigate(key)}
        />
    );
};

export default Navbar;
