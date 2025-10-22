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
import type { Deposit, DepositListRequest } from "../types";
import { api } from "../utils/request";
import { encodeSearchValue } from "../utils/encode";
import dayjs from "dayjs";

const { Search } = Input;

const DepositList: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
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

  // 加载充值记录数据
  useEffect(() => {
    loadDeposits();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    chainFilter,
    dateRange,
  ]);

  const loadDeposits = async () => {
    await loadDepositsWithSearch(searchText, chainFilter, dateRange);
  };

  const loadDepositsWithSearch = async (
    searchValue: string,
    chainValue: string,
    dateValue: [dayjs.Dayjs, dayjs.Dayjs] | null
  ) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: DepositListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: "created_at",
      };

      // 添加搜索条件
      const columns: any[] = [];

      // 地址和哈希搜索
      if (searchValue && searchValue.trim()) {
        const encodedValue = encodeSearchValue(searchValue);
        columns.push({
          exp: "like",
          logic: "or",
          name: "from",
          value: encodedValue,
        });
        columns.push({
          exp: "like",
          logic: "or",
          name: "to",
          value: encodedValue,
        });
        columns.push({
          exp: "like",
          logic: "or",
          name: "hash",
          value: encodedValue,
        });
        columns.push({
          exp: "like",
          logic: "or",
          name: "contract",
          value: encodedValue,
        });
      }

      // 区块链筛选
      if (chainValue) {
        columns.push({
          exp: "eq",
          logic: "and",
          name: "chain",
          value: encodeSearchValue(chainValue),
        });
      }

      // 日期范围筛选
      if (dateValue && dateValue[0] && dateValue[1]) {
        columns.push({
          exp: "gte",
          logic: "and",
          name: "created_at",
          value: encodeSearchValue(dateValue[0].format("YYYY-MM-DD")),
        });
        columns.push({
          exp: "lte",
          logic: "and",
          name: "created_at",
          value: encodeSearchValue(dateValue[1].format("YYYY-MM-DD")),
        });
      }

      queryData.columns = columns;

      const response = await api.getDepositList(queryData);

      console.log(response);
      // 转换数据格式
      const depositList: Deposit[] = response.deposits.map((item: any) => ({
        id: item.id,
        blockNumber: item.blockNumber,
        chain: item.chain,
        contract: item.contract,
        from: item.from,
        to: item.to,
        hash: item.hash,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      setDeposits(depositList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取充值记录失败");
      console.error("Load deposits error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取区块链标签颜色
  const getChainColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "eth":
      case "ethereum":
        return "blue";
      case "btc":
      case "bitcoin":
        return "orange";
      case "usdt":
        return "green";
      case "trx":
      case "tron":
        return "red";
      case "bsc":
      case "binance":
        return "yellow";
      default:
        return "default";
    }
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
  const columns: ColumnsType<Deposit> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "区块号",
      dataIndex: "blockNumber",
      key: "blockNumber",
      width: 100,
      render: (blockNumber: number) => blockNumber,
    },
    {
      title: "区块链",
      dataIndex: "chain",
      key: "chain",
      width: 140,
      render: (chain: string) => (
        <Tag color={getChainColor(chain)}>{chain.toUpperCase()}</Tag>
      ),
    },
    {
      title: "合约地址",
      dataIndex: "contract",
      key: "contract",
      width: 200,
      ellipsis: true,
      render: (contract: string) =>
        contract ? (
          <Tooltip title={contract}>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => copyToClipboard(contract)}
            >
              {contract}
              <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
            </span>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      title: "发送方地址",
      dataIndex: "from",
      key: "from",
      width: 200,
      ellipsis: true,
      render: (from: string) => (
        <Tooltip title={from}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(from)}
          >
            {from}
            <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "接收方地址",
      dataIndex: "to",
      key: "to",
      width: 200,
      ellipsis: true,
      render: (to: string) => (
        <Tooltip title={to}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(to)}
          >
            {to}
            <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "交易哈希",
      dataIndex: "hash",
      key: "hash",
      width: 200,
      ellipsis: true,
      render: (hash: string) => (
        <Tooltip title={hash}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => copyToClipboard(hash)}
          >
            {hash}
            <CopyOutlined style={{ marginLeft: 4, color: "#1890ff" }} />
          </span>
        </Tooltip>
      ),
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
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadDepositsWithSearch(searchText, chainFilter, dateRange);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadDepositsWithSearch，传入空的搜索文本
    loadDepositsWithSearch("", chainFilter, dateRange);
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText("");
    setChainFilter("");
    setDateRange(null);
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadDepositsWithSearch("", "", null);
  };

  // 刷新数据
  const handleRefresh = () => {
    loadDeposits();
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
            placeholder="搜索地址或哈希"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            onClear={handleClear}
            prefix={<SearchOutlined />}
          />
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
            <Select.Option value="BSC">BSC</Select.Option>
            <Select.Option value="POLYGON">POLYGON</Select.Option>
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
          dataSource={deposits}
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

export default DepositList;
