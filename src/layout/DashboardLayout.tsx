import { useMemo } from "react";
import { Layout, Menu, Breadcrumb } from "@arco-design/web-react";
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { Avatar } from "@arco-design/web-react";
import { IconUser } from "@arco-design/web-react/icon";
import Logo from "../components/Logo";

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(() => {
    if (pathname.startsWith("/products")) return "products";
    if (pathname.startsWith("/orders")) return "orders";
    return "dashboard";
  }, [pathname]);

  const toPath: Record<string, string> = {
    dashboard: "/",
    products: "/products",
    orders: "/orders",
  };

  return (
    <Layout className="h-screen overflow-hidden">
      {/* 顶栏 */}
      <Header className="flex items-center justify-between bg-gray-100 p-4">
        <Logo />
        <Avatar className="bg-blue-600">
          <IconUser />
        </Avatar>
      </Header>

      <Layout className="min-h-0 flex-1 overflow-hidden">
        {/* 侧栏 */}
        <Sider width={220} breakpoint="lg">
          <Menu
            onClickMenuItem={(key) => {
              const p = toPath[key];
              if (p && p !== pathname) navigate(p);
            }}
            selectedKeys={[selectedKey]}
          >
            <Menu.Item key="dashboard">Dashboard</Menu.Item>
            <Menu.Item key="products">Products</Menu.Item>
            <Menu.Item key="orders">Orders</Menu.Item>
          </Menu>
        </Sider>

        {/* 内容区 */}
        <Layout>
          <Breadcrumb className="p-4 pb-0">
            <Breadcrumb.Item key="home">
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item key={selectedKey}>{selectedKey}</Breadcrumb.Item>
          </Breadcrumb>

          <Content className="overflow-hidden p-4">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
