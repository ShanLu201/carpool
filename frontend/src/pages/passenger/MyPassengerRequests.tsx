import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Space, Button, message, Empty, Pagination, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import passengerService from '../../services/passenger.service';
import { PassengerRequest } from '../../types';
import { getDisplayDate, formatTime } from '../../utils/date';

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '已取消', color: 'default' },
  1: { text: '进行中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
};

const MyPassengerRequests = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<PassengerRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await passengerService.myRequests({ page, limit });
      if (response.success && response.data) {
        setList(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('获取我的需求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page]);

  const handleDelete = async (id: number) => {
    try {
      await passengerService.cancel(id);
      message.success('删除成功');
      fetchList();
    } catch (error: any) {
      message.error(error.error || '删除失败');
    }
  };

  const renderPrice = (item: PassengerRequest) => {
    if (item.price_min && item.price_max) return `¥${item.price_min} - ¥${item.price_max}/人`;
    if (item.price_min) return `¥${item.price_min}/人起`;
    if (item.price_max) return `¥${item.price_max}/人以内`;
    return '面议';
  };

  return (
    <div>
      <Card
        title="我的乘客需求"
        style={{ marginBottom: 16 }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/passenger/publish')}>
            发布需求
          </Button>
        }
      />

      {list.length === 0 ? (
        <Empty description="暂无已发布需求" />
      ) : (
        <Row gutter={[16, 16]}>
          {list.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8}>
              <Card hoverable className="ride-card" loading={loading}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <Tag color={statusMap[item.status]?.color || 'default'}>{statusMap[item.status]?.text || '未知状态'}</Tag>
                    <Tag color="blue">{getDisplayDate(item.travel_date)}</Tag>
                    <span style={{ marginLeft: 8 }}>
                      {formatTime(item.time_start)} - {formatTime(item.time_end)}
                    </span>
                  </div>
                  <div className="route-tag">
                    <EnvironmentOutlined />
                    <span>{item.origin}</span>
                    <span>→</span>
                    <span>{item.destination}</span>
                  </div>
                  <div>
                    <span>乘车人数: {item.passenger_count}人</span>
                    <span style={{ marginLeft: 16 }}>{renderPrice(item)}</span>
                  </div>
                  {item.remarks && <div style={{ color: '#666', fontSize: 12 }}>备注: {item.remarks}</div>}
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/passenger/publish?id=${item.id}`)}>
                      编辑
                    </Button>
                    <Popconfirm title="确认删除该需求吗？" onConfirm={() => handleDelete(item.id)} okText="确认" cancelText="取消">
                      <Button size="small" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {total > limit && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination current={page} pageSize={limit} total={total} onChange={(p) => setPage(p)} showSizeChanger={false} />
        </div>
      )}
    </div>
  );
};

export default MyPassengerRequests;
