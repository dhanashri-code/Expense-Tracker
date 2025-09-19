import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday'; // ✅ plugin needed
import localeData from 'dayjs/plugin/localeData';

dayjs.extend(weekday);
dayjs.extend(localeData);

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TransactionList from './pages/TransactionList';
import TransactionDetails from './pages/TransactionDetails';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditTransaction';
import GroupedTransactions from './pages/GroupedTransactions';

const { Header, Content } = Layout;

const App = () => {
  return (
    <Layout>
      <Header style={{ background: '#001529' }}>
        <Navbar />
      </Header>
      <Content style={{ padding: '24px' }}>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/addExpense" element={<AddExpense />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/list" element={<TransactionList />} />
          <Route path="/grouped-transactions" element={<GroupedTransactions />} />
          <Route path="/edit/:id" element={<EditExpense />} />
          <Route path="/view/:id" element={<TransactionDetails />} />

        </Routes>
      </Content>
    </Layout>
  );
};

export default App;
