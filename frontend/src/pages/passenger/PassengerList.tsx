import { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Space, Button, Input, DatePicker, message, Empty, Pagination, Modal, Rate } from 'antd';
import { SearchOutlined, PlusOutlined, MessageOutlined, EnvironmentOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import passengerService from '../../services/passenger.service';
import reviewService from '../../services/review.service';
import { PassengerRequest } from '../../types';
import { getDisplayDate, formatTime } from '../../utils/date';
import { useAppSelector } from '../../hooks';

const PassengerList = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [list, setList] = useState<PassengerRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    travel_date: undefined as dayjs.Dayjs | undefined,
    origin: '',
    destination: '',
  });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<PassengerRequest | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (filters.travel_date) {
        params.travel_date = filters.travel_date.format('YYYY-MM-DD');
      }
      if (filters.origin) params.origin = filters.origin;
      if (filters.destination) params.destination = filters.destination;

      const response = await passengerService.list(params);
      if (response.success && response.data) {
        setList(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error('获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, filters]);

  const handleSearch = () => {
    setPage(1);
    fetchList();
  };

  const handleChat = (userId: number, chatUser?: { real_name?: string; avatar_url?: string }) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    navigate(`/chat/${userId}`, { state: { user: chatUser } });
  };

  const openReviewModal = (item: PassengerRequest) => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }

    setReviewTarget(item);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewTarget) return;

    setReviewSubmitting(true);
    try {
      const response = await reviewService.create({
        target_type: 'passenger',
        target_id: reviewTarget.id,
        to_user_id: reviewTarget.user_id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      if (response.success) {
        message.success('评价成功');
        setReviewModalOpen(false);
      }
    } catch (error: any) {
      message.error(error.error || '评价失败');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderPrice = (item: PassengerRequest) => {
    if (item.price_min && item.price_max) {
      return <span className="price-tag">¥{item.price_min} - ¥{item.price_max}/人</span>;
    } else if (item.price_min) {
      return <span className="price-tag">¥{item.price_min}/人起</span>;
    } else if (item.price_max) {
      return <span className="price-tag">¥{item.price_max}/人以内</span>;
    }
    return <span>面议</span>;
  };

  return (
    <div>
      <Card title="乘客需求列表" style={{ marginBottom: 16 }}>
        <Space wrap>
          <DatePicker
            placeholder="选择出行日期"
            value={filters.travel_date}
            onChange={(date) => setFilters({ ...filters, travel_date: date })}
          />
          <Input
            placeholder="出发地"
            prefix={<EnvironmentOutlined />}
            style={{ width: 150 }}
            value={filters.origin}
            onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
          />
          <Input
            placeholder="目的地"
            prefix={<EnvironmentOutlined />}
            style={{ width: 150 }}
            value={filters.destination}
            onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              if (!user) {
                message.warning('请先登录');
                navigate('/login');
              } else {
                navigate('/passenger/publish');
              }
            }}
          >
            发布需求
          </Button>
        </Space>
      </Card>

      {list.length === 0 ? (
        <Empty description="暂无乘客需求" />
      ) : (
        <Row gutter={[16, 16]}>
          {list.map((item) => (
            <Col key={item.id} xs={24} sm={12} md={8}>
              <Card hoverable className="ride-card">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <Tag color="blue">{getDisplayDate(item.travel_date)}</Tag>
                    <Tag color={item.status === 2 ? 'green' : 'blue'}>{item.status === 2 ? '已完成' : '进行中'}</Tag>
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
                    <span>发布者: {item.user?.real_name || `用户${item.user_id}`}</span>
                  </div>
                  <div>
                    <span>乘车人数: {item.passenger_count}人</span>
                    <span style={{ marginLeft: 16 }}>{renderPrice(item)}</span>
                  </div>
                  {item.remarks && (
                    <div style={{ color: '#666', fontSize: 12 }}>
                      备注: {item.remarks}
                    </div>
                  )}
                  <Space>
                    <Button
                      size="small"
                      icon={<MessageOutlined />}
                      onClick={() => handleChat(item.user_id, item.user)}
                    >
                      联系
                    </Button>
                    {item.status === 2 && user && user.id !== item.user_id && (
                      <Button size="small" icon={<StarOutlined />} onClick={() => openReviewModal(item)}>
                        评价
                      </Button>
                    )}
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {total > limit && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title="评价用户"
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        onOk={handleSubmitReview}
        okText="提交评价"
        cancelText="取消"
        confirmLoading={reviewSubmitting}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>评价对象: {reviewTarget?.user?.real_name || (reviewTarget ? `用户${reviewTarget.user_id}` : '')}</div>
          <div>
            <div style={{ marginBottom: 8 }}>评分</div>
            <Rate value={reviewRating} onChange={setReviewRating} />
          </div>
          <Input.TextArea
            rows={4}
            maxLength={500}
            placeholder="填写评价内容（可选）"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </Space>
      </Modal>
    </div>
  );
};

export default PassengerList;
