import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, message, Upload, Select, Descriptions, Modal, List, Rate, Empty } from 'antd';
import { UserOutlined, CameraOutlined, LockOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { updateProfile } from '../../store/auth.slice';
import authService from '../../services/auth.service';
import reviewService from '../../services/review.service';
import { GENDER_OPTIONS } from '../../constants/config';
import { Review } from '../../types';
import { formatDateTime } from '../../utils/date';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchReviews = async () => {
    if (!user?.id) return;

    setReviewLoading(true);
    try {
      const response = await reviewService.getUserReviews(user.id, { page: 1, limit: 20 });
      if (response.success && response.data) {
        setReviews(response.data.list);
      }
    } catch (error) {
      message.error('获取评价失败');
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      await dispatch(updateProfile(values)).unwrap();
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await authService.changePassword(values.old_password, values.new_password);
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.error || '密码修改失败');
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 文件');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB');
        return false;
      }
      return false; // 阻止自动上传，实际项目需要实现上传逻辑
    },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar size={120} icon={<UserOutlined />} src={user?.avatar_url} />
            <Upload {...uploadProps}>
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
              />
            </Upload>
          </div>
          <h2 style={{ marginTop: 16 }}>{user?.real_name || '未设置昵称'}</h2>
          <p style={{ color: '#666' }}>{user?.phone}</p>
        </div>

        <Descriptions column={1} bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="实名认证状态">
            {user?.id_card_verified === 1 ? (
              <span style={{ color: '#52c41a' }}>已认证</span>
            ) : (
              <span style={{ color: '#faad14' }}>未认证</span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="评分">
            {Number(user?.rating ?? 0).toFixed(1)} ({Number(user?.rating_count ?? 0)} 人评价)
          </Descriptions.Item>
        </Descriptions>

        <Card title="我收到的评价" style={{ marginBottom: 24 }} loading={reviewLoading}>
          {reviews.length === 0 ? (
            <Empty description="暂无评价" />
          ) : (
            <List
              dataSource={reviews}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.from_user?.avatar_url} icon={<UserOutlined />} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.from_user?.real_name || `用户${item.from_user_id}`}</span>
                        <Rate disabled value={item.rating} style={{ fontSize: 14 }} />
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{item.comment || '未填写评价内容'}</div>
                        <div style={{ color: '#999', fontSize: 12 }}>{formatDateTime(item.created_at)}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        <Card title="编辑资料" style={{ marginBottom: 24 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              real_name: user?.real_name,
              gender: user?.gender,
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item label="昵称" name="real_name">
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item label="性别" name="gender">
              <Select options={GENDER_OPTIONS} placeholder="请选择性别" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="账号安全">
          <Button icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)}>
            修改密码
          </Button>
        </Card>
      </Card>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="原密码"
            name="old_password"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="new_password"
            rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirm_password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
