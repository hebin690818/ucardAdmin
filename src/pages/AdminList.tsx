import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Modal, Form, message, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { Admin, AdminListRequest } from '../types';
import { api } from '../utils/request';

const { Search } = Input;

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [form] = Form.useForm();
  
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载管理员数据
  useEffect(() => {
    loadAdmins();
  }, [pagination.current, pagination.pageSize]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: AdminListRequest = {
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
            name: 'username',
            value: searchText.trim(),
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'email',
            value: searchText.trim(),
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'role',
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getAdminList(queryData);
      
      console.log(response);
      // 转换数据格式
      const adminList: Admin[] = response.admins.map((item: any) => ({
        id: item.id,
        username: item.username,
        email: item.email,
        role: item.role,
        status: item.status === 1 ? 'active' : 'inactive',
        lastLogin: item.lastLogin,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setAdmins(adminList);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error('获取管理员列表失败');
      console.error('Load admins error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<Admin> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    // {
    //   title: '邮箱',
    //   dataIndex: 'email',
    //   key: 'email',
    //   width: 200,
    // },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const roleConfig = {
          'super_admin': { color: 'red', text: '超级管理员' },
          'admin': { color: 'blue', text: '管理员' },
          'operator': { color: 'green', text: '操作员' },
          'viewer': { color: 'default', text: '查看者' },
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    // {
    //   title: '最后登录',
    //   dataIndex: 'lastLogin',
    //   key: 'lastLogin',
    //   width: 180,
    //   render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    // },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
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
    loadAdmins();
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue(admin);
    setIsModalOpen(true);
  };

  const handleDelete = (admin: Admin) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除管理员 "${admin.username}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用删除管理员API
          // await api.deleteAdmin(admin.id);
          setAdmins(admins.filter((a) => a.id !== admin.id));
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
      if (editingAdmin) {
        // TODO: 调用编辑管理员API
        // await api.updateAdmin(editingAdmin.id, values);
        setAdmins(
          admins.map((a) =>
            a.id === editingAdmin.id ? { ...a, ...values } : a
          )
        );
        message.success('更新成功');
      } else {
        // TODO: 调用新增管理员API
        // await api.createAdmin(values);
        const newAdmin: Admin = {
          id: Math.max(...admins.map((a) => a.id)) + 1,
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAdmins([...admins, newAdmin]);
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
            新增管理员
          </Button>
        </Space>
        <Search
          placeholder="搜索用户名、邮箱或角色"
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
        dataSource={admins}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
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
        title={editingAdmin ? '编辑管理员' : '新增管理员'}
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
          initialValues={{ status: 'active', role: 'admin' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Select.Option value="super_admin">超级管理员</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="operator">操作员</Select.Option>
              <Select.Option value="viewer">查看者</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
