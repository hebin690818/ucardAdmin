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
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { CardApply, CardApplyListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const CardApplyList: React.FC = () => {
  const [cardApplys, setCardApplys] = useState<CardApply[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingCardApply, setViewingCardApply] = useState<CardApply | null>(
    null
  );
  const [form] = Form.useForm();

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载卡片申请数据
  useEffect(() => {
    loadCardApplys();
  }, [pagination.current, pagination.pageSize]);

  const loadCardApplys = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: CardApplyListRequest = {
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
            name: "cardId",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "status",
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getCardApplyList(queryData);

      console.log(response);
      // 转换数据格式
      const cardApplyList: CardApply[] = response.cardApplys.map(
        (item: any) => ({
          id: item.id,
          userId: item.uid,
          cardId: item.cardId,
          status: item.status || "pending",
          applyTime: item.createdAt,
          reviewTime: item.updatedAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // 用户信息字段
          uid: item.uid,
          userCode: item.userCode,
          email: item.email,
          phoneNumber: item.phoneNumber,
          dialCode: item.dialCode,
          // 卡片类型
          cardType: item.cardType,
          // 账单地址信息
          billingAddress: item.billingAddress,
          billingCity: item.billingCity,
          billingCountryArea: item.billingCountryArea,
          billingPostCode: item.billingPostCode,
          billingCardID: item.billingCardID,
          // 邮寄地址信息
          postalAddress: item.postalAddress,
          postalCity: item.postalCity,
          postalCountryArea: item.postalCountryArea,
          postalPostCode: item.postalPostCode,
          postalFirstName: item.postalFirstName,
          postalLastName: item.postalLastName,
          postalRecipientTitle: item.postalRecipientTitle,
          postalOrderNo: item.postalOrderNo,
        })
      );

      setCardApplys(cardApplyList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取卡片申请列表失败");
      console.error("Load card applys error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<CardApply> = [
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
      title: "卡片类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: number) => {
        return type === 1 ? "实体卡" : "虚拟卡";
      },
    },
    {
      title: "申请状态",
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
      title: "申请时间",
      dataIndex: "applyTime",
      key: "applyTime",
      width: 180,
      render: (applyTime: string) =>
        applyTime ? new Date(applyTime).toLocaleString() : "-",
    },
    {
      title: "审核时间",
      dataIndex: "reviewTime",
      key: "reviewTime",
      width: 180,
      render: (reviewTime: string) =>
        reviewTime ? new Date(reviewTime).toLocaleString() : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 250,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={{ color: "#52c41a" }}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
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
    loadCardApplys();
  };

  const handleViewDetail = (cardApply: CardApply) => {
    setViewingCardApply(cardApply);
    setIsDetailModalOpen(true);
  };

  const handleApprove = (cardApply: CardApply) => {
    Modal.confirm({
      title: "确认通过",
      content: `确定要通过用户 ${cardApply.userId} 的卡片申请吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用审核通过API
          // await api.approveCardApply(cardApply.id);
          setCardApplys(
            cardApplys.map((ca) =>
              ca.id === cardApply.id
                ? {
                    ...ca,
                    status: "approved" as const,
                    reviewTime: new Date().toISOString(),
                    reviewer: "admin",
                  }
                : ca
            )
          );
          message.success("审核通过成功");
        } catch (error) {
          message.error("审核通过失败");
        }
      },
    });
  };

  const handleReject = (cardApply: CardApply) => {
    Modal.confirm({
      title: "确认拒绝",
      content: `确定要拒绝用户 ${cardApply.userId} 的卡片申请吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用审核拒绝API
          // await api.rejectCardApply(cardApply.id);
          setCardApplys(
            cardApplys.map((ca) =>
              ca.id === cardApply.id
                ? {
                    ...ca,
                    status: "rejected" as const,
                    reviewTime: new Date().toISOString(),
                    reviewer: "admin",
                  }
                : ca
            )
          );
          message.success("审核拒绝成功");
        } catch (error) {
          message.error("审核拒绝失败");
        }
      },
    });
  };

  const handleDelete = (cardApply: CardApply) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除申请记录吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        try {
          // TODO: 调用删除申请API
          // await api.deleteCardApply(cardApply.id);
          setCardApplys(cardApplys.filter((ca) => ca.id !== cardApply.id));
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
      // TODO: 调用新增申请API
      // await api.createCardApply(values);
      const newCardApply: CardApply = {
        id: Math.max(...cardApplys.map((ca) => ca.id)) + 1,
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCardApplys([...cardApplys, newCardApply]);
      message.success("添加成功");
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
        <Space></Space>
        <Search
          placeholder="搜索用户ID、卡片ID或状态"
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
        dataSource={cardApplys}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
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

      <Modal
        title="新增申请"
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
            name="cardId"
            label="卡片ID"
            rules={[{ required: true, message: "请输入卡片ID" }]}
          >
            <Input type="number" placeholder="请输入卡片ID" />
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

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 卡片申请详情模态框 */}
      <Modal
        title="卡片申请详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingCardApply && (
          <div style={{ padding: "16px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* 基本信息 */}
              <div>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  基本信息
                </h4>
                <div style={{ marginBottom: "8px" }}>
                  <strong>ID:</strong> {viewingCardApply.id}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>用户ID:</strong> {viewingCardApply.uid || "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>用户代码:</strong> {viewingCardApply.userCode || "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>邮箱:</strong> {viewingCardApply.email || "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>电话:</strong>{" "}
                  {viewingCardApply.dialCode
                    ? `+${viewingCardApply.dialCode}`
                    : ""}
                  {viewingCardApply.phoneNumber || "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>卡片类型:</strong>{" "}
                  {viewingCardApply.cardType === 1 ? "实体卡" : "虚拟卡"}
                </div>
              </div>

              {/* 申请信息 */}
              <div>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  申请信息
                </h4>
                <div style={{ marginBottom: "8px" }}>
                  <strong>申请状态:</strong>
                  <Tag
                    color={
                      viewingCardApply.status === "pending"
                        ? "processing"
                        : viewingCardApply.status === "approved"
                        ? "success"
                        : "error"
                    }
                    style={{ marginLeft: "8px" }}
                  >
                    {viewingCardApply.status === "pending"
                      ? "待审核"
                      : viewingCardApply.status === "approved"
                      ? "已通过"
                      : "已拒绝"}
                  </Tag>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>申请时间:</strong>{" "}
                  {viewingCardApply.applyTime
                    ? new Date(viewingCardApply.applyTime).toLocaleString()
                    : "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>审核时间:</strong>{" "}
                  {viewingCardApply.reviewTime
                    ? new Date(viewingCardApply.reviewTime).toLocaleString()
                    : "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>审核人:</strong> {viewingCardApply.reviewer || "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>更新时间:</strong>{" "}
                  {viewingCardApply.updatedAt
                    ? new Date(viewingCardApply.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            {/* 账单地址信息 */}
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                账单地址信息
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>账单地址:</strong>{" "}
                    {viewingCardApply.billingAddress || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>账单城市:</strong>{" "}
                    {viewingCardApply.billingCity || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>账单国家/地区:</strong>{" "}
                    {viewingCardApply.billingCountryArea || "-"}
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>账单邮编:</strong>{" "}
                    {viewingCardApply.billingPostCode || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>账单卡ID:</strong>{" "}
                    {viewingCardApply.billingCardID || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 邮寄地址信息 */}
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                邮寄地址信息
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>邮寄地址:</strong>{" "}
                    {viewingCardApply.postalAddress || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>邮寄城市:</strong>{" "}
                    {viewingCardApply.postalCity || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>邮寄国家/地区:</strong>{" "}
                    {viewingCardApply.postalCountryArea || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>邮寄邮编:</strong>{" "}
                    {viewingCardApply.postalPostCode || "-"}
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>收件人姓名:</strong>{" "}
                    {viewingCardApply.postalFirstName || "-"}{" "}
                    {viewingCardApply.postalLastName || ""}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>收件人称呼:</strong>{" "}
                    {viewingCardApply.postalRecipientTitle || "-"}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>邮寄订单号:</strong>{" "}
                    {viewingCardApply.postalOrderNo || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 备注信息 */}
            {viewingCardApply.remark && (
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  备注信息
                </h4>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  {viewingCardApply.remark}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CardApplyList;
