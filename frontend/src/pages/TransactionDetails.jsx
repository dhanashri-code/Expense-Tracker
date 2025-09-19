import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Button, Popconfirm, Divider, List,
  Modal, Form, InputNumber, Input, message, Space, Progress
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { getExpenses, deleteExpense, addInstallment } from '../services/expenseService';

const { Title, Text } = Typography;

const ViewExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [installmentLoading, setInstallmentLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch Expense
  const fetchExpense = async () => {
    setLoading(true);
    try {
      const res = await getExpenses();
      const found = res.data.find(e => e._id === id);
      if (!found) throw new Error('Expense not found');
      setExpense(found);
    } catch (err) {
      message.error(err.message || 'Failed to load expense');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

  // Delete expense
  const handleDelete = async () => {
    try {
      await deleteExpense(id);
      message.success('Expense deleted successfully');
      navigate('/');
    } catch {
      message.error('Delete failed');
    }
  };

  // Add installment
  const handleAddInstallment = async (values) => {
    setInstallmentLoading(true);
    try {
      // send as paidAmount
      await addInstallment(id, { ...values, paidAmount: values.amount });
      message.success('Installment added');
      form.resetFields();
      setModalOpen(false);
      fetchExpense();
    } catch (err) {
      message.error('Failed to add installment');
    } finally {
      setInstallmentLoading(false);
    }
  };

  if (!expense) return null;

  const isCleared = ['cash', 'online'].includes(expense.paymentType?.toLowerCase()) ||
    expense.remaining <= 0;

  const allowInstallments = expense.paymentType?.toLowerCase() === 'installment';

  return (
    <div style={{ maxWidth: 750, margin: '10px auto', padding: 14 }}>
      <Card
        loading={loading}
        style={{
          backgroundColor: '#1e1e1e',
          color: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 15px rgba(0,0,0,0.4)',
        }}
        bordered={false}
      >
        {/* CLEARED Banner */}
        {isCleared && (
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Title level={3} style={{ color: '#2cba30ff', fontWeight: 'bold', margin: 0 }}>
              CLEARED
            </Title>
          </Row>
        )}

        {/* Header Section */}
        <Row justify="space-between" align="middle" gutter={[16, 16]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} md={14}>
            <Title level={3} style={{ color: '#00ffe1', marginBottom: 4 }}>{expense.title}</Title>
          </Col>

          <Col xs={24} sm={12} md={10} style={{ textAlign: 'right' }}>
            <Tag color={expense.type === 'credit' ? 'green' : 'red'} style={{ marginRight: 8, padding: "2px 8px" }}>
              {expense.type.toUpperCase()}
            </Tag>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/edit/${expense._id}`)}
              style={{ marginRight: 8 }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete this expense?"
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>
          </Col>

          <Col xs={24} style={{ textAlign: 'right' }}>
            <Title level={3} style={{ color: '#1890ff', margin: 0 }}>₹{expense.amount.toLocaleString()}</Title>
          </Col>
        </Row>

        <Divider style={{ borderColor: '#333' }} />

        {/* Details Section */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text type="secondary">Category</Text><br />
            <Text>{expense.category || 'Not specified'}</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">Date</Text><br />
            <Text style={{ color: '#ffcc00' }}>{dayjs(expense.date).format('DD MMM YYYY')}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Payment Type</Text><br />
            <Tag color="blue">{expense.paymentType || 'Not specified'}</Tag>
          </Col>

          <Col span={12}>
            <Text type="secondary">Status</Text><br />
            <Tag color={isCleared ? 'green' : 'orange'}>
              {isCleared ? 'CLEARED' : 'PENDING'}
            </Tag>
          </Col>

          {allowInstallments && (
            <>
              <Col span={12}>
                <Text type="secondary">Total Paid</Text><br />
                <Text style={{ color: '#66ff66' }}>₹{expense.totalPaid.toLocaleString()}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">Remaining</Text><br />
                <Text style={{ color: '#ff6666' }}>₹{expense.remaining.toLocaleString()}</Text>
              </Col>
            </>
          )}
        </Row>

        {/* Installments Section */}
        {allowInstallments && (
          <>
            <Divider style={{ borderColor: '#333' }} />
            <Title level={5} style={{ color: '#7CFC00', marginBottom: 12 }}>Installments</Title>

            <Progress
              percent={Math.min(100, Math.round((expense.totalPaid / expense.amount) * 100))}
              status={isCleared ? 'success' : 'active'}
              strokeColor={isCleared ? '#52c41a' : '#faad14'}
            />

            <List
              dataSource={expense.installments}
              bordered
              style={{ backgroundColor: '#141414', borderRadius: 8, marginTop: 16 }}
              renderItem={(i, index) => (
                <List.Item style={{ color: '#fff' }}>
                  <Text>
                    {index + 1}. ₹{i.paidAmount} — {i.note || 'No note'}{' '}
                    <span style={{ color: '#999' }}>
                      ({dayjs(i.date).format('DD MMM YYYY')})
                    </span>
                  </Text>
                </List.Item>
              )}
              locale={{ emptyText: 'No installments yet.' }}
            />

            <Button
              icon={<PlusOutlined />}
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => setModalOpen(true)}
              disabled={isCleared}
            >
              Add Installment
            </Button>
          </>
        )}

        <Divider style={{ borderColor: '#333' }} />

        {/* Back Button */}
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Back</Button>
        </Space>
      </Card>

      {/* Modal for Adding Installment */}
      <Modal
        open={modalOpen}
        title="Add Installment"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAddInstallment}>
          <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Amount is required' }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="Enter amount" />
          </Form.Item>

          <Form.Item label="Note" name="note">
            <Input placeholder="Optional note" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={installmentLoading} block>
              Add Installment
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ViewExpense;
