import React, { useState, useEffect } from "react";
import { Table, Input, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import type { UserKyc, UserKycListRequest } from "../types";
import { api } from "../utils/request";

const { Search } = Input;

const UserKycList: React.FC = () => {
  const [userKycs, setUserKycs] = useState<UserKyc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

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
      if (searchText && searchText.trim()) {
        queryData.columns = [
          {
            exp: "like",
            logic: "or",
            name: "uid",
            value: searchText.trim(),
          },
        ];
      }

      const response = await api.getUserKycList(queryData);

      console.log(response);
      // 转换数据格式
      const userKycList: UserKyc[] = response.usersKycs.map((item: any) => ({
        id: item.id,
        account_id: item.account_id || "",
        birthday: item.birthday || "",
        countryArea: item.countryArea || "",
        createdAt: item.createdAt || "",
        destination: item.destination || "",
        firstNameEn: item.firstNameEn || "",
        identityBackPicURL: item.identityBackPicURL || "",
        identityCard: item.identityCard || "",
        identityCardType: item.identityCardType || 0,
        identityCardValidityTime: item.identityCardValidityTime || "",
        identityFrontPicURL: item.identityFrontPicURL || "",
        issueDate: item.issueDate || "",
        lastNameEn: item.lastNameEn || "",
        permitNumber: item.permitNumber || "",
        transaction_id: item.transaction_id || "",
        uid: item.uid || "",
        updatedAt: item.updatedAt || "",
        usercode: item.usercode || "",
        validUntil: item.validUntil || "",
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
      dataIndex: "uid",
      key: "uid",
      width: 150,
      ellipsis: true,
    },
    {
      title: "用户代码",
      dataIndex: "usercode",
      key: "usercode",
      width: 120,
    },
    {
      title: "姓名",
      dataIndex: "firstNameEn",
      key: "firstNameEn",
      width: 100,
      render: (firstNameEn: string, record: UserKyc) =>
        `${firstNameEn} ${record.lastNameEn}`,
    },
    {
      title: "证件类型",
      dataIndex: "identityCardType",
      key: "identityCardType",
      width: 100,
      render: (type: number) => {
        const typeMap: Record<number, string> = {
          1: "身份证",
          2: "护照",
          3: "驾驶证",
          4: "其他",
        };
        return typeMap[type] || "未知";
      },
    },
    {
      title: "证件号码",
      dataIndex: "identityCard",
      key: "identityCard",
      width: 150,
      ellipsis: true,
    },
    {
      title: "证件正面图片",
      dataIndex: "identityFrontPicURL",
      key: "identityFrontPicURL",
      width: 150,
      render: (url: string) => {
        return (
          <img src={url} alt="证件正面" style={{ width: 100, height: 100 }} />
        );
      },
    },
    {
      title: "证件背面图片",
      dataIndex: "identityBackPicURL",
      key: "identityBackPicURL",
      width: 150,
      render: (url: string) => {
        return (
          <img src={url} alt="证件背面" style={{ width: 100, height: 100 }} />
        );
      },
    },
    {
      title: "国家/地区",
      dataIndex: "countryArea",
      key: "countryArea",
      width: 100,
    },
    {
      title: "出生日期",
      dataIndex: "birthday",
      key: "birthday",
      width: 120,
      render: (birthday: string) => {
        if (!birthday) return "-";
        return new Date(birthday).toLocaleDateString("zh-CN");
      },
    },
    {
      title: "证件有效期",
      dataIndex: "identityCardValidityTime",
      key: "identityCardValidityTime",
      width: 120,
      render: (validityTime: string) => {
        if (!validityTime) return "-";
        return new Date(validityTime).toLocaleDateString("zh-CN");
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
  ];

  // 搜索功能
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadUserKycs();
  };

  // 清除搜索
  const handleClear = () => {
    setSearchText("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    // 清除搜索后重新加载数据
    setTimeout(() => {
      loadUserKycs();
    }, 0);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // 如果输入框被清空，自动触发搜索
    if (value === "") {
      setPagination((prev) => ({ ...prev, current: 1 }));
      setTimeout(() => {
        loadUserKycs();
      }, 100); // 稍微延迟以确保状态更新
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
          placeholder="搜索用户ID、用户代码、姓名或证件号"
          allowClear
          style={{ width: 400 }}
          value={searchText}
          onChange={handleInputChange}
          onSearch={handleSearch}
          onClear={handleClear}
          prefix={<SearchOutlined />}
          enterButton="搜索"
          size="middle"
        />
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          dataSource={userKycs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 2000, y: 'calc(100vh - 340px)' }}
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

export default UserKycList;
