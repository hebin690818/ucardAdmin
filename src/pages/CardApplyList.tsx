import React, { useState, useEffect } from "react";
import { Table, Tag, Input, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { CardApply, CardApplyListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const CardApplyList: React.FC = () => {
  const [cardApplys, setCardApplys] = useState<CardApply[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载卡片申请数据
  useEffect(() => {
    loadCardApplys();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadCardApplys = async () => {
    await loadCardApplysWithSearch(searchText);
  };

  const loadCardApplysWithSearch = async (searchValue: string) => {
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
      if (searchValue && searchValue.trim()) {
        queryData.columns = [
          {
            exp: "like",
            logic: "or",
            name: "uid",
            value: searchValue.trim(),
          },
        ];
      }

      const response = await api.getCardApplyList(queryData);

      console.log(response);
      // 转换数据格式
      const cardApplyList: CardApply[] = response.cardApplys.map(
        (item: any) => ({
          id: item.id,
          uid: item.uid,
          userCode: item.userCode,
          billingCardID: item.billingCardID,
          cardType: item.cardType,
          phoneNumber: item.phoneNumber,
          dialCode: item.dialCode,
          email: item.email,
          billingAddress: item.billingAddress,
          billingCity: item.billingCity,
          billingCountryArea: item.billingCountryArea,
          billingPostCode: item.billingPostCode,
          postalAddress: item.postalAddress,
          postalCity: item.postalCity,
          postalCountryArea: item.postalCountryArea,
          postalPostCode: item.postalPostCode,
          postalFirstName: item.postalFirstName,
          postalLastName: item.postalLastName,
          postalProvince: item.postalProvince,
          postalRecipientTitle: item.postalRecipientTitle,
          postalOrderNo: item.postalOrderNo,
          status: item.status || "pending",
          applyTime: item.applyTime,
          reviewTime: item.reviewTime,
          reviewer: item.reviewer,
          remark: item.remark,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
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
      dataIndex: "uid",
      key: "uid",
      width: 120,
    },
    {
      title: "用户代码",
      dataIndex: "userCode",
      key: "userCode",
      width: 120,
    },
    {
      title: "账单卡片ID",
      dataIndex: "billingCardID",
      key: "billingCardID",
      width: 150,
    },
    {
      title: "卡片类型",
      dataIndex: "cardType",
      key: "cardType",
      width: 100,
      render: (cardType: number) => (
        <Tag>{cardType === 1 ? "实体卡" : "虚拟卡"}</Tag>
      ),
    },
    {
      title: "电话号码",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
      render: (phoneNumber: number, record: CardApply) => {
        if (!phoneNumber) return "-";
        return `+${record.dialCode} ${phoneNumber}`;
      },
    },
    {
      title: "申请时间",
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
      title: "审核时间",
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
    loadCardApplysWithSearch(searchText);
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 直接调用loadCardApplysWithSearch，传入空的搜索文本
    loadCardApplysWithSearch("");
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
          style={{ width: 400 }}
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
          dataSource={cardApplys}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800, y: "calc(100vh - 340px)" }}
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

export default CardApplyList;
