import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  DatePicker,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  ReloadOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { Withdraw, WithdrawListRequest } from "../types";
import { api } from "../utils/request";
import dayjs from "dayjs";

const { Search } = Input;

const WithdrawList: React.FC = () => {
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(
    undefined
  );
  const [chainFilter, setChainFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载提现记录数据
  useEffect(() => {
    loadWithdraws();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    statusFilter,
    chainFilter,
    dateRange,
  ]);

  const loadWithdraws = async () => {
    await loadWithdrawsWithSearch(
      searchText,
      statusFilter,
      chainFilter,
      dateRange
    );
  };

  const loadWithdrawsWithSearch = async (
    searchValue: string,
    statusValue: number | undefined,
    chainValue: string,
    dateValue: [dayjs.Dayjs, dayjs.Dayjs] | null
  ) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: WithdrawListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: "",
      };

      // 添加搜索条件
      const columns: any[] = [];

      // 用户ID搜索
      if (searchValue && searchValue.trim()) {
        columns.push({
          exp: "like",
          logic: "or",
          name: "uid",
          value: searchValue.trim(),
        });
        columns.push({
          exp: "like",
          logic: "or",
          name: "address",
          value: searchValue.trim(),
        });
        columns.push({
          exp: "like",
          logic: "or",
          name: "hash",
          value: searchValue.trim(),
        });
      }

      // 状态筛选
      if (statusValue !== undefined) {
        columns.push({
          exp: "eq",
          logic: "and",
          name: "status",
          value: statusValue.toString(),
        });
      }

      // 区块链筛选
      if (chainValue) {
        columns.push({
          exp: "eq",
          logic: "and",
          name: "chain",
          value: chainValue,
        });
      }

      // 日期范围筛选
      if (dateValue && dateValue[0] && dateValue[1]) {
        columns.push({
          exp: "gte",
          logic: "and",
          name: "created_at",
          value: dateValue[0].format("YYYY-MM-DD"),
        });
        columns.push({
          exp: "lte",
          logic: "and",
          name: "created_at",
          value: dateValue[1].format("YYYY-MM-DD"),
        });
      }

      queryData.columns = columns;

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
      message.error("获取提现记录失败");
      console.error("Load withdraws error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态标签颜色和文本
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { color: "orange", text: "待处理" };
      case 1:
        return { color: "blue", text: "处理中" };
      case 2:
        return { color: "green", text: "已完成" };
      case 3:
        return { color: "red", text: "失败" };
      case 4:
        return { color: "gray", text: "已取消" };
      default:
        return { color: "default", text: "未知" };
    }
  };

  // 格式化金额显示
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;

    // 截取到4位小数
    const truncated = Math.floor(num * 10000) / 10000;

    // 去掉小数点后末尾的0，但保留整数部分
    return truncated.toString().replace(/\.0+$/, "");
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success("已复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败");
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
      width: 150,
      ellipsis: true,
    },
    {
      title: "提现地址",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: true,
      render: (address: string) => (
        <Tooltip title={address}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(address)}
          >
            {address}
            <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "提现金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount: string) => `${formatAmount(amount)}`,
    },
    {
      title: "实际到账",
      dataIndex: "toAmount",
      key: "toAmount",
      width: 120,
      align: "right",
      render: (toAmount: string) => `${formatAmount(toAmount)}`,
    },
    {
      title: "手续费",
      dataIndex: "fee",
      key: "fee",
      width: 120,
      align: "right",
      render: (fee: string) => `${formatAmount(fee)}`,
    },
    {
      title: "区块链",
      dataIndex: "chain",
      key: "chain",
      width: 160,
      render: (chain: string) => <Tag color="blue">{chain}</Tag>,
    },
    {
      title: "交易哈希",
      dataIndex: "hash",
      key: "hash",
      width: 200,
      ellipsis: true,
      render: (hash: string) =>
        hash ? (
          <Tooltip title={hash}>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => copyToClipboard(hash)}
            >
              {hash}
              <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
            </span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const statusInfo = getStatusInfo(status);
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },

    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (createdAt: string) => {
        if (!createdAt) return "-";
        const date = new Date(createdAt);
        return date
          .toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(/\//g, "-");
      },
    },
    {
      title: "更新时间",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (updatedAt: string) => {
        if (!updatedAt) return "-";
        const date = new Date(updatedAt);
        return date
          .toLocaleString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(/\//g, "-");
      },
    },
    {
      title: "错误信息",
      dataIndex: "errorMessage",
      key: "errorMessage",
      width: 200,
      ellipsis: true,
      render: (errorMessage: string) => errorMessage || "-",
    },
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadWithdrawsWithSearch(searchText, statusFilter, chainFilter, dateRange);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadWithdrawsWithSearch，传入空的搜索文本
    loadWithdrawsWithSearch("", statusFilter, chainFilter, dateRange);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText("");
    setStatusFilter(undefined);
    setChainFilter("");
    setDateRange(null);
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadWithdrawsWithSearch("", undefined, "", null);
  };

  // 刷新数据
  const handleRefresh = () => {
    loadWithdraws();
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
      <div
        className="search-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
        <Space wrap>
          <Search
            placeholder="搜索用户ID、地址或哈希"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClear}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={setStatusFilter}
            onClear={() => setStatusFilter(undefined)}
          >
            <Select.Option value={0}>待处理</Select.Option>
            <Select.Option value={1}>处理中</Select.Option>
            <Select.Option value={2}>已完成</Select.Option>
            <Select.Option value={3}>失败</Select.Option>
            <Select.Option value={4}>已取消</Select.Option>
          </Select>
          <Select
            placeholder="选择区块链"
            allowClear
            style={{ width: 120 }}
            value={chainFilter}
            onChange={setChainFilter}
            onClear={() => setChainFilter("")}
          >
            <Select.Option value="ETH">ETH</Select.Option>
            <Select.Option value="BTC">BTC</Select.Option>
            <Select.Option value="USDT">USDT</Select.Option>
            <Select.Option value="TRX">TRX</Select.Option>
          </Select>
          <DatePicker.RangePicker
            placeholder={["开始日期", "结束日期"]}
            value={dateRange}
            onChange={(dates) =>
              setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
            }
            format="YYYY-MM-DD"
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          dataSource={withdraws}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500, y: "calc(100vh - 340px)" }}
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
    </div>
  );
};

export default WithdrawList;
