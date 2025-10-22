import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  message,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { User, UserListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载用户数据
  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadUsers = async () => {
    await loadUsersWithSearch(searchText);
  };

  const loadUsersWithSearch = async (searchValue: string) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: UserListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: "id",
      };

      // 如果有搜索条件，添加搜索列
      if (searchValue && searchValue.trim()) {
        queryData.columns = [
          {
            exp: "like",
            logic: "or",
            name: "name",
            value: searchValue.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "email",
            value: searchValue.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "userCode",
            value: searchValue.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "uid",
            value: searchValue.trim(),
          },
        ];
      }

      const response = await api.getUserList(queryData);

      console.log(response);
      // 转换数据格式
      const userList: User[] = response.userss.map((item: any) => ({
        id: item.id,
        email: item.email,
        name: item.name,
        username: item.username,
        role: item.role || "user",
        status: item.status === 1 ? "active" : "inactive",
        createdAt: item.createdAt,
        // 新增字段
        uid: item.uid,
        userCode: item.userCode,
        phone: item.phone,
        area: item.area,
        inviteCode: item.inviteCode,
        googleAuth: item.googleAuth,
        password: item.password,
        paymentPassword: item.paymentPassword,
        updatedAt: item.updatedAt,
      }));

      setUsers(userList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取用户列表失败");
      console.error("Load users error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户代码",
      dataIndex: "userCode",
      key: "userCode",
      width: 120,
    },
    {
      title: "UID",
      dataIndex: "uid",
      key: "uid",
      width: 150,
      ellipsis: true,
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (name: string, record: User) => name || record.username || "-",
    },
    {
      title: "手机",
      dataIndex: "phone",
      key: "phone",
      width: 120,
      render: (phone: number) => phone || "-",
    },
    {
      title: "地区",
      dataIndex: "area",
      key: "area",
      width: 100,
      render: (area: string) => area || "-",
    },
    {
      title: "邀请码",
      dataIndex: "inviteCode",
      key: "inviteCode",
      width: 120,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "default"}>
          {status === "active" ? "活跃" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return '-';
        const date = new Date(createdAt);
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-');
      },
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      fixed: "right",
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
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadUsersWithSearch(searchText);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadUsersWithSearch，传入空的搜索文本
    loadUsersWithSearch("");
  };


  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除用户 "${user.name}" 吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          await api.deleteUser(user.id);
          setUsers(users.filter((u) => u.id !== user.id));
          message.success("删除成功");
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // TODO: 调用编辑用户API
        // await api.updateUser(editingUser.id, values);
        setUsers(
          users.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u))
        );
        message.success("更新成功");
      } else {
        // TODO: 调用新增用户API
        // await api.createUser(values);
        const newUser: User = {
          id: Math.max(...users.map((u) => u.id)) + 1,
          ...values,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers([...users, newUser]);
        message.success("添加成功");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("表单验证失败:", error);
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
    <div className="table-container">
      <div className="search-bar">
        <Search
          placeholder="搜索姓名、邮箱、用户代码或UID"
          allowClear
          style={{ width: 350 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          onClear={handleClear}
          prefix={<SearchOutlined />}
        />
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200, y: "calc(100vh - 340px)" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
        />
      </div>

      <Modal
        title={editingUser ? "编辑用户" : "新增用户"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "active", role: "user" }}
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
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

export default UserList;
