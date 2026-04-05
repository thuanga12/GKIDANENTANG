import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Image, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Thư viện chọn ảnh từ thiết bị
import { db } from '../services/firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'; // Các hàm CRUD của Firestore
import { uploadImageToCloudinary } from '../services/cloudinaryService'; // Hàm upload ảnh do mình viết
import { Ionicons } from '@expo/vector-icons';

export default function ProductFormScreen({ route, navigation }) {
  // Lấy dữ liệu sản phẩm nếu là chế độ "Chỉnh sửa"
  const product = route.params?.product;

  // CHỨC NĂNG NÂNG CAO: Tự động tạo mã sản phẩm không trùng lặp
  const generateID = () => `NÔNG-SẢN-${Math.floor(1000 + Math.random() * 9000)}`;

  // KHỞI TẠO STATE: Nếu có product (sửa) thì lấy data cũ, không thì lấy giá trị mặc định (thêm mới)
  const [idsanpham, setIdsanpham] = useState(product?.idsanpham || generateID());
  const [tensp, setTensp] = useState(product?.tensp || '');
  const [loaisp, setLoaisp] = useState(product?.loaisp || 'Veggies'); 
  const [gia, setGia] = useState(product?.gia?.toString() || '');
  const [image, setImage] = useState(product?.hinhanh || null);
  const [uploading, setUploading] = useState(false); // Quản lý trạng thái chờ khi đang up ảnh/lưu data

  // Danh sách phân loại cố định để đảm bảo dữ liệu đồng bộ với bộ lọc trang chủ
  const categories = [
    { id: 'Veggies', label: 'Rau củ' },
    { id: 'Fruits', label: 'Trái cây' },
    { id: 'Grains', label: 'Hạt/Ngũ cốc' }
  ];

  // HÀM CHỌN ẢNH: Sử dụng thư viện ImagePicker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Cho phép người dùng cắt ảnh theo tỉ lệ 1:1
      aspect: [1, 1],
      quality: 1,
    });
    // Nếu người dùng không hủy bỏ thì lưu URI ảnh vào state
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  // HÀM LƯU DỮ LIỆU (Cả Thêm và Sửa)
  const handleSave = async () => {
    if (!tensp || !gia) return Alert.alert("Thông báo", "Vui lòng nhập Tên và Giá sản phẩm");
    
    setUploading(true);
    let finalImageUrl = image;

    // XỬ LÝ ẢNH: Nếu là ảnh mới chọn từ máy (có link 'file://' hoặc 'content://')
    // thì mới gọi hàm upload lên Cloudinary để lấy link URL web
    if (image && !image.startsWith('http')) {
      finalImageUrl = await uploadImageToCloudinary(image);
    }

    try {
      // Ép kiểu dữ liệu cho 'gia' thành Number trước khi lưu để hỗ trợ sắp xếp (Sort)
      const data = { idsanpham, tensp, loaisp, gia: Number(gia), hinhanh: finalImageUrl || '' };

      if (product) {
        // CHẾ ĐỘ SỬA: Cập nhật tài liệu đã tồn tại theo ID
        await updateDoc(doc(db, "products", product.id), data);
      } else {
        // CHẾ ĐỘ THÊM: Tạo mới một tài liệu trong Collection 'products'
        await addDoc(collection(db, "products"), data);
      }
      navigation.navigate('ProductList'); // Lưu xong quay về trang danh sách
    } catch (e) { 
      Alert.alert("Lỗi", "Không thể lưu dữ liệu: " + e.message); 
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* TIÊU ĐỀ: Tự động đổi theo chế độ Thêm/Sửa */}
      <Text style={styles.header}>{product ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM MỚI SẢN PHẨM'}</Text>
      
      {/* MÃ SP: editable={false} để Admin không sửa được mã tự động của hệ thống */}
      <Text style={styles.label}>Mã sản phẩm (Hệ thống tự tạo)</Text>
      <TextInput value={idsanpham} editable={false} style={styles.idInput} />

      <Text style={styles.label}>Tên sản phẩm</Text>
      <TextInput placeholder="VD: Sầu riêng Ri6" value={tensp} onChangeText={setTensp} style={styles.input} />

      {/* CHỌN LOẠI: Hiển thị dạng các nút bấm (Radio button style) */}
      <Text style={styles.label}>Phân loại</Text>
      <View style={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity 
            key={cat.id} 
            onPress={() => setLoaisp(cat.id)} 
            style={[styles.catBtn, loaisp === cat.id && styles.catActive]}
          >
            <Text style={[styles.catText, loaisp === cat.id && styles.catTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Giá niêm yết (VNĐ)</Text>
      <TextInput 
        placeholder="VD: 150000" 
        value={gia} 
        onChangeText={setGia} 
        keyboardType="numeric" // Hiện bàn phím số
        style={styles.input} 
      />

      {/* CHỌN HÌNH ẢNH */}
      <TouchableOpacity style={styles.btnImg} onPress={pickImage}>
        <Ionicons name="camera" size={24} color="#1E824C" />
        <Text style={{marginLeft: 10, color: '#1E824C', fontWeight: 'bold'}}>CHỌN HÌNH ẢNH</Text>
      </TouchableOpacity>
      
      {/* HIỂN THỊ ẢNH XEM TRƯỚC (Nếu có) */}
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {/* NÚT LƯU: Vô hiệu hóa khi đang upload để tránh lỗi trùng lặp dữ liệu */}
      <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={uploading}>
        {uploading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.saveText}>HOÀN TẤT VÀ LƯU</Text>
        )}
      </TouchableOpacity>
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#1E824C', textAlign: 'center', marginBottom: 25 },
  label: { fontWeight: 'bold', marginBottom: 8, color: '#444' },
  idInput: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 10, marginBottom: 20, color: '#888', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 20, backgroundColor: '#fafafa' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  catBtn: { padding: 10, borderWidth: 1, borderColor: '#1E824C', borderRadius: 10, width: '31%', alignItems: 'center' },
  catActive: { backgroundColor: '#1E824C' },
  catText: { fontSize: 12, color: '#1E824C' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  btnImg: { padding: 15, backgroundColor: '#F1F8F4', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', marginBottom: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#1E824C' },
  preview: { width: '100%', height: 220, borderRadius: 15, marginBottom: 20 },
  btnSave: { backgroundColor: '#1E824C', padding: 18, borderRadius: 15, alignItems: 'center', elevation: 3 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});