import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getExpenseInsights, getAIInsights } from '../services/expenseService';
import { Card, Row, Col, Typography, Statistic, message, Select, DatePicker, Button } from 'antd';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Treemap
} from 'recharts';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const COLORS = ['#00C49F', '#FF8042', '#0088FE', '#FFBB28', '#ff4d4f', '#a0d911', '#722ed1', '#eb2f96'];

export default function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const fetchInsights = async (f = 'all', range = null) => {
    try {
      setLoading(true);
      let response;

      if (range) {
        response = await getExpenseInsights(f, {
          startDate: range[0].startOf("day").toISOString(),
          endDate: range[1].endOf("day").toISOString(),
        });
      } else {
        response = await getExpenseInsights(f);
      }

      setInsights(response);
    } catch {
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // === AI Insights Handler ===

  const handleGenerateInsights = async () => {
    if (!insights) return;
    setAiLoading(true);

    try {
      let filterLabel = "All Time";

      // If user selected a custom date range
      if (dateRange?.length) {
        filterLabel = `${dayjs(dateRange[0]).format("DD MMM")} - ${dayjs(dateRange[1]).format("DD MMM YYYY")}`;
      } else {
        // Compute filter label based on filter type
        switch (filter) {
          case "today":
            filterLabel = "Today";
            break;
          case "week":
            filterLabel = "This Week";
            break;
          case "month":
            filterLabel = "This Month";
            break;
          case "year":
            filterLabel = "This Year";
            break;
        }
      }

      const res = await getAIInsights({
        totalAmount: insights.totalAmount,
        totalCredit: insights.totalCredit,
        totalDebit: insights.totalDebit,
        monthlyData: insights.monthlyData,
        categoryData: insights.categoryData,
        paymentData: insights.paymentData,
        payableData: insights.payableData,
        filter: filterLabel
      });

      setAiSummary(res.summary);
    } catch (err) {
      console.error("AI Insights error:", err);
      setAiSummary("⚠️ Could not generate AI insights.");
    }

    setAiLoading(false);
  };



  useEffect(() => {
    if (!dateRange) {
      fetchInsights(filter);
    }
  }, [filter]);

  const handleDateChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      fetchInsights("custom", dates);
    } else {
      fetchInsights(filter);
    }
  };

  if (!insights) return <p>Loading...</p>;

  // Prepare chart data
  const chartData = insights.monthlyData.map(item => {
    let label = item.month;

    if (filter === 'day') {
      label = dayjs(label).format('HH:00'); // hourly
    } else if (filter === 'week') {
      label = dayjs(label).format('ddd'); // weekday
    } else if (filter === 'month') {
      label = `Week ${label}`; // week of month
    } else if (filter === 'year') {
      label = dayjs(label).format('MMM'); // month
    } else if (filter === 'custom') {
      label = dayjs(label).format('DD MMM'); // custom range
    } else {
      label = dayjs(label).format('MMM YYYY');
    }

    return { label, amount: item.amount };
  });

  return (
    <div style={{ padding: 5 }}>
      {/* Header with Filters */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <Title level={2} style={{ color: '#00ffe1', margin: 0 }}>Dashboard Overview</Title>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Select value={filter} onChange={setFilter} style={{ width: 160 }} disabled={!!dateRange}>
            <Option value="all">All Time</Option>
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>
          <RangePicker onChange={handleDateChange} />
        </div>
      </Row>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Total Transactions" value={insights.totalAmount} prefix="₹" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Total Debit" value={insights.totalDebit} prefix="₹" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Total Credit" value={insights.totalCredit} prefix="₹" valueStyle={{ color: '#73d13d' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic title="Debit / Credit Count" value={`${insights.countDebit} / ${insights.countCredit}`} />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 30 }}>
        {/* Transactions Over Time (Line Chart) */}
        <Col xs={24} lg={24}>
          <Card title="Transactions Over Time">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 700 }}> {/* Chart won't shrink too much */}

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={filter === 'day' ? 60 : 50}
                    />
                    <YAxis />
                    <ReTooltip />
                    <Line type="monotone" dataKey="amount" stroke="#3a9152" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>

        {/* Payment Type Distribution (Donut Chart) */}
        <Col xs={24} lg={12}>
          <Card title="Payment Type Distribution">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 400 }}>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={insights.paymentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      label
                    >
                      {insights.paymentData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>

        {/* Category Distribution (Bar Chart) */}
        <Col xs={24} lg={12}>
          <Card title="Category Distribution">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 500 }}>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis />
                    <ReTooltip />
                    <Bar dataKey="value">
                      {insights.categoryData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>


        {/* Payable Bills (Horizontal Bar Chart) */}
        <Col xs={24} lg={24}>
          <Card title="Payable Bills by Title">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 600 }}>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={insights.payableData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <ReTooltip />
                    <Bar dataKey="amount" fill="#ff4d4f" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Col>

      </Row>

      {/* === AI Insights Section === */}
      {/* === AI Insights Section === */}
      <Row className="mt-6" style={{ marginTop: 30 }}>
        <Col span={24}>
          <Card title={`AI Insights (${dateRange?.length ? `${dayjs(dateRange[0]).format("DD MMM")} - ${dayjs(dateRange[1]).format("DD MMM YYYY")}` : "All Time"})`}>
            <Button type="primary" onClick={handleGenerateInsights} loading={aiLoading}>
              Generate Summary
            </Button>

            {aiSummary && (
              <div className="mt-4 p-3 border rounded bg-gray-50" style={{ marginTop: 15 }}>
                <ul style={{ paddingLeft: 20 }}>
                  {aiSummary.split('\n').map((line, index) => {
                    if (!line.trim()) return null; // skip empty lines

                    // Smart emoji selection
                    let emoji = '💡'; // default
                    const lower = line.toLowerCase();
                    if (lower.includes('error') || lower.includes('fail') || lower.includes('warning')) emoji = '⚠️';
                    else if (lower.includes('success') || lower.includes('done') || lower.includes('complete')) emoji = '✅';
                    else if (lower.includes('idea') || lower.includes('suggest')) emoji = '💡';
                    else if (lower.includes('note') || lower.includes('tip')) emoji = '📝';

                    return (
                      <li key={index} style={{ marginBottom: 6 }}>
                        {emoji} {line.trim()}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </Col>
      </Row>


    </div>
  );
}

