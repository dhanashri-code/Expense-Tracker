import { useEffect, useState } from 'react';
import { getExpenses } from '../services/expenseService';
import {
  List, Typography, Button, Select, DatePicker, Row, Col, message, Divider
} from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
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

    if (statusFilter !== 'all') {
      data = data.filter(item => {
        if (item.type !== 'credit') return false;
        const remaining = item.remaining ?? item.amount - (item.totalPaid || 0);
        return (statusFilter === 'Cleared' && remaining <= 0) ||
          (statusFilter === 'Pending' && remaining > 0);
      });
    }

    if (categoryFilter) {
      data = data.filter(item => item.category === categoryFilter);
    }

    if (dateRange) {
      const [start, end] = dateRange;
      data = data.filter(item => dayjs(item.date).isAfter(start) && dayjs(item.date).isBefore(end));
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
            style={{ backgroundColor: '#1f1f1f', color: "#ff", width: '100%' }}
            dropdownStyle={{ backgroundColor: '#141414', color: '#fff' }}
            allowClear
            placeholder="Payment Method"
          >
            <Option value="all" selected>Payment Methods</Option>
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
              color: item.type === 'credit' ? '#7CFC00' : '#fff',
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
              title={<span style={{ fontWeight: 500 }}>{item.title}</span>}
              description={dayjs(item.date).format('DD MMM')}
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
