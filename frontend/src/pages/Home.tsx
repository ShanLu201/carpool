import { Button, Card, Col, Row, Space } from 'antd';
import { Link } from 'react-router-dom';
import { CarOutlined, UserOutlined, SafetyOutlined, MessageOutlined } from '@ant-design/icons';

const Home = () => {
  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={6}>
          <Card hoverable>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <CarOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <h3>发布出行需求</h3>
              <p style={{ color: '#666', textAlign: 'center' }}>
                乘客可以发布用车需求，包括出发地、目的地、时间和人数
              </p>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <CarOutlined rotate={90} style={{ fontSize: 48, color: '#52c41a' }} />
              <h3>发布邀客信息</h3>
              <p style={{ color: '#666', textAlign: 'center' }}>
                车主可以发布邀客信息，让更多乘客了解您的行程
              </p>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <SafetyOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <h3>实名认证保障</h3>
              <p style={{ color: '#666', textAlign: 'center' }}>
                所有用户需实名认证，确保出行安全可靠
              </p>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card hoverable>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <MessageOutlined style={{ fontSize: 48, color: '#eb2f96' }} />
              <h3>实时在线沟通</h3>
              <p style={{ color: '#666', textAlign: 'center' }}>
                支持在线聊天，方便协商行程细节和费用
              </p>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="快速开始">
        <Space size="large" wrap>
          <Button type="primary" size="large" icon={<CarOutlined />}>
            <Link to="/passenger">查看乘客需求</Link>
          </Button>
          <Button type="primary" size="large" icon={<CarOutlined rotate={90} />}>
            <Link to="/driver">查看车主邀客</Link>
          </Button>
          <Button size="large" icon={<UserOutlined />}>
            <Link to="/passenger/publish">发布需求</Link>
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
