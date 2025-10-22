import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Input, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { WalletLog, WalletLogListRequest } from "../types";
import { api } from "../utils/request";
import { encodeSearchValue } from "../utils/encode";
import dayjs from "dayjs";

const { Search } = Input;

const WalletLogList: React.FC = () => {
  const [walletLogs, setWalletLogs] = useState<WalletLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载钱包日志数据
  useEffect(() => {
    loadWalletLogs();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    logTypeFilter,
    dateRange,
  ]);

  const loadWalletLogs = async () => {
    await loadWalletLogsWithSearch(searchText, logTypeFilter, dateRange);
  };

  const loadWalletLogsWithSearch = async (
    searchValue: string,
    logTypeValue: string,
    dateValue: [dayjs.Dayjs, dayjs.Dayjs] | null
  ) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: WalletLogListRequest = {
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
          value: encodeSearchValue(searchValue),
        });
      }

      // 日志类型筛选
      if (logTypeValue) {
        columns.push({
          exp: "eq",
          logic: "and",
          name: "logType",
          value: encodeSearchValue(logTypeValue),
        });
      }

      // 日期范围筛选
      if (dateValue && dateValue[0] && dateValue[1]) {
        columns.push({
          exp: "gte",
          logic: "and",
          name: "createdAt",
          value: encodeSearchValue(dateValue[0].format("YYYY-MM-DD")),
        });
        columns.push({
          exp: "lte",
          logic: "and",
          name: "createdAt",
          value: encodeSearchValue(dateValue[1].format("YYYY-MM-DD")),
        });
      }

      queryData.columns = columns;

      const response = await api.getWalletLogList(queryData);

      console.log(response);
      // 转换数据格式
      const walletLogList: WalletLog[] = response.walletLogs.map(
        (item: any) => ({
          afterAmount: item.afterAmount,
          amount: item.amount,
          beforeAmount: item.beforeAmount,
          createdAt: item.createdAt,
          logType: item.logType,
          otherID: item.otherID,
          uid: item.uid,
        })
      );

      setWalletLogs(walletLogList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取钱包日志失败");
      console.error("Load wallet logs error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取日志类型标签颜色
  const getLogTypeColor = (logType: string) => {
    switch (logType.toLowerCase()) {
      case "deposit":
      case "充值":
        return "green";
      case "withdraw":
      case "提现":
        return "red";
      case "transfer":
      case "转账":
        return "blue";
      case "refund":
      case "退款":
        return "orange";
      default:
        return "default";
    }
  };

  // 格式化金额显示
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? amount : num.toFixed(2);
  };

  // 表格列配置
  const columns: ColumnsType<WalletLog> = [
    {
      title: "用户ID",
      dataIndex: "uid",
      key: "uid",
      width: 150,
      ellipsis: true,
    },
    {
      title: "日志类型",
      dataIndex: "logType",
      key: "logType",
      width: 120,
      render: (logType: string) => (
        <Tag color={getLogTypeColor(logType)}>{logType}</Tag>
      ),
    },
    {
      title: "交易前金额",
      dataIndex: "beforeAmount",
      key: "beforeAmount",
      width: 120,
      align: "right",
      render: (amount: string) => `¥${formatAmount(amount)}`,
    },
    {
      title: "交易金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount: string) => {
        const num = parseFloat(amount);
        const color = num >= 0 ? "#52c41a" : "#ff4d4f";
        return (
          <span style={{ color }}>
            {num >= 0 ? "+" : ""}¥{formatAmount(amount)}
          </span>
        );
      },
    },
    {
      title: "交易后金额",
      dataIndex: "afterAmount",
      key: "afterAmount",
      width: 120,
      align: "right",
      render: (amount: string) => `¥${formatAmount(amount)}`,
    },
    {
      title: "其他ID",
      dataIndex: "otherID",
      key: "otherID",
      width: 150,
      ellipsis: true,
      render: (otherID: string) => otherID || "-",
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
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadWalletLogsWithSearch(searchText, logTypeFilter, dateRange);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadWalletLogsWithSearch，传入空的搜索文本
    loadWalletLogsWithSearch("", logTypeFilter, dateRange);
  };

  // 刷新数据
  const handleRefresh = () => {
    loadWalletLogs();
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
            placeholder="搜索用户ID"
            allowClear
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClear}
            prefix={<SearchOutlined />}
          />
        </Space>
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          dataSource={walletLogs}
          rowKey={(record) =>
            `${record.uid}-${record.createdAt}-${record.amount}`
          }
          loading={loading}
          scroll={{ x: 1000, y: "calc(100vh - 340px)" }}
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

export default WalletLogList;
