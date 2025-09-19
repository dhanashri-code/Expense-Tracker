import React, { useEffect, useState } from 'react';
import { Card, List, Spin } from 'antd';
import { getAIInsights } from '../services/expenseService';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getAIInsights();
        console.log("insight",res)
        setInsights(res.insights);
      
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <Card title="AI Insights" className="shadow-lg rounded-lg mt-4">
      {loading ? (
        <Spin />
      ) : (
        <List
          dataSource={insights}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      )}
    </Card>
  );
};

export default AIInsights;
