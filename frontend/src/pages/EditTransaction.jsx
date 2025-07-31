import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpenses, updateExpense } from '../services/expenseService';
import { Form, Input, InputNumber, DatePicker, Select, Button, Typography, message, Spin , Tooltip } from 'antd';
import dayjs from 'dayjs';
import {InfoCircleOutlined} from '@ant-design/icons';
const { Title } = Typography;
const { Option } = Select;

const EditExpense = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchExpense = async () => {
            try {
                const res = await getExpenses();
                const found = res.data.find(e => e._id === id);
                if (!found) throw new Error('Expense not found');
                setInitialData(found);
                form.setFieldsValue({
                    ...found,
                    date: dayjs(found.date),
                });
            } catch (err) {
                message.error(err.message || 'Failed to load expense');
            } finally {
                setLoading(false);
            }
        };

        fetchExpense();
    }, [id, form]);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                date: values.date.toISOString(),
            };
            await updateExpense(id, payload);
            message.success('Expense updated');
            navigate(`/view/${id}`);
        } catch (err) {
            message.error('Failed to update expense');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spin style={{ display: 'block', marginTop: 100 }} />;

    return (
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, backgroundColor: '#141414', borderRadius: 10 }}>
            <Title level={3} style={{ color: '#00ffcc' }}>Edit Transaction</Title>

            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item label="Title" name="title" rules={[{ required: true }]}>
                    <Input placeholder="Enter expense title" />
                </Form.Item>

                <Form.Item label="Amount" name="amount" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>

                <Form.Item
                    label={
                        <span style={{ color: '#f0f0f0' }}>
                            Type&nbsp;
                            <Tooltip title="Debit = You paid | | Credit = You received">
                                <InfoCircleOutlined style={{ color: '#00ffe1' }} />
                            </Tooltip>
                        </span>
                    }
                    name="type" rules={[{ required: true }]}>

                    <Select placeholder="Select expense type">
                        <Option value="debit">Debit (You Paid)</Option>
                        <Option value="credit">Credit (You Got)</Option>
                    </Select>
                </Form.Item>

                <Form.Item label={<span style={{ color: '#f0f0f0' }}>Categories</span>} name="category" rules={[{ required: true }]}>
                    <Select placeholder="Select Optional Category">
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

                <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting} block>
                        Update Transaction
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditExpense;
