import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, DatePicker, Button, Typography, message, Tooltip
} from 'antd';
import { addExpense } from '../services/expenseService';
import dayjs from 'dayjs';
import { InfoCircleOutlined } from '@ant-design/icons';
import { predictCategory } from "../utils/predictCategory";

const { Title } = Typography;
const { Option } = Select;

const AddExpense = () => {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [predictedCategory, setPredictedCategory] = useState(''); // <-- NEW
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formatted = {
        ...values,
        // auto-fill predicted category if category field is empty
        category: values.category || predictedCategory,
        paymentType: values.paymentType,
        totalInstallments:
          values.paymentType === 'installment' && values.type === 'debit'
            ? Number(values.totalInstallments || 0)
            : 0,
        date: values.date.toISOString(),
      };
      console.log("predicted category",predictedCategory);
      await addExpense(formatted);
      message.success('Expense added successfully');
      navigate('/');
    } catch (err) {
      message.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  // handle input change for prediction
  const handleTitleChange = async (e) => {
  const value = e.target.value;
  try {
    const predicted = await predictCategory(value); // wait for API response
    setPredictedCategory(predicted);
  } catch (err) {
    console.error("Prediction failed:", err);
    setPredictedCategory('');
  }
};


  return (
    <div style={{
      maxWidth: 600,
      margin: '40px auto',
      background: '#141414',
      padding: 24,
      borderRadius: 10,
      color: '#f0f0f0'
    }}>
      <Title level={3} style={{ color: '#f0f0f0' }}>Add New Transaction</Title>

      <Form layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs() }}>
        {/* Title input with prediction */}
        <Form.Item
          label={<span style={{ color: '#f0f0f0' }}>Title</span>}
          name="title"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Enter expense title"
            style={{ color: '#fff', backgroundColor: '#1f1f1f' }}
            onChange={handleTitleChange}
          />
        </Form.Item>

        {/* Show predicted category */}
        {predictedCategory && (
          <div style={{
            marginBottom: 16,
            padding: 8,
            backgroundColor: '#1f1f1f',
            borderRadius: 4,
            color: '#00ffe1'
          }}>
            Suggested Category: <strong>{predictedCategory}</strong>
          </div>
        )}

        <Form.Item
          label={<span style={{ color: '#f0f0f0' }}>Amount</span>}
          name="amount"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: '100%', color: '#fff', backgroundColor: '#1f1f1f' }}
            min={1}
            placeholder="Enter amount"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ color: '#f0f0f0' }}>
              Type&nbsp;
              <Tooltip title="Debit = You paid | Credit = You received">
                <InfoCircleOutlined style={{ color: '#00ffe1' }} />
              </Tooltip>
            </span>
          }
          name="type"
          rules={[{ required: true }]}
        >
          <Select placeholder="Select Transaction type" style={{ backgroundColor: '#1f1f1f', color: '#fff' }}>
            <Option value="debit">Debit (You Paid)</Option>
            <Option value="credit">Credit (You Got)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#f0f0f0' }}>Payment Type</span>}
          name="paymentType"
          rules={[{ required: true, message: 'Please select a payment type!' }]}
        >
          <Select
            onChange={(value) => setPaymentType(value)}
            placeholder="Select Payment Type"
            style={{ backgroundColor: '#1f1f1f', color: '#fff' }}
          >
            <Option value="cash">Paid Cash</Option>
            <Option value="online">Paid Online</Option>
            <Option value="installment">Paid in Installments</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#f0f0f0' }}>Categories</span>}
          name="category"
        >
          <Select
            placeholder="Select Optional Category"
            style={{ backgroundColor: '#1f1f1f', color: '#fff' }}
            allowClear
          >
            <Option value="business Transaction">Business Transaction</Option>
            <Option value="personal Withdrawal">Personal Withdrawal</Option>
            <Option value="Electricity">Electricity</Option>
            <Option value="Inventory Purchase">Inventory Purchase</Option>
            <Option value="Internet & Phone">Internet & Phone</Option>
            <Option value="Repair & Maintenance">Repair & Maintenance</Option>
            <Option value="Fuel">Fuel</Option>
            <Option value="Insurance">Insurance</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span style={{ color: '#f0f0f0' }}>Date</span>}
          name="date"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Select date" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Add Transaction
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddExpense;

