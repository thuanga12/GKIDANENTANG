import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../services/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore'; // Firebase Firestore (Database)
import { signOut } from 'firebase/auth'; // Firebase Auth (Xác thực)

export default function StatsScreen({ navigation }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [totalProducts, setTotalProducts] = useState(0); // Lưu tổng số lượng SP
  const user = auth.currentUser; // Lấy thông tin user hiện tại từ Firebase Auth

  // --- LOGIC PHÂN QUYỀN (ADMIN vs USER) ---
  // Dùng email để định danh quyền hạn ngay trên giao diện
  const isAdmin = user?.email === 'admin@gmail.com'; 

  // --- EFFECT: ĐẾM SỐ LƯỢNG SẢN PHẨM ---
  useEffect(() => {
    // Sử dụng onSnapshot để số lượng tự động cập nhật khi có SP mới được thêm vào
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      // snapshot.size trả về tổng số lượng tài liệu (documents) trong collection 'products'
      setTotalProducts(snapshot.size);
    });
    return () => unsubscribe(); // Hủy lắng nghe để tránh rò rỉ bộ nhớ
  }, []);

  // --- HÀM XỬ LÝ ĐĂNG XUẤT ---
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn muốn thoát khỏi hệ thống?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive", onPress: async () => {
          try {
            await signOut(auth); // Gọi lệnh đăng xuất của Firebase
            navigation.replace('Login'); // Đưa người dùng về màn hình Đăng nhập
          } catch (error) {
            Alert.alert("Lỗi", "Không thể đăng xuất: " + error.message);
          }
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER: HIỂN THỊ THÔNG TIN ĐỊNH DANH */}
      <View style={styles.header}>
        {/* Ảnh đại diện: Ưu tiên ảnh từ Firebase, nếu không có hiện icon mặc định */}
        <View style={styles.avatarCircle}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={50} color="#1E824C" />
          )}
        </View>
        
        {/* Tên và Email lấy trực tiếp từ đối tượng 'user' của Firebase Auth */}
        <Text style={styles.name}>{user?.displayName || (isAdmin ? 'Admin' : 'Khách hàng')}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {/* NHÃN PHÂN QUYỀN (BADGE): Màu Cam cho Admin, Màu Xanh cho User */}
        <View style={[styles.badge, { backgroundColor: isAdmin ? '#F39C12' : '#3498DB' }]}>
          <Text style={styles.badgeText}>{isAdmin ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Thống kê kho</Text>
        {/* THẺ THỐNG KÊ: Hiển thị tổng số sản phẩm trong kho */}
        <View style={styles.statCard}>
          <Ionicons name="leaf" size={40} color="#1E824C" />
          <View style={{ marginLeft: 20 }}>
            <Text style={styles.statNum}>{totalProducts}</Text>
            <Text style={styles.statLabel}>Sản phẩm đang bán</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tài khoản</Text>
        {/* MENU: Điều hướng sang trang chỉnh sửa hồ sơ (AdminEdit) */}
        <TouchableOpacity style={styles.menu} onPress={() => navigation.navigate('AdminEdit')}>
          <Ionicons name="create-outline" size={22} color="#555" />
          <Text style={styles.menuText}>Sửa thông tin hồ sơ</Text>
        </TouchableOpacity>
        
        {/* MENU ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.menu} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
          <Text style={[styles.menuText, { color: '#e74c3c' }]}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#1E824C', padding: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  avatarCircle: { width: 100, height: 100, backgroundColor: '#fff', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15, overflow: 'hidden' },
  avatarImg: { width: 100, height: 100 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  email: { color: '#E8F5E9', fontSize: 14, marginTop: 5 },
  badge: { marginTop: 10, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  content: { padding: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  statCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3 },
  statNum: { fontSize: 32, fontWeight: 'bold', color: '#1E824C' },
  statLabel: { color: '#777' },
  menu: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 12 },
  menuText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '500' },
});