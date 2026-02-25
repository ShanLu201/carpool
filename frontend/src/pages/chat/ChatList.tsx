import { useState, useEffect } from 'react';
import { List, Badge, Empty, Avatar, Typography, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { fromNow } from '../../utils/date';
import chatService from '../../services/chat.service';
import { Contact } from '../../types';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setContacts } from '../../store/chat.slice';

const { Text } = Typography;

const ChatList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { contacts } = useAppSelector((state) => state.chat);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await chatService.getContacts();
      if (response.success && response.data) {
        dispatch(setContacts(response.data.contacts));
      }
    } catch (error) {
      message.error('获取联系人列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChat = (userId: number) => {
    navigate(`/chat/${userId}`);
  };

  const renderAvatar = (contact: Contact) => {
    if (contact.avatar_url) {
      return <Avatar src={contact.avatar_url} />;
    }
    const name = contact.real_name || '用户';
    return <Avatar style={{ backgroundColor: '#1890ff' }}>{name.charAt(0)}</Avatar>;
  };

  return (
    <div>
      <List
        loading={loading}
        dataSource={contacts}
        renderItem={(contact) => (
          <List.Item
            onClick={() => handleChat(contact.user_id)}
            style={{ cursor: 'pointer', padding: '16px 24px' }}
          >
            <List.Item.Meta
              avatar={renderAvatar(contact)}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{contact.real_name || `用户${contact.user_id}`}</span>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {fromNow(contact.last_message_time)}
                  </Text>
                </div>
              }
              description={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text ellipsis style={{ maxWidth: 200, color: '#666' }}>
                    {contact.last_message}
                  </Text>
                  <Badge count={contact.unread_count} showZero={false}>
                    <ArrowRightOutlined style={{ color: '#999' }} />
                  </Badge>
                </div>
              }
            />
          </List.Item>
        )}
      />

      {!loading && contacts.length === 0 && (
        <Empty
          description="暂无聊天记录"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default ChatList;
