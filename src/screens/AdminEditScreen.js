import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // Thư viện chọn ảnh
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import { updateProfile, updatePassword } from 'firebase/auth'; // Các hàm xác thực Firebase
import { uploadImageToCloudinary } from '../services/cloudinaryService'; // Hàm up ảnh đã có của Thuận

export default function AdminEditScreen({ navigation }) {
  const user = auth.currentUser; // Lấy thông tin user hiện tại
  
  // KHỞI TẠO STATE
  const [name, setName] = useState(user?.displayName || '');
  // state lưu URI ảnh đại diện: Ưu tiên ảnh từ Firebase, nếu không có hiện icon mặc định
  const [avatar, setAvatar] = useState(user?.photoURL || null); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // Trạng thái loading khi up ảnh/lưu tên

  // HÀM CHỌN ẢNH ĐẠI DIỆN
  const pickAvatar = async () => {
    // Xin quyền truy cập thư viện
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert("Thông báo", "App cần quyền truy cập thư viện để đổi ảnh đại diện.");
    }

    // Mở thư viện ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // Cho phép cắt ảnh
      aspect: [1, 1], // Tỉ lệ cắt vuông (chuẩn avatar)
      quality: 0.5, // Giảm chất lượng ảnh để load nhanh
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri); // Lưu URI ảnh mới vào state
    }
  };

  // HÀM LƯU THÔNG TIN (Tên và Ảnh đại diện)
  const handleSaveProfile = async () => {
    if (!name) return Alert.alert("Lỗi", "Vui lòng nhập tên hiển thị.");
    setLoading(true); // Bật vòng xoay loading

    try {
      let finalAvatarUrl = avatar;

      // XỬ LÝ ẢNH: Nếu là ảnh mới chọn từ máy (URI nội bộ, không phải HTTP)
      if (avatar && !avatar.startsWith('http')) {
        finalAvatarUrl = await uploadImageToCloudinary(avatar); // Up lên Cloudinary
      }

      // GỌI API CẬP NHẬT CỦA FIREBASE AUTH
      // Dạ thưa thầy, em dùng updateProfile để cập nhật đồng thời tên và link ảnh
      // và Thuộc tính photoURL này có sẵn trong Firebase Auth nên em KHÔNG cần tạo thêm trường ạ.
      await updateProfile(user, { 
        displayName: name,
        photoURL: finalAvatarUrl // Lưu URL ảnh Cloudinary vào Firebase
      });

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công.");
      navigation.replace('Stats'); // Cập nhật xong quay về trang Thống kê

    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật: " + error.message);
    } finally {
      setLoading(false); // Tắt vòng xoay loading
    }
  };

  // HÀM ĐỔI MẬT KHẨU (Giữ nguyên logic cũ của Thuận)
  const handleChangePassword = async () => {
    if (!newPassword) return Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới.");
    if (newPassword !== confirmPassword) return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp.");
    setLoading(true);

    try {
      await updatePassword(user, newPassword);
      Alert.alert("Thành công", "Đổi mật khẩu thành công. Hãy đăng nhập lại.");
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đổi mật khẩu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>QUẢN LÝ HỒ SƠ </Text>
      
      {/* KHU VỰC CẬP NHẬT ẢNH VÀ TÊN */}
      <View style={styles.section}>
        <Text style={styles.label}>Tên hiển thị và Ảnh đại diện</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nhập tên mới" style={styles.input} />
        
        {/* NÚT CHỌN ẢNH ĐẠI DIỆN */}
        <TouchableOpacity style={styles.btnPick} onPress={pickAvatar} disabled={loading}>
          <Ionicons name="camera" size={18} color="#1E824C" />
          <Text style={{marginLeft: 10, color: '#1E824C'}}>ĐỔI ẢNH ĐẠI DIỆN</Text>
        </TouchableOpacity>
        
        {/* HIỂN THỊ ẢNH XEM TRƯỚC */}
        {avatar && <Image source={{ uri: avatar }} style={styles.preview} />}

        <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile} disabled={loading}>
          {loading ? (
              <ActivityIndicator color="#fff" />
          ) : (
              <Text style={styles.saveText}>HOÀN TẤT VÀ LƯU</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* KHU VỰC ĐỔI MẬT KHẨU */}
      <View style={styles.section}>
        <Text style={styles.label}>Đổi mật khẩu </Text>
        <TextInput secureTextEntry={true} value={newPassword} onChangeText={setNewPassword} placeholder="Mật khẩu mới" style={styles.input} />
        <TextInput secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Xác nhận mật khẩu mới" style={styles.input} />
        
        <TouchableOpacity style={styles.btnSave} onPress={handleChangePassword} disabled={loading}>
          {loading ? (
              <ActivityIndicator color="#fff" />
          ) : (
              <Text style={styles.saveText}>HOÀN TẤT VÀ ĐỔI</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#F8F9FA' },
  header: { fontSize: 20, fontWeight: 'bold', color: '#1E824C', textAlign: 'center', marginBottom: 25 },
  section: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20, elevation: 3 },
  label: { fontWeight: 'bold', marginBottom: 12, color: '#333' },
  input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 15, backgroundColor: '#fafafa' },
  btnPick: { backgroundColor: '#F1F8F4', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  preview: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, alignSelf: 'center' },
  btnSave: { backgroundColor: '#1E824C', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});