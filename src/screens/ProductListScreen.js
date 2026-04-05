import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, Dimensions, ImageBackground, StatusBar } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore'; // Firebase Firestore
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProductListScreen({ navigation }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [products, setProducts] = useState([]); // Danh sách gốc từ Firebase
  const [loading, setLoading] = useState(true); // Trạng thái chờ tải dữ liệu
  const [searchQuery, setSearchQuery] = useState(''); // Lưu từ khóa tìm kiếm
  const [selectedCategory, setSelectedCategory] = useState('All'); // Lưu danh mục đang chọn
  const [sortType, setSortType] = useState('name'); // Kiểu sắp xếp (tên, giá)
  
  const user = auth.currentUser;

  // --- LOGIC PHÂN QUYỀN (ADMIN vs USER) ---
  // Kiểm tra email người dùng hiện tại, nếu khớp với email quy định thì là Admin
  const isAdmin = user?.email === 'admin@gmail.com'; 

  // Lấy tên hiển thị: Nếu User chưa đặt tên (DisplayName null) thì lấy phần trước dấu @ của Email
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Người dùng';

  // --- EFFECT: LẮNG NGHE DỮ LIỆU REAL-TIME ---
  useEffect(() => {
    // onSnapshot giúp cập nhật giao diện ngay lập tức khi database có thay đổi
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    });
    return () => unsubscribe(); // Hủy lắng nghe khi thoát màn hình để tránh tốn tài nguyên
  }, []);

  // --- HÀM XÓA SẢN PHẨM (CHỈ ADMIN) ---
  const handleDelete = (id) => {
    if (!isAdmin) return; // Bảo mật tầng giao diện
    Alert.alert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa sản phẩm này không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => await deleteDoc(doc(db, "products", id)) }
    ]);
  };

  // --- LOGIC XỬ LÝ DANH SÁCH (FILTER & SORT) ---
  const processedProducts = products
    .filter(item => {
      // 1. Lọc theo từ khóa tìm kiếm (Tên hoặc Mã SP)
      const matchSearch = (item.tensp || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.idsanpham || '').toLowerCase().includes(searchQuery.toLowerCase());
      // 2. Lọc theo danh mục đã chọn
      const matchCategory = selectedCategory === 'All' || (item.loaisp === selectedCategory);
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      // 3. Sắp xếp theo giá hoặc tên
      if (sortType === 'priceUp') return a.gia - b.gia;
      if (sortType === 'priceDown') return b.gia - a.gia;
      return (a.tensp || '').localeCompare(b.tensp || '');
    });

  // --- COMPONENT HEADER (ẢNH NỀN & TÌM KIẾM) ---
  const ListHeader = () => (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80' }} 
      style={styles.headerContainer}
    >
      <View style={styles.overlay} />
      <View style={styles.headerContent}>
        {/* Lời chào cá nhân hóa */}
        <View style={styles.adminRow}>
          <View>
            <Text style={styles.adminHello}>Xin chào,</Text>
            <Text style={styles.adminName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
            <View style={styles.adminAvatarPlaceholder}>
               {user?.photoURL ? <Image source={{uri: user.photoURL}} style={styles.avatarMini} /> : <Ionicons name="person" size={25} color="#1E824C" />}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Nông Sản Sạch</Text>
        <Text style={styles.subtitle}>{isAdmin ? "Chế độ Quản trị viên" : "Thực phẩm tươi ngon mỗi ngày"}</Text>
        
        {/* Thanh tìm kiếm thực thời */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput 
            placeholder="Tìm theo tên hoặc mã SP..." 
            style={styles.searchInput} 
            value={searchQuery}
            onChangeText={setSearchQuery} 
          />
        </View>

        {/* Bộ lọc danh mục nhanh */}
        <View style={styles.categories}>
          {[
            { id: 'All', label: '🧺 Tất cả' },
            { id: 'Veggies', label: '🥦 Rau' },
            { id: 'Fruits', label: '🍎 Trái cây' },
            { id: 'Grains', label: '🌾 Hạt' }
          ].map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              onPress={() => setSelectedCategory(cat.id)}
              style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryActive]}
            >
              <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nút sắp xếp nâng cao */}
        <View style={styles.sortRow}>
           <Text style={styles.sortTitle}>Sắp xếp:</Text>
           <TouchableOpacity onPress={() => setSortType('name')}><Text style={[styles.sortBtn, sortType === 'name' && styles.sortActive]}>Tên A-Z</Text></TouchableOpacity>
           <TouchableOpacity onPress={() => setSortType('priceUp')}><Text style={[styles.sortBtn, sortType === 'priceUp' && styles.sortActive]}>Giá ↑</Text></TouchableOpacity>
           <TouchableOpacity onPress={() => setSortType('priceDown')}><Text style={[styles.sortBtn, sortType === 'priceDown' && styles.sortActive]}>Giá ↓</Text></TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        data={processedProducts} 
        keyExtractor={(item) => item.id}
        numColumns={2} // Hiển thị dạng lưới 2 cột chuyên nghiệp
        ListHeaderComponent={ListHeader}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            // PHÂN QUYỀN: Chỉ Admin mới được điều hướng sang Form để sửa
            onPress={() => isAdmin ? navigation.navigate('ProductForm', { product: item }) : null}
            // PHÂN QUYỀN: Chỉ Admin mới được nhấn giữ để xóa
            onLongPress={() => isAdmin ? handleDelete(item.id) : null}
          >
            <View style={styles.priceTag}><Text style={styles.priceTagText}>{item.gia}đ</Text></View>
            <Image source={{ uri: item.hinhanh || 'https://via.placeholder.com/100' }} style={styles.img} />
            <Text style={styles.nameText} numberOfLines={1}>{item.tensp}</Text>
            <View style={styles.cardInfo}>
                <Text style={styles.catLabel}>{item.loaisp}</Text>
                {/* Chỉ hiện icon bút chì nếu là Admin */}
                {isAdmin && <Ionicons name="pencil" size={12} color="#1E824C" />}
            </View>
          </TouchableOpacity>
        )}
      />
      
      {/* NÚT THÊM (+) CHỈ HIỆN VỚI ADMIN */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ProductForm')}>
          <Ionicons name="add" size={35} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerContainer: { paddingTop: 50, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 130, 76, 0.7)' },
  headerContent: { padding: 20, zIndex: 1 },
  adminRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  adminHello: { color: '#E8F5E9', fontSize: 13 },
  adminName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  adminAvatarPlaceholder: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarMini: { width: 45, height: 45 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#E8F5E9', marginBottom: 15 },
  searchBox: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  searchInput: { marginLeft: 10, flex: 1 },
  categories: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  categoryItem: { backgroundColor: 'rgba(255, 255, 255, 0.25)', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 15 },
  categoryActive: { backgroundColor: '#fff' },
  catText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  catTextActive: { color: '#1E824C' },
  sortRow: { flexDirection: 'row', alignItems: 'center' },
  sortTitle: { color: '#fff', fontSize: 12, marginRight: 10 },
  sortBtn: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginRight: 15 },
  sortActive: { color: '#fff', fontWeight: 'bold', textDecorationLine: 'underline' },
  row: { justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 15 },
  card: { width: width / 2 - 22, backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 5, elevation: 3 },
  priceTag: { position: 'absolute', top: 10, left: 10, backgroundColor: '#1E824C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, zIndex: 1 },
  priceTagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  img: { width: '100%', height: 90, resizeMode: 'contain', marginVertical: 10 },
  nameText: { fontSize: 15, fontWeight: 'bold' },
  cardInfo: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  catLabel: { fontSize: 11, color: '#1E824C', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#1E824C', width: 65, height: 65, borderRadius: 33, justifyContent: 'center', alignItems: 'center', elevation: 8 },
});