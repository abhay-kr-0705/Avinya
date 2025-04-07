import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  Select, 
  Space, 
  message, 
  Popconfirm, 
  Tooltip,
  Typography,
  Tag,
  Upload,
  Empty,
  Card,
  Tabs
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  UploadOutlined,
  ExportOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getLeaderboard, addLeaderboardEntry, updateLeaderboardEntry, deleteLeaderboardEntry, LeaderboardEntry, getEvents } from '../../services/api';
import { handleError } from '../../utils/errorHandling';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const categoryOptions = [
  'Technical', 
  'Non-Technical', 
  'Cultural', 
  'Sports', 
  'Gaming',
  'Overall'
];

const positionOptions = [
  'First', 
  'Second', 
  'Third', 
  'Participation'
];

// College list sorted alphabetically
const COLLEGE_LIST = [
  "Gaya College of Engineering, Gaya",
  "Darbhanga College of Engineering, Darbhanga",
  "Motihari College of Engineering, Motihari",
  "Muzaffarpur Institute of Technology, Muzaffarpur",
  "Bhagalpur College of Engineering, Bhagalpur",
  "Nalanda College of Engineering, Nalanda",
  "Loknayak Jai Prakash Institute of Technology, Saran",
  "Sitamarhi Institute of Technology, Sitamarhi",
  "Bakhtiyarpur College of Engineering, Patna",
  "Rashtrakavi Ramdhari Singh Dinkar College of Engineering, Begusarai",
  "Katihar Engineering College, Katihar",
  "Shershah College of Engineering, Rohtas",
  "BP Mandal College of Engineering, Madhepura",
  "Saharsa College of Engineering, Saharsa",
  "Supaul College of Engineering, Supaul",
  "Purnea College of Engineering, Purnea",
  "Government Engineering College, Vaishali",
  "Government Engineering College, Banka",
  "Government Engineering College, Jamui",
  "Government Engineering College, Bhojpur",
  "Government Engineering College, Siwan",
  "Government Engineering College, Madhubani",
  "Government Engineering College, Arwal",
  "Government Engineering College, Aurangabad",
  "Government Engineering College, Jehanabad",
  "Government Engineering College, Khagaria",
  "Government Engineering College, Buxar",
  "Government Engineering College, Sheikhpura",
  "Government Engineering College, Lakhisarai",
  "Government Engineering College, Kishanganj",
  "Government Engineering College, Sheohar",
  "Government Engineering College, Kaimur",
  "Government Engineering College, Gopalganj",
  "Government Engineering College, Munger",
  "Government Engineering College, West Champaran",
  "Government Engineering College, Nawada",
  "Government Engineering College, Samastipur",
  "Shri Phanishwar Nath Renu Engineering College, Araria"
].sort();

const ManageLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [form] = Form.useForm();

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      handleError(err);
      message.error('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Filter by search text
  const filteredLeaderboard = leaderboard.filter(entry => {
    const searchVal = searchText.toLowerCase();
    return (
      entry.name.toLowerCase().includes(searchVal) ||
      entry.college.toLowerCase().includes(searchVal) ||
      entry.eventName.toLowerCase().includes(searchVal) ||
      entry.category.toLowerCase().includes(searchVal) ||
      entry.position.toLowerCase().includes(searchVal)
    );
  });

  // Handle form submit for adding or updating entries
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (selectedEntry) {
        // Update existing entry
        await updateLeaderboardEntry(selectedEntry.id, values);
        message.success('Leaderboard entry updated successfully');
      } else {
        // Add new entry
        await addLeaderboardEntry(values);
        message.success('Leaderboard entry added successfully');
      }
      // Refresh data
      fetchLeaderboard();
      // Close modal and reset form
      setModalVisible(false);
      form.resetFields();
      setSelectedEntry(null);
    } catch (err) {
      handleError(err);
      message.error(selectedEntry ? 'Failed to update entry' : 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteLeaderboardEntry(id);
      message.success('Leaderboard entry deleted successfully');
      fetchLeaderboard();
    } catch (err) {
      handleError(err);
      message.error('Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };

  // Open modal to add new entry
  const showAddModal = () => {
    setSelectedEntry(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open modal to edit existing entry
  const showEditModal = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    form.setFieldsValue({
      ...entry
    });
    setModalVisible(true);
  };

  // Calculate points based on position
  const calculatePoints = (position: string): number => {
    switch (position) {
      case 'First':
        return 10;
      case 'Second':
        return 7;
      case 'Third':
        return 5;
      case 'Participation':
        return 2;
      default:
        return 0;
    }
  };

  // Update points when position changes
  const handlePositionChange = (value: string) => {
    const points = calculatePoints(value);
    form.setFieldsValue({ points });
  };

  // Table columns configuration
  const columns: ColumnsType<LeaderboardEntry> = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      sorter: (a, b) => a.rank - b.rank,
      render: (rank: number) => (
        <Tag color="gold" icon={<TrophyOutlined />} className="text-center w-12">
          {rank}
        </Tag>
      )
    },
    {
      title: 'Participant',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LeaderboardEntry) => (
        <div className="flex items-center">
          {record.thumbnail && (
            <img 
              src={record.thumbnail} 
              alt={text} 
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
          )}
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      title: 'College',
      dataIndex: 'college',
      key: 'college',
      ellipsis: true,
    },
    {
      title: 'Event',
      dataIndex: 'eventName',
      key: 'eventName',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categoryOptions.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.category === value.toString(),
      render: (category: string) => {
        let color = '';
        switch (category) {
          case 'Technical':
            color = 'blue';
            break;
          case 'Non-Technical':
            color = 'green';
            break;
          case 'Cultural':
            color = 'purple';
            break;
          case 'Sports':
            color = 'orange';
            break;
          case 'Gaming':
            color = 'red';
            break;
          case 'Overall':
            color = 'geekblue';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{category}</Tag>;
      }
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      filters: positionOptions.map(pos => ({ text: pos, value: pos })),
      onFilter: (value, record) => record.position === value.toString(),
      render: (position: string) => {
        let color = '';
        switch (position) {
          case 'First':
            color = 'gold';
            break;
          case 'Second':
            color = 'silver';
            break;
          case 'Third':
            color = '#cd7f32'; // bronze
            break;
          default:
            color = '#a0a0a0';
        }
        return <Tag color={color}>{position}</Tag>;
      }
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      render: (points: number) => (
        <Text strong>{points}</Text>
      )
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this entry?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Export to CSV function
  const exportToCSV = () => {
    if (leaderboard.length === 0) {
      message.warning('No data to export');
      return;
    }

    // Create CSV header
    const headers = Object.keys(leaderboard[0])
      .filter(key => key !== 'id' && key !== 'thumbnail')
      .join(',');
    
    // Create CSV rows
    const rows = leaderboard.map(entry => 
      Object.entries(entry)
        .filter(([key]) => key !== 'id' && key !== 'thumbnail')
        .map(([_, value]) => {
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',')
    ).join('\n');
    
    // Combine header and rows
    const csv = `${headers}\n${rows}`;
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>
          <TrophyOutlined className="mr-2 text-yellow-500" /> 
          Leaderboard Management
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={exportToCSV}
            disabled={leaderboard.length === 0}
          >
            Export CSV
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            Add Entry
          </Button>
        </Space>
      </div>

      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <Input
          placeholder="Search by name, college, event..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-md shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredLeaderboard}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                description="No leaderboard entries found" 
              />
            )
          }}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedEntry ? 'Edit Leaderboard Entry' : 'Add New Leaderboard Entry'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedEntry(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ 
            position: 'Participation',
            points: calculatePoints('Participation'),
            year: new Date().getFullYear().toString()
          }}
        >
          <Form.Item
            name="rank"
            label="Rank"
            rules={[{ required: true, message: 'Please enter rank' }]}
          >
            <Input type="number" min={1} placeholder="Rank position (1, 2, 3...)" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Participant Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Full name of participant" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="participant@example.com" />
          </Form.Item>

          <Form.Item
            name="college"
            label="College"
            rules={[{ required: true, message: 'Please enter college name' }]}
          >
            <Input placeholder="Name of college/university" />
          </Form.Item>

          <Form.Item
            name="eventName"
            label="Event Name"
            rules={[{ required: true, message: 'Please enter event name' }]}
          >
            <Input placeholder="Name of the event" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select event category">
              {categoryOptions.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: 'Please select a position' }]}
          >
            <Select 
              placeholder="Select position"
              onChange={handlePositionChange}
            >
              {positionOptions.map(position => (
                <Option key={position} value={position}>{position}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="points"
            label="Points"
            rules={[{ required: true, message: 'Please enter points' }]}
          >
            <Input type="number" min={0} placeholder="Points awarded" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Year"
          >
            <Input placeholder="Year of achievement" />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Participant Image URL (Optional)"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                {selectedEntry ? 'Update' : 'Add'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageLeaderboard; 