import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Tabs,
  Tag,
  Checkbox,
  Row,
  Col,
  Divider,
  Empty,
  Tooltip,
  Badge,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  HomeOutlined,
  CarOutlined,
  BankOutlined,
  CompassOutlined,
  DollarOutlined,
  BookOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { base_url } from "../../utils/base_url";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const HomePageManagement = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // All available items
  const [allTours, setAllTours] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [allOfferBanners, setAllOfferBanners] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);

  // Selected items for homepage
  const [selectedTours, setSelectedTours] = useState([]);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [selectedTransportation, setSelectedTransportation] = useState([]);
  const [selectedAffordableTours, setSelectedAffordableTours] = useState([]);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [selectedOfferBanners, setSelectedOfferBanners] = useState([]);

  // Fetch current homepage configuration
  const fetchCurrentHomepageConfig = async () => {
    try {
      const response = await axios.get(
        `${base_url}/user/homepage/select_homepage.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success" && response.data?.message) {
        const config = response.data.message;

        // Extract IDs from tours array
        if (config.tours && Array.isArray(config.tours)) {
          setSelectedTours(config.tours.map((tour) => String(tour.id)));
        }

        // Extract IDs from hotels array
        if (config.hotels && Array.isArray(config.hotels)) {
          setSelectedHotels(config.hotels.map((hotel) => String(hotel.id)));
        }

        // Extract IDs from transportation array
        if (config.transportation && Array.isArray(config.transportation)) {
          setSelectedTransportation(
            config.transportation.map((car) => String(car.id))
          );
        }

        // Extract IDs from affordable_tours array
        if (config.affordable_tours && Array.isArray(config.affordable_tours)) {
          setSelectedAffordableTours(
            config.affordable_tours.map((tour) => String(tour.id))
          );
        }

        // Extract IDs from blogs array
        if (config.blogs && Array.isArray(config.blogs)) {
          setSelectedBlogs(config.blogs.map((blog) => String(blog.blog_id)));
        }

        // Parse offer_panners string (format: "10**CAMP**11**CAMP**12")
        if (config.offer_panners && typeof config.offer_panners === "string") {
          const bannerIds = config.offer_panners
            .split("**CAMP**")
            .filter((id) => id.trim() !== "");
          setSelectedOfferBanners(bannerIds);
        }

        // message.success("Current homepage configuration loaded");
      }
    } catch (error) {
      console.error("Error fetching homepage config:", error);
      // Don't show error if it's just empty, continue with empty selections
      if (error.response?.status !== 404) {
        message.warning("No previous configuration found, starting fresh");
      }
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [toursRes, hotelsRes, carsRes, bannersRes, blogsRes] =
        await Promise.all([
          axios.get(`${base_url}/admin/tours/select_tour.php`),
          axios.get(`${base_url}/admin/hotels/select_hotels.php`),
          axios.get(`${base_url}/admin/cars/select_cars.php`),
          axios.get(`${base_url}/admin/offer_panners/select_offer_panners.php`),
          axios.get(`${base_url}/admin/admin_blogs/select_blogs.php`),
        ]);

      if (toursRes.data?.status === "success") {
        setAllTours(toursRes.data.message || []);
      }
      if (hotelsRes.data?.status === "success") {
        setAllHotels(hotelsRes.data.message || []);
      }
      if (carsRes.data?.status === "success") {
        setAllCars(carsRes.data.message || []);
      }
      if (bannersRes.data?.status === "success") {
        setAllOfferBanners(bannersRes.data.message || []);
      }
      if (blogsRes.data?.status === "success") {
        setAllBlogs(blogsRes.data.message || []);
      }

      // Fetch current homepage configuration after loading all items
      await fetchCurrentHomepageConfig();
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSaveHomepage = async () => {
    // Validation
    const totalSelections =
      selectedTours.length +
      selectedHotels.length +
      selectedTransportation.length +
      selectedAffordableTours.length +
      selectedBlogs.length +
      selectedOfferBanners.length;

    if (totalSelections === 0) {
      message.warning("Please select at least one item for the homepage");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tours: selectedTours,
        hotels: selectedHotels,
        transportation: selectedTransportation,
        affordable_tours: selectedAffordableTours,
        blogs: selectedBlogs,
        offer_panners: selectedOfferBanners,
      };

      console.log("Sending payload:", payload);

      const response = await axios.post(
        `${base_url}/admin/homepage/update_homepage.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === "success") {
        message.success("Homepage configuration saved successfully!");
        // Refresh current configuration
        await fetchCurrentHomepageConfig();
      } else {
        throw new Error(response.data?.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving homepage:", error);
      message.error(
        error.response?.data?.message || "Failed to save homepage configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSelection = (id, selectedList, setSelectedList) => {
    const idStr = String(id);
    if (selectedList.includes(idStr)) {
      setSelectedList(selectedList.filter((item) => item !== idStr));
    } else {
      setSelectedList([...selectedList, idStr]);
    }
  };

  const renderItemCard = (item, selectedList, setSelectedList, type) => {
    const itemId = String(
      item.id || item.panner_id || item.blog_id || item.car_id
    );
    const isSelected = selectedList.includes(itemId);
    const isHidden = item.hidden === "1";

    // Get image based on type
    let image = "";
    if (type === "banner") {
      image = item.panner_img;
    } else if (type === "blog") {
      image = item.cover_image;
    } else if (item.image) {
      // Handle image with //CAMP// separator
      const images = item.image.split("//CAMP//");
      image = images[0];
    }

    // Get title based on type
    const title = item.title || item.panner_title || "Untitled";

    // Get description for blogs
    const description = item.description
      ? item.description.substring(0, 100) + "..."
      : "";

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={itemId}>
        <Badge.Ribbon
          text={isSelected ? "Selected" : "Not Selected"}
          color={isSelected ? "green" : "gray"}
        >
          <Card
            hoverable
            className={`transition-all ${
              isSelected ? "ring-2 ring-green-500" : ""
            } ${isHidden ? "opacity-60" : ""}`}
            cover={
              <div className="relative">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {isHidden && (
                    <div className="absolute top-2 left-2">
                      <Tag color="red" icon={<EyeInvisibleOutlined />}>
                        Hidden
                      </Tag>
                    </div>
                  )}
                  {!isHidden && (
                    <div className="absolute top-2 left-2">
                      <Tag color="green" icon={<EyeOutlined />}>
                        Visible
                      </Tag>
                    </div>
                  )}
                </div>
              </div>
            }
            actions={[
              <Checkbox
                key="select"
                checked={isSelected}
                onChange={() =>
                  handleToggleSelection(itemId, selectedList, setSelectedList)
                }
              >
                {isSelected ? "Selected" : "Select"}
              </Checkbox>,
            ]}
          >
            <Card.Meta
              title={
                <Tooltip title={title}>
                  <div className="text-sm font-medium truncate line-clamp-2 h-10">
                    {title}
                  </div>
                </Tooltip>
              }
              description={
                <div className="text-xs">
                  {type === "blog" && description && (
                    <Tooltip title={item.description}>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        className="text-xs text-gray-600 mb-2"
                      >
                        {description}
                      </Paragraph>
                    </Tooltip>
                  )}
                  <div className="flex justify-between items-center">
                    <Text type="secondary">ID: {itemId}</Text>
                    {item.price_current && (
                      <Text strong className="text-green-600">
                        {/* {item.price_currency} */}
                        {item.price_current}
                      </Text>
                    )}
                  </div>
                  {item.duration && (
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        {item.duration}
                      </Text>
                    </div>
                  )}
                  {item.category && (
                    <div className="mt-1">
                      <Tag color="blue" className="text-xs">
                        {item.category}
                      </Tag>
                    </div>
                  )}
                  {item.created_at && type === "blog" && (
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    );
  };

  const renderSection = (
    title,
    icon,
    items,
    selectedList,
    setSelectedList,
    type = "default"
  ) => {
    // Filter out hidden items if needed
    const visibleItems = items.filter((item) => item.hidden !== "1");

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="mb-0 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
            <Badge
              count={selectedList.length}
              showZero
              style={{ backgroundColor: "#52c41a", marginLeft: 12 }}
            />
            <Text type="secondary" className="ml-2 text-sm font-normal">
              ({items.length} total, {visibleItems.length} visible)
            </Text>
          </Title>
          <Space>
            <Button
              size="small"
              onClick={() =>
                setSelectedList(
                  items
                    .filter((item) => item.hidden !== "1")
                    .map((item) =>
                      String(item.id || item.panner_id || item.blog_id)
                    )
                )
              }
            >
              Select All Visible
            </Button>
            <Button
              size="small"
              onClick={() =>
                setSelectedList(
                  items.map((item) =>
                    String(item.id || item.panner_id || item.blog_id)
                  )
                )
              }
            >
              Select All
            </Button>
            <Button size="small" onClick={() => setSelectedList([])}>
              Clear All
            </Button>
          </Space>
        </div>

        {items.length === 0 ? (
          <Empty description={`No ${title.toLowerCase()} available`} />
        ) : (
          <Row gutter={[16, 16]}>
            {items.map((item) =>
              renderItemCard(item, selectedList, setSelectedList, type)
            )}
          </Row>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading homepage data..." />
      </div>
    );
  }

  const getTotalSelections = () => {
    return (
      selectedTours.length +
      selectedHotels.length +
      selectedTransportation.length +
      selectedAffordableTours.length +
      selectedBlogs.length +
      selectedOfferBanners.length
    );
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2}>
            <HomeOutlined className="mr-2" />
            Homepage Management
          </Title>
          <Text type="secondary">
            Configure what appears on your website's homepage
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllData}
            loading={loading}
          >
            Refresh Data
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveHomepage}
            loading={saving}
            disabled={getTotalSelections() === 0}
          >
            Save Configuration
          </Button>
        </Space>
      </div>

      {/* <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between items-center">
            <Text strong className="text-lg">
              📊 Current Selection Summary
            </Text>
            <Tag color="blue" className="text-base px-3 py-1">
              Total: {getTotalSelections()} items
            </Tag>
          </div>
          <Divider className="my-2" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Tours
              </Text>
              <Text strong className="text-2xl text-blue-600">
                {selectedTours.length}
              </Text>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Hotels
              </Text>
              <Text strong className="text-2xl text-green-600">
                {selectedHotels.length}
              </Text>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Transportation
              </Text>
              <Text strong className="text-2xl text-orange-600">
                {selectedTransportation.length}
              </Text>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Affordable Tours
              </Text>
              <Text strong className="text-2xl text-purple-600">
                {selectedAffordableTours.length}
              </Text>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Blogs
              </Text>
              <Text strong className="text-2xl text-pink-600">
                {selectedBlogs.length}
              </Text>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <Text type="secondary" className="block text-xs mb-1">
                Offer Banners
              </Text>
              <Text strong className="text-2xl text-red-600">
                {selectedOfferBanners.length}
              </Text>
            </div>
          </div>
        </Space>
      </Card> */}

      <Tabs defaultActiveKey="1" type="card" size="large">
        <TabPane
          tab={
            <span>
              <CompassOutlined />
              Ultimate Travel Experience
              <Badge
                count={
                  selectedTours.length +
                  selectedHotels.length +
                  selectedTransportation.length
                }
                offset={[10, 0]}
                style={{ backgroundColor: "#52c41a" }}
              />
            </span>
          }
          key="1"
        >
          <Card className="mb-6">
            <Text type="secondary" className="block mb-4">
              Select tours, hotels, and transportation services to display in
              the "Ultimate Travel Experience" section
            </Text>

            {renderSection(
              "Tours",
              <CompassOutlined className="text-blue-500" />,
              allTours,
              selectedTours,
              setSelectedTours
            )}

            <Divider />

            {renderSection(
              "Hotels",
              <BankOutlined className="text-green-500" />,
              allHotels,
              selectedHotels,
              setSelectedHotels
            )}

            <Divider />

            {renderSection(
              "Transportation",
              <CarOutlined className="text-orange-500" />,
              allCars,
              selectedTransportation,
              setSelectedTransportation
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <DollarOutlined />
              Affordable Tours
              <Badge
                count={selectedAffordableTours.length}
                offset={[10, 0]}
                style={{ backgroundColor: "#722ed1" }}
              />
            </span>
          }
          key="2"
        >
          <Card>
            <Text type="secondary" className="block mb-4">
              Select tours to display in the "Affordable Tours" section
            </Text>

            {renderSection(
              "Affordable Tours",
              <DollarOutlined className="text-purple-500" />,
              allTours,
              selectedAffordableTours,
              setSelectedAffordableTours
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <GiftOutlined />
              Offer Banners
              <Badge
                count={selectedOfferBanners.length}
                offset={[10, 0]}
                style={{ backgroundColor: "#f5222d" }}
              />
            </span>
          }
          key="3"
        >
          <Card>
            <Text type="secondary" className="block mb-4">
              Select offer banners to display on the homepage
            </Text>

            {renderSection(
              "Offer Banners",
              <GiftOutlined className="text-red-500" />,
              allOfferBanners,
              selectedOfferBanners,
              setSelectedOfferBanners,
              "banner"
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BookOutlined />
              Blogs
              <Badge
                count={selectedBlogs.length}
                offset={[10, 0]}
                style={{ backgroundColor: "#eb2f96" }}
              />
            </span>
          }
          key="4"
        >
          <Card>
            <Text type="secondary" className="block mb-4">
              Select blog posts to feature on the homepage
            </Text>

            {renderSection(
              "Featured Blogs",
              <BookOutlined className="text-pink-500" />,
              allBlogs,
              selectedBlogs,
              setSelectedBlogs,
              "blog"
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSaveHomepage}
          loading={saving}
          disabled={getTotalSelections() === 0}
          className="shadow-2xl h-14 px-6 text-base"
          style={{ borderRadius: "8px" }}
        >
          Save Homepage ({getTotalSelections()} items selected)
        </Button>
      </div>
    </div>
  );
};

export default HomePageManagement;
