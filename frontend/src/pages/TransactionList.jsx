import { useEffect, useState } from 'react';
import { getExpenses } from '../services/expenseService';
import {
  List, Typography, Button, Select, DatePicker, Row, Col, message, Divider, Tag
} from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      setExpenses(res.data);
      setFiltered(res.data);
    } catch {
      message.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // 👉 Apply filters
  useEffect(() => {
    let data = [...expenses];

    // Status Filter
if (statusFilter !== 'all') {
  data = data.filter(item => {
    if (item.paymentType === 'cash' || item.paymentType === 'online') {
      // Direct cash or online means bill cleared
      return statusFilter === 'Cleared';
    }

    // For installments, calculate remaining properly
    const totalPaid = item.installments?.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0) || 0;
    const remaining = item.amount - totalPaid;

    return (statusFilter === 'Cleared' && remaining <= 0) ||
           (statusFilter === 'Pending' && remaining > 0);
  });
}

    // Category Filter
    if (categoryFilter !== 'all') {
      data = data.filter(item => item.category === categoryFilter);
    }

    // Date Range Filter
    if (dateRange) {
      const [start, end] = dateRange;
      data = data.filter(item =>
        dayjs(item.date).isAfter(start.startOf('day')) &&
        dayjs(item.date).isBefore(end.endOf('day'))
      );
    }

    setFiltered(data);
  }, [statusFilter, categoryFilter, dateRange, expenses]);

  // 👉 Extract unique categories
  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))];

  // 👉 Calculate total
  const totalAmount = filtered.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', color: '#fff' }}>
      <Row justify="space-between" align="middle">
        <Col><Title level={3} style={{ color: '#fff' }}>July 2025</Title></Col>
        <Col><Title level={4} style={{ color: '#00ffcc' }}>₹{totalAmount}</Title></Col>
      </Row>

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%' }}
            placeholder="Status"
          >
            <Option value="all">All</Option>
            <Option value="Cleared">Cleared</Option>
            <Option value="Pending">Pending</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: '100%' }}
            placeholder="Payment Method"
          >
            <Option value="all">All Payment Methods</Option>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Col>
        <Col span={8}>
          <RangePicker
            style={{ width: '100%' }}
            onChange={(dates) => setDateRange(dates)}
          />
        </Col>
      </Row>

      <Divider style={{ borderColor: '#333' }} />

      {/* Expense List */}
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid #333',
              borderLeft: item.type === 'credit' ? '5px solid #7CFC00' : '5px solid #ff4d4f',
              borderRadius: 8,
              marginBottom: 12,
              padding: 16,
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
            actions={[
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/view/${item._id}`)}
              >
                View
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{item.title}</span>
                  <Tag color={item.status === 'Cleared' ? 'green' : 'orange'}>
                    {item.status}
                  </Tag>
                </div>
              }
              description={dayjs(item.date).format('DD MMM YYYY')}
            />
            <div style={{ fontWeight: 600 }}>
              {item.type === 'credit' ? `+₹${item.amount}` : `₹${item.amount}`}
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default ExpenseList;
