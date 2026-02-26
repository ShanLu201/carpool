import { Layout, Menu, Badge, Avatar, Dropdown, Space, Grid } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  CarOutlined,
  UserOutlined,
  MessageOutlined,
  PlusOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../store/auth.slice';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.chat);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const userMenu = isAuthenticated ? (
    <Dropdown
      menu={{
        items: [
          { key: 'profile', label: '个人中心', onClick: () => navigate('/profile') },
          { type: 'divider' },
          { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleLogout },
        ],
      }}
      trigger={['click']}
    >
      <Space style={{ cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <span>{user?.real_name || user?.phone?.slice(-4)}</span>
      </Space>
    </Dropdown>
  ) : (
    <Space size={isMobile ? 6 : 16} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
      <Link to="/login" style={{ display: 'inline-block', fontSize: isMobile ? 13 : 14 }}>登录</Link>
      <Link to="/register" style={{ display: 'inline-block', fontSize: isMobile ? 13 : 14 }}>
        注册
      </Link>
    </Space>
  );

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页</Link> },
    { key: '/passenger', icon: <CarOutlined />, label: <Link to="/passenger">乘客需求</Link> },
    { key: '/driver', icon: <CarOutlined rotate={90} />, label: <Link to="/driver">车主邀客</Link> },
  ];

  if (isAuthenticated) {
    menuItems.push(
      { key: '/chat', icon: <MessageOutlined />, label: <Link to="/chat">消息</Link> },
      { key: '/my-passenger', icon: <ProfileOutlined />, label: <Link to="/passenger/my">我的需求</Link> },
      { key: '/my-driver', icon: <ProfileOutlined />, label: <Link to="/driver/my">我的邀客</Link> },
      { key: '/publish', icon: <PlusOutlined />, label: <Link to="/passenger/publish">发布信息</Link> }
    );
  }

  const getActiveKey = () => {
    const path = location.pathname;
    if (path.startsWith('/passenger/my')) return '/my-passenger';
    if (path.startsWith('/driver/my')) return '/my-driver';
    if (path.startsWith('/passenger') && !path.includes('/publish')) return '/passenger';
    if (path.startsWith('/driver') && !path.includes('/publish')) return '/driver';
    if (path.startsWith('/chat')) return '/chat';
    if (path.includes('/publish')) return '/publish';
    return '/';
  };

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 8px' : '0 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Link
            to="/"
            style={{
              color: 'white',
              fontSize: isMobile ? 16 : 20,
              fontWeight: 600,
              marginRight: isMobile ? 12 : 40,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            拼车平台
          </Link>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[getActiveKey()]}
            style={isMobile ? { minWidth: 0, flex: 1 } : undefined}
            items={menuItems.map((item) => ({
              key: item.key,
              icon: item.key === '/chat' ? (
                <Badge count={unreadCount} offset={[0, -10]} size="small">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              ),
              label: item.label,
            }))}
          />
        </div>
        <div>{userMenu}</div>
      </Header>
      <Content style={{ padding: isMobile ? '16px 12px' : '24px 40px', minHeight: 'calc(100vh - 134px)' }}>
        {location.pathname === '/' && (
          <div className="page-header" style={isMobile ? { padding: '12px 0', marginBottom: 12 } : undefined}>
            <h1 style={isMobile ? { fontSize: 20, marginBottom: 4 } : undefined}>欢迎使用拼车平台</h1>
            <p style={{ color: '#666', marginTop: isMobile ? 4 : 8, fontSize: isMobile ? 13 : 14, lineHeight: 1.5 }}>
              乘客发布需求，车主发布邀客，快速匹配同行。
            </p>
          </div>
        )}
        <div className="container" style={{ maxWidth: 1200 }}>
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        拼车平台 ©{new Date().getFullYear()} Created for Carpooling
      </Footer>
    </Layout>
  );
};

export default MainLayout;
