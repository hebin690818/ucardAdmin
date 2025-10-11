import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, message, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { Card, CardListRequest } from '../types';
import { api } from '../utils/request';

const { Search } = Input;
const { TextArea } = Input;

const CardList: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [form] = Form.useForm();
  
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载卡片数据
  useEffect(() => {
    loadCards();
  }, [pagination.current, pagination.pageSize]);

  const loadCards = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: CardListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: 'id',
      };

      // 如果有搜索条件，添加搜索列
      if (searchText.trim()) {
        queryData.columns = [
          {
            exp: 'like',
            logic: 'or',
            name: 'title',
            value: searchText.trim(),
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'description',
            value: searchText.trim(),
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'type',
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getCardList(queryData);
      
      console.log(response);
      // 转换数据格式
      const cardList: Card[] = response.cards.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status === 1 ? 'active' : 'inactive',
        userId: item.userId,
        createdAt: item.createdAt,
      }));

      setCards(cardList);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error('获取卡片列表失败');
      console.error('Load cards error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<Card> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '卡片标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          VIP: 'gold',
          积分: 'blue',
          折扣: 'green',
          储值: 'purple',
          体验: 'cyan',
        };
        return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadCards();
  };

  const handleAdd = () => {
    setEditingCard(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    form.setFieldsValue(card);
    setIsModalOpen(true);
  };

  const handleDelete = (card: Card) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除卡片 "${card.title}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用删除卡片API
          // await api.deleteCard(card.id);
          setCards(cards.filter((c) => c.id !== card.id));
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCard) {
        // TODO: 调用编辑卡片API
        // await api.updateCard(editingCard.id, values);
        setCards(
          cards.map((c) =>
            c.id === editingCard.id ? { ...c, ...values } : c
          )
        );
        message.success('更新成功');
      } else {
        // TODO: 调用新增卡片API
        // await api.createCard(values);
        const newCard: Card = {
          id: Math.max(...cards.map((c) => c.id)) + 1,
          ...values,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCards([...cards, newCard]);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 分页变化处理
  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增卡片
          </Button>
        </Space>
        <Search
          placeholder="搜索卡片标题、描述或类型"
          allowClear
          style={{ width: 350 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
        />
      </div>

      <Table
        columns={columns}
        dataSource={cards}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingCard ? '编辑卡片' : '新增卡片'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active', type: 'VIP', userId: 1 }}
        >
          <Form.Item
            name="title"
            label="卡片标题"
            rules={[{ required: true, message: '请输入卡片标题' }]}
          >
            <Input placeholder="请输入卡片标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入卡片描述"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Select.Option value="VIP">VIP</Select.Option>
              <Select.Option value="积分">积分</Select.Option>
              <Select.Option value="折扣">折扣</Select.Option>
              <Select.Option value="储值">储值</Select.Option>
              <Select.Option value="体验">体验</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input type="number" placeholder="请输入用户ID" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CardList;

