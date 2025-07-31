import { useEffect, useState } from 'react';
import { Button, Card, Typography, List, Tag, Row, Col, Divider, message } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { getExpenses } from '../services/expenseService';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Home = () => {
  const [latestExpenses, setLatestExpenses] = useState([]);
  const navigate = useNavigate();

  const fetchLatestExpenses = async () => {
    try {
      const res = await getExpenses();
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLatestExpenses(sorted.slice(0, 4));
    } catch {
      message.error('Failed to fetch latest expenses');
    }
  };

  useEffect(() => {
    fetchLatestExpenses();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Row justify="space-between" align="middle">
        <Col><Title level={2} style={{ color: '#00ffe1' }}>Welcome to Transaction Tracker</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/addExpense')}>
            Add Transaction
          </Button>
        </Col>
      </Row>

      <Divider style={{ borderColor: '#333' }} />

      <Card
        title="Latest Transaction"
        extra={<Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/list')}>View All</Button>}
        style={{ backgroundColor: '#1e1e1e', borderRadius: 10 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={latestExpenses}
          renderItem={(item) => (
            <List.Item
              onClick={() => navigate(`/view/${item._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={
                  <span style={{ fontWeight: 500, color: '#fff' }}>{item.title}</span>
                }
                description={dayjs(item.date).format('DD MMM YYYY')}
              />
              <div>
                <Tag color={item.type === 'credit' ? 'green' : 'red'}>
                  {item.type.toUpperCase()}
                </Tag>
                <Text style={{ marginLeft: 10, fontWeight: 600 }}>
                  ₹{item.amount}
                </Text>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: 'No Transaction found' }}
        />
      </Card>
    </div>
  );
};

export default Home;
