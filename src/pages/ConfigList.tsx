import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Modal, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Config, ConfigListRequest } from '../types';
import { api } from '../utils/request';
import { encodeSearchValue } from '../utils/encode';
import dayjs from 'dayjs';

const { Search } = Input;
const { TextArea } = Input;

const ConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Config | null>(null);
  const [form] = Form.useForm();
  
  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载配置数据
  useEffect(() => {
    loadConfigs();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadConfigs = async () => {
    await loadConfigsWithSearch(searchText);
  };

  const loadConfigsWithSearch = async (searchValue: string) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: ConfigListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: 'id',
      };

      // 添加搜索条件
      if (searchValue.trim()) {
        const encodedValue = encodeSearchValue(searchValue);
        queryData.columns = [
          {
            exp: 'like',
            logic: 'or',
            name: 'key',
            value: encodedValue,
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'value',
            value: encodedValue,
          },
          {
            exp: 'like',
            logic: 'or',
            name: 'remark',
            value: encodedValue,
          },
        ];
      }

      const response = await api.getConfigList(queryData);

      console.log(response);
      // 转换数据格式
      const configList: Config[] = response.configs.map((item: any) => ({
        id: item.id,
        key: item.key,
        value: item.value,
        remark: item.remark,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setConfigs(configList);
      setPagination(prev => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error('获取配置列表失败');
      console.error('Load configs error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<Config> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '配置键',
      dataIndex: 'key',
      key: 'key',
      width: 120,
      ellipsis: true,
    },
    {
      title: '配置值',
      dataIndex: 'value',
      key: 'value',
      width: 300,
      ellipsis: true,
      render: (value: string) => (
        <div style={{ wordBreak: 'break-all' }}>
          {value}
        </div>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
      render: (remark: string) => remark || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
    loadConfigsWithSearch(searchText);
  };

  const handleAdd = () => {
    setEditingConfig(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (config: Config) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setIsModalOpen(true);
  };

  const handleDelete = (config: Config) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除配置 "${config.key}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用删除配置API
          // await api.deleteConfig(config.id);
          setConfigs(configs.filter((c) => c.id !== config.id));
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
      if (editingConfig) {
        await api.updateConfig(editingConfig.id, values);
        message.success('更新成功');
      } else {
        await api.createConfig(values);
        message.success('添加成功');
      }
      setIsModalOpen(false);
      // 成功后刷新列表
      setPagination(prev => ({ ...prev }));
      loadConfigs();
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadConfigs();
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
            新增配置
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
        <Search
          placeholder="搜索配置键、值或备注"
          allowClear
          style={{ width: 350 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          onClear={() => {
            setSearchText("");
            setPagination(prev => ({ ...prev, current: 1 }));
            loadConfigsWithSearch("");
          }}
          prefix={<SearchOutlined />}
        />
      </div>

      <Table
        columns={columns}
        dataSource={configs}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200, y: "calc(100vh - 340px)" }}
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
        title={editingConfig ? '编辑配置' : '新增配置'}
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
        >
          <Form.Item
            name="key"
            label="配置键"
            rules={[
              { required: true, message: '请输入配置键' },
              { max: 100, message: '配置键不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入配置键" />
          </Form.Item>

          <Form.Item
            name="value"
            label="配置值"
            rules={[
              { required: true, message: '请输入配置值' },
              { max: 1000, message: '配置值不能超过1000个字符' },
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入配置值" 
              showCount 
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
            rules={[
              { max: 200, message: '备注不能超过200个字符' },
            ]}
          >
            <Input placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfigList;
