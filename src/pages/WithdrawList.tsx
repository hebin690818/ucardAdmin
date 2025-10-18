import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  message,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  SearchOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { Withdraw, WithdrawListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

// 状态映射函数
const getStatusText = (status: number): string => {
  const statusMap: { [key: number]: string } = {
    0: '待处理',
    1: '处理中',
    2: '已完成',
    3: '已失败',
    4: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取状态对应的颜色
const getStatusColor = (status: number): string => {
  const colorMap: { [key: number]: string } = {
    0: 'processing',
    1: 'warning',
    2: 'success',
    3: 'error',
    4: 'default'
  };
  return colorMap[status] || 'default';
};

const WithdrawList: React.FC = () => {
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingWithdraw, setViewingWithdraw] = useState<Withdraw | null>(null);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载提币数据
  useEffect(() => {
    loadWithdraws();
  }, [pagination.current, pagination.pageSize]);

  const loadWithdraws = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: WithdrawListRequest = {
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
            name: "uid",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "address",
            value: searchText.trim(),
          },
          {
            exp: "like",
            logic: "or",
            name: "hash",
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getWithdrawList(queryData);

      console.log(response);
      // 转换数据格式
      const withdrawList: Withdraw[] = response.withdraws.map((item: any) => ({
        id: item.id,
        uid: item.uid,
        address: item.address,
        amount: item.amount,
        toAmount: item.toAmount,
        fee: item.fee,
        chain: item.chain,
        hash: item.hash,
        status: item.status,
        errorMessage: item.errorMessage,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setWithdraws(withdrawList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取提币列表失败");
      console.error("Load withdraws error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("已复制到剪贴板");
    });
  };

  // 表格列配置
  const columns: ColumnsType<Withdraw> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "用户ID",
      dataIndex: "uid",
      key: "uid",
      width: 120,
      render: (uid: string) => (
        <span style={{ fontFamily: "monospace" }}>{uid}</span>
      ),
    },
    {
      title: "提币地址",
      dataIndex: "address",
      key: "address",
      width: 200,
      render: (address: string) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
            {address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address}
          </span>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(address)}
            title="复制地址"
          />
        </div>
      ),
    },
    {
      title: "提币数量",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: string) => (
        <span style={{ fontFamily: "monospace" }}>{amount}</span>
      ),
    },
    {
      title: "到账数量",
      dataIndex: "toAmount",
      key: "toAmount",
      width: 120,
      render: (toAmount: string) => (
        <span style={{ fontFamily: "monospace" }}>{toAmount}</span>
      ),
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      width: 100,
      render: (fee: string) => (
        <span style={{ fontFamily: "monospace" }}>{fee}</span>
      ),
    },
    {
      title: "链",
      dataIndex: "chain",
      key: "chain",
      width: 80,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "交易哈希",
      dataIndex: "hash",
      key: "hash",
      width: 200,
      render: (hash: string) => (
        hash ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
              {hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-10)}` : hash}
            </span>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(hash)}
              title="复制哈希"
            />
          </div>
        ) : (
          <span style={{ color: "#999" }}>-</span>
        )
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) =>
        createdAt ? new Date(createdAt).toLocaleString() : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadWithdraws();
  };

  const handleViewDetail = (withdraw: Withdraw) => {
    setViewingWithdraw(withdraw);
    setIsDetailModalOpen(true);
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
          placeholder="搜索用户ID、地址或交易哈希"
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
        dataSource={withdraws}
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

      {/* 提币详情模态框 */}
      <Modal
        title="提币详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {viewingWithdraw && (
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {/* 基本信息 */}
              <div>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  基本信息
                </h4>
                <div style={{ marginBottom: "8px" }}>
                  <strong>ID:</strong> {viewingWithdraw.id}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>用户ID:</strong>{" "}
                  <span style={{ fontFamily: "monospace" }}>
                    {viewingWithdraw.uid}
                  </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>提币数量:</strong>{" "}
                  <span style={{ fontFamily: "monospace" }}>
                    {viewingWithdraw.amount}
                  </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>到账数量:</strong>{" "}
                  <span style={{ fontFamily: "monospace" }}>
                    {viewingWithdraw.toAmount}
                  </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>手续费:</strong>{" "}
                  <span style={{ fontFamily: "monospace" }}>
                    {viewingWithdraw.fee}
                  </span>
                </div>
              </div>

              {/* 状态信息 */}
              <div>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  状态信息
                </h4>
                <div style={{ marginBottom: "8px" }}>
                  <strong>状态:</strong>
                  <Tag
                    color={getStatusColor(viewingWithdraw.status)}
                    style={{ marginLeft: "8px" }}
                  >
                    {getStatusText(viewingWithdraw.status)}
                  </Tag>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>链:</strong> {viewingWithdraw.chain}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>创建时间:</strong>{" "}
                  {viewingWithdraw.createdAt
                    ? new Date(viewingWithdraw.createdAt).toLocaleString()
                    : "-"}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>更新时间:</strong>{" "}
                  {viewingWithdraw.updatedAt
                    ? new Date(viewingWithdraw.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            {/* 地址信息 */}
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                地址信息
              </h4>
              <div style={{ marginBottom: "8px" }}>
                <strong>提币地址:</strong>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "4px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#f5f5f5",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      wordBreak: "break-all",
                    }}
                  >
                    {viewingWithdraw.address}
                  </span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(viewingWithdraw.address)}
                    title="复制地址"
                  />
                </div>
              </div>
            </div>

            {/* 交易信息 */}
            {viewingWithdraw.hash && (
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                  交易信息
                </h4>
                <div style={{ marginBottom: "8px" }}>
                  <strong>交易哈希:</strong>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        backgroundColor: "#f5f5f5",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        wordBreak: "break-all",
                      }}
                    >
                      {viewingWithdraw.hash}
                    </span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(viewingWithdraw.hash)}
                      title="复制哈希"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {viewingWithdraw.errorMessage && (
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "12px", color: "#ff4d4f" }}>
                  错误信息
                </h4>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "4px",
                    color: "#ff4d4f",
                  }}
                >
                  {viewingWithdraw.errorMessage}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WithdrawList;
