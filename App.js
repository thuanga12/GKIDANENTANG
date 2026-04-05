import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Thư viện bao bọc toàn bộ điều hướng
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Thư viện tạo ngăn xếp màn hình (Stack)

// Import tất cả các màn hình (Screens) đã xây dựng
import LoginScreen from './src/screens/LoginScreen';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductFormScreen from './src/screens/ProductFormScreen';
import StatsScreen from './src/screens/StatsScreen'; 
import AdminEditScreen from './src/screens/AdminEditScreen'; 

// Khởi tạo đối tượng Stack để quản lý các màn hình chồng lên nhau
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NavigationContainer: Thành phần bắt buộc để quản lý trạng thái điều hướng của App
    <NavigationContainer>
      {/* Navigator: Thiết lập màn hình đầu tiên khi mở app là 'Login' */}
      <Stack.Navigator initialRouteName="Login">
        
        {/* 1. Màn hình Đăng nhập (Login) */}
        {/* headerShown: false -> Ẩn thanh tiêu đề mặc định để dùng giao diện thiết kế riêng */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* 2. Màn hình Danh sách Sản phẩm (ProductList) */}
        {/* headerShown: false -> Để ảnh nền (ImageBackground) có thể tràn lên sát mép trên màn hình */}
        <Stack.Screen 
          name="ProductList" 
          component={ProductListScreen} 
          options={{ headerShown: false }} 
        />
        
        {/* 3. Màn hình Form Sản phẩm (ProductForm) */}
        {/* Hiện Header mặc định để người dùng có nút 'Quay lại' tự động ở góc trái */}
        <Stack.Screen 
          name="ProductForm" 
          component={ProductFormScreen} 
          options={{ title: 'Thông tin sản phẩm', headerTintColor: '#1E824C' }} 
        />

        {/* 4. Màn hình Thống kê (Stats) */}
        <Stack.Screen 
          name="Stats" 
          component={StatsScreen} 
          options={{ title: 'Thống kê', headerTintColor: '#1E824C' }} 
        />

        {/* 5. Màn hình Chỉnh sửa hồ sơ (AdminEdit) */}
        <Stack.Screen 
          name="AdminEdit" 
          component={AdminEditScreen} 
          options={{ title: 'Chỉnh sửa hồ sơ', headerTintColor: '#1E824C' }} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}