import React, { useEffect, useState } from 'react';
import { Collapse, List, Typography, Spin, Empty, Row, Col, Tag } from 'antd';
import { getGroupedExpenses } from '../services/expenseService';
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

export default function GroupedTransactions() {
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGroupedExpenses();

        // Sort groups by latest transaction date
        const sortedData = Array.isArray(data)
          ? data.sort((a, b) => {
              const latestA = new Date(
                Math.max(...a.transactions.map((tx) => new Date(tx.date)))
              );
              const latestB = new Date(
                Math.max(...b.transactions.map((tx) => new Date(tx.date)))
              );
              return latestB - latestA; // Descending order
            })
          : [];

        setGrouped(sortedData);
      } catch (err) {
        console.error('Error fetching grouped expenses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get status tag
  const getStatusTag = (tx) => {
    // Automatically mark as CLEARED for cash or online
    if (['cash', 'online'].includes(tx.paymentType?.toLowerCase())) {
      return (
        <Tag color="green" style={{ fontWeight: 'bold', fontSize: '14px' }}>
          CLEARED
        </Tag>
      );
    }
    if (!tx.status) return <Tag color="blue">Pending</Tag>;

    switch (tx.status.toLowerCase()) {
      case 'completed':
        return <Tag color="green">Completed</Tag>;
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'failed':
        return <Tag color="red">Failed</Tag>;
      default:
        return <Tag color="blue">{tx.status}</Tag>;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ color: '#fff', marginBottom: '20px' }}>
        Grouped Transactions
      </Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : grouped.length === 0 ? (
        <Empty description="No grouped transactions found" style={{ color: '#fff' }} />
      ) : (
        <Collapse
          accordion
          bordered={false}
          style={{
            background: '#1f1f1f',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
        >
          {grouped.map((group, index) => (
            <Panel
              header={
                <Text strong style={{ fontSize: '18px', color: '#fff' }}>
                  {group.title}{' '}
                  <span style={{ color: '#bbb' }}>
                    ({group.transactions.length})
                  </span>
                </Text>
              }
              key={index}
              style={{
                background: '#1f1f1f',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            >
              <List
                dataSource={
                  [...group.transactions].sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                  )
                }
                renderItem={(tx) => (
                  <List.Item
                    style={{
                      borderBottom: '1px solid #333',
                      padding: '12px 0',
                    }}
                  >
                    <div
                      onClick={() => navigate(`/view/${tx._id}`)}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'background 0.3s',
                        padding: '8px',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#333')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <Row justify="space-between" align="middle">
                        {/* Amount */}
                        <Col span={6} style={{ textAlign: 'center' }}>
                          <Text strong style={{ color: '#fff' }}>
                            ₹{tx.amount.toLocaleString()}
                          </Text>
                        </Col>

                        {/* Type */}
                        <Col span={6} style={{ textAlign: 'center' }}>
                          <Text
                            strong
                            style={{
                              color:
                                tx.type === 'credit'
                                  ? '#4caf50'
                                  : '#f44336',
                              textTransform: 'capitalize',
                            }}
                          >
                            {tx.type}
                          </Text>
                        </Col>

                        {/* Date */}
                        <Col span={6} style={{ textAlign: 'center' }}>
                          <Text style={{ color: '#ccc' }}>
                            {new Date(tx.date).toLocaleDateString()}
                          </Text>
                        </Col>

                        {/* Status */}
                        <Col span={6} style={{ textAlign: 'center' }}>
                          {getStatusTag(tx)}
                        </Col>
                      </Row>
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      )}
    </div>
  );
}
