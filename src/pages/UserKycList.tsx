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
  Descriptions,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { UserKyc, UserKycListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const UserKycList: React.FC = () => {
  const [userKycs, setUserKycs] = useState<UserKyc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUserKyc, setEditingUserKyc] = useState<UserKyc | null>(null);
  const [viewingUserKyc, setViewingUserKyc] = useState<UserKyc | null>(null);
  const [form] = Form.useForm();

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载用户KYC数据
  useEffect(() => {
    loadUserKycs();
  }, [pagination.current, pagination.pageSize]);

  const loadUserKycs = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: UserKycListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: "id",
      };

      // 如果有搜索条件，添加搜索列
      if (searchText.trim()) {
        queryData.columns = [
          {
            exp: "like",
            logic: "or",
            name: "userId",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "fullName",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "documentNumber",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "documentType",
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getUserKycList(queryData);

      console.log(response);
      // 转换数据格式
      const userKycList: UserKyc[] = response.usersKycs.map((item: any) => ({
        id: item.id,
        userId: item.uid,
        status: item.status || "pending",
        documentType:
          item.identityCardType === 1
            ? "身份证"
            : item.identityCardType === 2
            ? "护照"
            : item.identityCardType === 3
            ? "护照+非旅游签证/非中国居住证"
            : item.identityCardType === 4
            ? "驾驶证"
            : "其他",
        documentNumber: item.identityCard,
        fullName: item.lastNameEn + " " + item.firstNameEn,
        birthDate: item.birthDate,
        nationality: item.countryArea,
        address: item.address,
        submittedAt: item.createdAt,
        reviewedAt: item.reviewedAt,
        reviewer: item.reviewer,
        rejectionReason: item.rejectionReason,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        identityCardFront: item.identityFrontPicURL,
        identityCardBack: item.identityBackPicURL,
      }));

      setUserKycs(userKycList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取用户KYC列表失败");
      console.error("Load user kycs error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<UserKyc> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "姓名",
      dataIndex: "fullName",
      key: "fullName",
      width: 120,
    },
    {
      title: "证件类型",
      dataIndex: "documentType",
      key: "documentType",
      width: 100,
    },
    {
      title: "证件正面",
      dataIndex: "identityCardFront",
      key: "identityCardFront",
      width: 100,
      render: (identityCardFront: string) =>
        identityCardFront ? (
          <img src={identityCardFront} width={100} height={100} />
        ) : (
          "-"
        ),
    },
    {
      title: "证件背面",
      dataIndex: "identityCardBack",
      key: "identityCardBack",
      width: 100,
      render: (identityCardBack: string) =>
        identityCardBack ? (
          <img src={identityCardBack} width={100} height={100} />
        ) : (
          "-"
        ),
    },
    {
      title: "证件号码",
      dataIndex: "documentNumber",
      key: "documentNumber",
      width: 150,
      ellipsis: true,
    },
    {
      title: "国籍",
      dataIndex: "nationality",
      key: "nationality",
      width: 100,
    },
    {
      title: "KYC状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const statusConfig = {
          pending: { color: "processing", text: "待审核" },
          approved: { color: "success", text: "已通过" },
          rejected: { color: "error", text: "已拒绝" },
        };
        const config =
          statusConfig[status as keyof typeof statusConfig] ||
          statusConfig.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "提交时间",
      dataIndex: "submittedAt",
      key: "submittedAt",
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    },
    // {
    //   title: "审核时间",
    //   dataIndex: "reviewedAt",
    //   key: "reviewedAt",
    //   width: 180,
    //   render: (date: string) => (date ? new Date(date).toLocaleString() : "-"),
    // },
    // {
    //   title: "审核人",
    //   dataIndex: "reviewer",
    //   key: "reviewer",
    //   width: 120,
    //   render: (reviewer: string) => reviewer || "-",
    // },
    // {
    //   title: "操作",
    //   key: "action",
    //   width: 300,
    //   fixed: "right",
    //   render: (_, record) => (
    //     <Space size="small">
    //       <Button
    //         type="link"
    //         icon={<EyeOutlined />}
    //         onClick={() => handleView(record)}
    //       >
    //         查看
    //       </Button>
    //       {record.status === "pending" && (
    //         <>
    //           <Button
    //             type="link"
    //             icon={<CheckOutlined />}
    //             onClick={() => handleApprove(record)}
    //             style={{ color: "#52c41a" }}
    //           >
    //             通过
    //           </Button>
    //           <Button
    //             type="link"
    //             danger
    //             icon={<CloseOutlined />}
    //             onClick={() => handleReject(record)}
    //           >
    //             拒绝
    //           </Button>
    //         </>
    //       )}
    //       <Button
    //         type="link"
    //         icon={<EditOutlined />}
    //         onClick={() => handleEdit(record)}
    //       >
    //         编辑
    //       </Button>
    //       <Button
    //         type="link"
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDelete(record)}
    //       >
    //         删除
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadUserKycs();
  };

  const handleView = (userKyc: UserKyc) => {
    setViewingUserKyc(userKyc);
    setIsDetailModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUserKyc(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (userKyc: UserKyc) => {
    setEditingUserKyc(userKyc);
    form.setFieldsValue(userKyc);
    setIsModalOpen(true);
  };

  const handleApprove = (userKyc: UserKyc) => {
    Modal.confirm({
      title: "确认通过",
      content: `确定要通过用户 ${userKyc.userId} 的KYC认证吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用KYC审核通过API
          // await api.approveUserKyc(userKyc.id);
          setUserKycs(
            userKycs.map((uk) =>
              uk.id === userKyc.id
                ? {
                    ...uk,
                    status: "approved" as const,
                    reviewedAt: new Date().toISOString(),
                    reviewer: "admin",
                  }
                : uk
            )
          );
          message.success("KYC审核通过成功");
        } catch (error) {
          message.error("KYC审核通过失败");
        }
      },
    });
  };

  const handleReject = (userKyc: UserKyc) => {
    Modal.confirm({
      title: "确认拒绝",
      content: `确定要拒绝用户 ${userKyc.userId} 的KYC认证吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用KYC审核拒绝API
          // await api.rejectUserKyc(userKyc.id, rejectionReason);
          setUserKycs(
            userKycs.map((uk) =>
              uk.id === userKyc.id
                ? {
                    ...uk,
                    status: "rejected" as const,
                    reviewedAt: new Date().toISOString(),
                    reviewer: "admin",
                    rejectionReason: "不符合要求",
                  }
                : uk
            )
          );
          message.success("KYC审核拒绝成功");
        } catch (error) {
          message.error("KYC审核拒绝失败");
        }
      },
    });
  };

  const handleDelete = (userKyc: UserKyc) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除用户 ${userKyc.userId} 的KYC记录吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用删除KYC API
          // await api.deleteUserKyc(userKyc.id);
          setUserKycs(userKycs.filter((uk) => uk.id !== userKyc.id));
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
      if (editingUserKyc) {
        // TODO: 调用编辑KYC API
        // await api.updateUserKyc(editingUserKyc.id, values);
        setUserKycs(
          userKycs.map((uk) =>
            uk.id === editingUserKyc.id ? { ...uk, ...values } : uk
          )
        );
        message.success("更新成功");
      } else {
        // TODO: 调用新增KYC API
        // await api.createUserKyc(values);
        const newUserKyc: UserKyc = {
          id: Math.max(...userKycs.map((uk) => uk.id)) + 1,
          ...values,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUserKycs([...userKycs, newUserKyc]);
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
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增KYC
          </Button>
        </Space>
        <Search
          placeholder="搜索用户ID、姓名、证件号或证件类型"
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
        dataSource={userKycs}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
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

      {/* 详情查看模态框 */}
      <Modal
        title="KYC详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingUserKyc && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="用户ID">
              {viewingUserKyc.userId}
            </Descriptions.Item>
            <Descriptions.Item label="姓名">
              {viewingUserKyc.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="证件类型">
              {viewingUserKyc.documentType}
            </Descriptions.Item>
            <Descriptions.Item label="证件号码">
              {viewingUserKyc.documentNumber}
            </Descriptions.Item>
            <Descriptions.Item label="出生日期">
              {viewingUserKyc.birthDate}
            </Descriptions.Item>
            <Descriptions.Item label="国籍">
              {viewingUserKyc.nationality}
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>
              {viewingUserKyc.address}
            </Descriptions.Item>
            <Descriptions.Item label="KYC状态">
              <Tag
                color={
                  viewingUserKyc.status === "approved"
                    ? "success"
                    : viewingUserKyc.status === "rejected"
                    ? "error"
                    : "processing"
                }
              >
                {viewingUserKyc.status === "approved"
                  ? "已通过"
                  : viewingUserKyc.status === "rejected"
                  ? "已拒绝"
                  : "待审核"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="提交时间">
              {new Date(viewingUserKyc.submittedAt).toLocaleString()}
            </Descriptions.Item>
            {viewingUserKyc.reviewedAt && (
              <Descriptions.Item label="审核时间">
                {new Date(viewingUserKyc.reviewedAt).toLocaleString()}
              </Descriptions.Item>
            )}
            {viewingUserKyc.reviewer && (
              <Descriptions.Item label="审核人">
                {viewingUserKyc.reviewer}
              </Descriptions.Item>
            )}
            {viewingUserKyc.rejectionReason && (
              <Descriptions.Item label="拒绝原因" span={2}>
                {viewingUserKyc.rejectionReason}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 编辑模态框 */}
      <Modal
        title={editingUserKyc ? "编辑KYC" : "新增KYC"}
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
          initialValues={{ status: "pending" }}
        >
          <Form.Item
            name="userId"
            label="用户ID"
            rules={[{ required: true, message: "请输入用户ID" }]}
          >
            <Input type="number" placeholder="请输入用户ID" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="documentType"
            label="证件类型"
            rules={[{ required: true, message: "请选择证件类型" }]}
          >
            <Select>
              <Select.Option value="passport">护照</Select.Option>
              <Select.Option value="id_card">身份证</Select.Option>
              <Select.Option value="driver_license">驾驶证</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="documentNumber"
            label="证件号码"
            rules={[{ required: true, message: "请输入证件号码" }]}
          >
            <Input placeholder="请输入证件号码" />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="出生日期"
            rules={[{ required: true, message: "请输入出生日期" }]}
          >
            <Input placeholder="请输入出生日期" />
          </Form.Item>

          <Form.Item
            name="nationality"
            label="国籍"
            rules={[{ required: true, message: "请输入国籍" }]}
          >
            <Input placeholder="请输入国籍" />
          </Form.Item>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: "请输入地址" }]}
          >
            <Input.TextArea rows={3} placeholder="请输入地址" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserKycList;
