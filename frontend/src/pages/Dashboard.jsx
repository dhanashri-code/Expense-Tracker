import { useEffect, useState } from 'react';
import { getExpenses } from '../services/expenseService';
import {
  Card, Row, Col, Typography, Statistic, message, DatePicker
} from 'antd';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid
} from 'recharts';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);

  const countCredit = filtered.filter(e => e.type === 'credit').length;
  const countDebit = filtered.filter(e => e.type === 'debit').length;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getExpenses();
        setExpenses(res.data);
        setFiltered(res.data);
      } catch {
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!dateRange) {
      setFiltered(expenses);
    } else {
      const [start, end] = dateRange;
      const filteredData = expenses.filter(e =>
        dayjs(e.date).isAfter(start.startOf('day')) &&
        dayjs(e.date).isBefore(end.endOf('day'))
      );
      setFiltered(filteredData);
    }
  }, [dateRange, expenses]);

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = filtered.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
  const totalDebit = filtered.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);

  const monthlyMap = {};
  filtered.forEach(e => {
    const month = dayjs(e.date).format('MMM YYYY');
    if (!monthlyMap[month]) monthlyMap[month] = 0;
    monthlyMap[month] += e.amount;
  });
  const monthlyData = Object.keys(monthlyMap).map(month => ({
    month,
    amount: monthlyMap[month]
  }));

  const categoryMap = {};
  filtered.forEach(e => {
    if (!e.category) return;
    if (!categoryMap[e.category]) categoryMap[e.category] = 0;
    categoryMap[e.category] += e.amount;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#ff4d4f', '#a0d911'];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }} wrap>
        <Col>
          <Title level={2} style={{ color: '#00ffe1' }}>Dashboard Overview</Title>
        </Col>
        <Col>
          <RangePicker
            onChange={setDateRange}
            style={{ backgroundColor: '#141414' }}
            allowClear
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card loading={loading} style={{ backgroundColor: '#141414', borderRadius: 10 }}>
            <Statistic title="Total Transactions" value={totalAmount} prefix="₹" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card loading={loading} style={{ backgroundColor: '#141414', borderRadius: 10 }}>
            <Statistic title="Total Debit" value={totalDebit} prefix="₹" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card loading={loading} style={{ backgroundColor: '#141414', borderRadius: 10 }}>
            <Statistic title="Total Credit" value={totalCredit} prefix="₹" valueStyle={{ color: '#73d13d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card loading={loading} style={{ backgroundColor: '#141414', borderRadius: 10 }}>
            <Statistic
              title="Debit / Credit Count"
              value={`${countDebit} / ${countCredit}`}
              valueStyle={{ color: '#00eaff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
        <Col xs={24} lg={12}>
          <Card title="Monthly Transactions" style={{ backgroundColor: '#1e1e1e', borderRadius: 10 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="amount" fill="#3a9152ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Category Distribution" style={{ backgroundColor: '#1e1e1e', borderRadius: 10 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
