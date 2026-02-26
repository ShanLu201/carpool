import { Button, Card, Col, Row, Space, Grid } from 'antd';
import { Link } from 'react-router-dom';
import { CarOutlined, UserOutlined, SafetyOutlined, MessageOutlined } from '@ant-design/icons';

const featureCards = [
  {
    key: 'passenger',
    title: '发布出行需求',
    desc: '发布行程与人数，快速匹配车主。',
    icon: <CarOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
    to: '/passenger/publish',
  },
  {
    key: 'driver',
    title: '发布邀客信息',
    desc: '车主发布空座信息，快速找到同行乘客。',
    icon: <CarOutlined rotate={90} style={{ fontSize: 36, color: '#52c41a' }} />,
    to: '/driver/publish',
  },
  {
    key: 'verify',
    title: '实名认证保障',
    desc: '实名校验提升出行安全与信任。',
    icon: <SafetyOutlined style={{ fontSize: 36, color: '#faad14' }} />,
    to: '/profile',
  },
  {
    key: 'chat',
    title: '实时在线沟通',
    desc: '在线沟通行程细节与费用信息。',
    icon: <MessageOutlined style={{ fontSize: 36, color: '#eb2f96' }} />,
    to: '/chat',
  },
];

const Home = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div>
      <Card style={{ marginBottom: isMobile ? 16 : 24 }} bodyStyle={{ padding: isMobile ? 16 : 24 }}>
        <Space direction="vertical" size={isMobile ? 12 : 16} style={{ width: '100%' }}>
          <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 600 }}>快速找车 / 找人</div>
          <Space wrap style={{ width: '100%' }} size={isMobile ? 8 : 12}>
            <Button type="primary" size={isMobile ? 'middle' : 'large'} icon={<CarOutlined />}>
              <Link to="/passenger">查看乘客需求</Link>
            </Button>
            <Button type="primary" size={isMobile ? 'middle' : 'large'} icon={<CarOutlined rotate={90} />}>
              <Link to="/driver">查看车主邀客</Link>
            </Button>
            <Button size={isMobile ? 'middle' : 'large'} icon={<UserOutlined />}>
              <Link to="/passenger/publish">发布需求</Link>
            </Button>
          </Space>
        </Space>
      </Card>

      <Row gutter={[12, 12]} style={{ marginBottom: isMobile ? 8 : 16 }}>
        {featureCards.map((item) => (
          <Col key={item.key} xs={12} md={6}>
            <Link to={item.to} style={{ display: 'block' }}>
              <Card hoverable size={isMobile ? 'small' : 'default'} bodyStyle={{ padding: isMobile ? 12 : 18 }}>
                <Space direction="vertical" align="center" size={isMobile ? 6 : 10} style={{ width: '100%' }}>
                  {item.icon}
                  <h3 style={{ fontSize: isMobile ? 14 : 16, margin: 0, textAlign: 'center' }}>{item.title}</h3>
                  <p style={{ color: '#666', textAlign: 'center', margin: 0, fontSize: isMobile ? 12 : 13 }}>
                    {item.desc}
                  </p>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
