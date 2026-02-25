import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Card, message, TimePicker, Space } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import driverService from '../../services/driver.service';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchMe } from '../../store/auth.slice';

const PublishDriver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [form] = Form.useForm();

  const idParam = searchParams.get('id');
  const editId = idParam ? Number(idParam) : undefined;
  const isEditMode = !!editId;

  useEffect(() => {
    if (!user) {
      message.warning('请先登录');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isEditMode || !editId) {
        return;
      }
      setInitLoading(true);
      try {
        const response = await driverService.getById(editId);
        const invite = response.data?.invite;
        if (!response.success || !invite) {
          throw new Error(response.error || '获取详情失败');
        }

        form.setFieldsValue({
          travel_date: dayjs(invite.travel_date),
          time_start: dayjs(invite.time_start, 'HH:mm:ss'),
          time_end: dayjs(invite.time_end, 'HH:mm:ss'),
          origin: invite.origin,
          destination: invite.destination,
          available_seats: invite.available_seats,
          price: invite.price,
          car_model: invite.car_model,
          car_plate: invite.car_plate,
          remarks: invite.remarks,
        });
      } catch (error: any) {
        message.error(error.error || error.message || '获取详情失败');
        navigate('/driver/my');
      } finally {
        setInitLoading(false);
      }
    };

    fetchDetail();
  }, [editId, form, isEditMode, navigate]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        travel_date: values.travel_date.format('YYYY-MM-DD'),
        time_start: values.time_start.format('HH:mm'),
        time_end: values.time_end.format('HH:mm'),
        origin: values.origin,
        destination: values.destination,
        available_seats: values.available_seats,
        price: values.price,
        car_model: values.car_model,
        car_plate: values.car_plate,
        remarks: values.remarks,
      };

      if (isEditMode && editId) {
        await driverService.update(editId, data);
        message.success('更新成功');
        navigate('/driver/my');
      } else {
        await driverService.publish(data);
        message.success('发布成功');
        dispatch(fetchMe());
        navigate('/driver');
      }
    } catch (error: any) {
      message.error(error.error || (isEditMode ? '更新失败' : '发布失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        loading={initLoading}
        title={isEditMode ? '编辑车主邀客' : '发布车主邀客'}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(isEditMode ? '/driver/my' : '/driver')}>
            返回
          </Button>
        }
      >
        <Form form={form} onFinish={onFinish} layout="vertical" autoComplete="off">
          <Form.Item
            label="出行日期"
            name="travel_date"
            rules={[{ required: true, message: '请选择出行日期' }]}
          >
            <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
          </Form.Item>

          <Form.Item label="出发时间范围" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="time_start"
                noStyle
                rules={[{ required: true, message: '请选择开始时间' }]}
              >
                <TimePicker format="HH:mm" placeholder="开始时间" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item
                name="time_end"
                noStyle
                rules={[{ required: true, message: '请选择结束时间' }]}
              >
                <TimePicker format="HH:mm" placeholder="结束时间" style={{ width: '50%' }} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="出发地"
            name="origin"
            rules={[{ required: true, message: '请输入出发地' }]}
          >
            <Input placeholder="例如：长沙" />
          </Form.Item>

          <Form.Item
            label="目的地"
            name="destination"
            rules={[{ required: true, message: '请输入目的地' }]}
          >
            <Input placeholder="例如：安化东坪" />
          </Form.Item>

          <Form.Item
            label="可载人数"
            name="available_seats"
            rules={[{ required: true, message: '请输入可载人数' }]}
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} placeholder="人数" />
          </Form.Item>

          <Form.Item
            label="费用（元/人）"
            name="price"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="不填则面议" />
          </Form.Item>

          <Form.Item label="车辆信息">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="car_model" noStyle>
                <Input placeholder="车型（如：大众朗逸）" style={{ width: '60%' }} />
              </Form.Item>
              <Form.Item name="car_plate" noStyle>
                <Input placeholder="车牌号" style={{ width: '40%' }} />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={3} placeholder="其他需要说明的信息" maxLength={500} showCount />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />} block size="large">
              {isEditMode ? '保存修改' : '发布邀客'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PublishDriver;
