import React, { useState, useEffect } from "react";
import { Table, Tag, Input, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { Card, CardListRequest, CardStatus } from "../types";
import { CARD_STATUS_MAP } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const CardList: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载卡片数据
  useEffect(() => {
    loadCards();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadCards = async () => {
    await loadCardsWithSearch(searchText);
  };

  const loadCardsWithSearch = async (searchValue: string) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryData: CardListRequest = {
        columns: [],
        limit: pagination.pageSize,
        page: pagination.current - 1, // API从0开始
        sort: "id",
      };
      console.log('searchValue', searchValue);
      // 如果有搜索条件，添加搜索列
      if (searchValue && searchValue.trim()) {
        console.log(11111);
        queryData.columns = [
          {
            exp: "like",
            logic: "or",
            name: "card_id",
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

      const response = await api.getCardList(queryData);

      console.log(response);
      // 转换数据格式
      const cardList: Card[] = response.cards.map((item: any) => ({
        id: item.id,
        cardID: item.cardID,
        description: item.description,
        type: item.cardType,
        status: item.cardStatus,
        userId: item.uid,
        createdAt: item.createdAt,
      }));

      setCards(cardList);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("获取卡片列表失败");
      console.error("Load cards error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 表格列配置
  const columns: ColumnsType<Card> = [
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
      width: 200,
    },
    {
      title: "卡片ID",
      dataIndex: "cardID",
      key: "cardID",
      width: 200,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      width: 80,
      render: (type: number) => <Tag>{type === 1 ? "实体卡" : "虚拟卡"}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: CardStatus) => {
        const getStatusColor = (status: CardStatus) => {
          switch (status) {
            case "1":
              return "blue"; // 申请中
            case "2":
              return "orange"; // 制作中
            case "3":
              return "cyan"; // 已发货
            case "4":
              return "green"; // 已激活
            case "5":
              return "purple"; // 注销中
            case "6":
              return "red"; // 已注销
            case "7":
              return "volcano"; // 已冻结
            case "8":
              return "magenta"; // 已锁定
            case "9":
              return "default"; // 已过期
            case "10":
              return "gold"; // 等待绑定
            case "11":
              return "lime"; // 待激活
            default:
              return "default";
          }
        };

        return (
          <Tag color={getStatusColor(status)}>
            {CARD_STATUS_MAP[status] || status}
          </Tag>
        );
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
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadCardsWithSearch(searchText);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadCardsWithSearch，传入空的搜索文本
    loadCardsWithSearch("");
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
          placeholder="搜索用户ID"
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
          dataSource={cards}
          rowKey="id"
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

export default CardList;
