import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Avatar, message, Empty, Spin } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { formatDateTime } from '../../utils/date';
import chatService from '../../services/chat.service';
import { ChatMessage } from '../../types';
import { useAppSelector, useAppDispatch, useWebSocket } from '../../hooks';
import { setCurrentChatUserId, setMessages, markAsRead } from '../../store/chat.slice';

const ChatRoom = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { messages, typingUsers } = useAppSelector((state) => state.chat);
  const { sendMessage, markAsRead: markAsReadWs, setTyping, isConnected } = useWebSocket();

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<{ real_name?: string; avatar_url?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetUserId = userId ? parseInt(userId) : 0;
  const navUser = (location.state as any)?.user as { real_name?: string; avatar_url?: string } | undefined;

  useEffect(() => {
    if (targetUserId) {
      dispatch(setCurrentChatUserId(targetUserId));
      if (navUser) {
        setOtherUser(navUser);
      }
      fetchMessages();
      markAsReadWs(targetUserId);
      dispatch(markAsRead(targetUserId));
    }
  }, [targetUserId, navUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages[targetUserId]]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const response = await chatService.getMessages(targetUserId, { page: 1, limit: 100 });
      if (response.success && response.data) {
        dispatch(setMessages({ userId: targetUserId, messages: response.data.list }));
        // 获取对方用户信息
        if (response.data.list.length > 0) {
          const lastMessage = response.data.list[response.data.list.length - 1];
          const isTargetSender = lastMessage.from_user_id === targetUserId;
          setOtherUser({
            real_name: isTargetSender ? lastMessage.from_user?.real_name : lastMessage.to_user?.real_name,
            avatar_url: isTargetSender ? lastMessage.from_user?.avatar_url : lastMessage.to_user?.avatar_url,
          });
        }
      }
    } catch (error) {
      message.error('获取消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || !targetUserId) return;
    sendMessage(targetUserId, inputValue.trim());
    setInputValue('');
    setTyping(targetUserId, false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMessages = messages[targetUserId] || [];

  const renderAvatar = (msg: ChatMessage) => {
    const isOwn = msg.from_user_id === user?.id;
    if (isOwn && user?.avatar_url) {
      return <Avatar src={user.avatar_url} />;
    }
    if (!isOwn && otherUser?.avatar_url) {
      return <Avatar src={otherUser.avatar_url} />;
    }
    const name = isOwn ? (user?.real_name || '我') : (otherUser?.real_name || '对方');
    return <Avatar style={{ backgroundColor: isOwn ? '#1890ff' : '#52c41a' }}>{name.charAt(0)}</Avatar>;
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/chat')}
          style={{ margin: 16 }}
        >
          返回列表
        </Button>
        <div style={{ padding: '0 16px' }}>
          <h3>聊天对象</h3>
          {otherUser && (
            <div className="user-info" style={{ marginTop: 16 }}>
              {otherUser.avatar_url ? (
                <Avatar src={otherUser.avatar_url} size={48} />
              ) : (
                <Avatar size={48} style={{ backgroundColor: '#52c41a' }}>
                  {otherUser.real_name?.charAt(0) || '用'}
                </Avatar>
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{otherUser.real_name || `用户${targetUserId}`}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {isConnected ? '在线' : '离线'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : currentMessages.length === 0 ? (
            <Empty description="暂无消息，开始聊天吧" />
          ) : (
            <>
              {currentMessages.map((msg) => {
                const isOwn = msg.from_user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`message ${isOwn ? 'own' : 'other'}`}
                    style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}
                  >
                    {renderAvatar(msg)}
                    <div>
                      <div className="message-bubble">{msg.content}</div>
                      <div className="message-time">
                        {formatDateTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingUsers.has(targetUserId) && (
                <div className="message other" style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  {otherUser?.avatar_url ? (
                    <Avatar src={otherUser.avatar_url} />
                  ) : (
                    <Avatar style={{ backgroundColor: '#52c41a' }}>
                      {otherUser?.real_name?.charAt(0) || '用'}
                    </Avatar>
                  )}
                  <div>
                    <div className="message-bubble">
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input">
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleKeyPress}
            placeholder="输入消息，按回车发送"
            autoSize={{ minRows: 2, maxRows: 6 }}
            onFocus={() => setTyping(targetUserId, true)}
            onBlur={() => setTyping(targetUserId, false)}
          />
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
