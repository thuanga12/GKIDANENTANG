import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { updateProfile, updatePassword } from 'firebase/auth'; // Import các hàm xử lý tài khoản từ Firebase Auth
import { auth } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function AdminEditScreen({ navigation }) {
  // Lấy thông tin người dùng hiện tại đang đăng nhập từ hệ thống Firebase
  const user = auth.currentUser;

  // State lưu trữ Tên hiển thị (Khởi tạo bằng tên cũ hoặc để trống)
  const [name, setName] = useState(user?.displayName || '');
  // State lưu trữ Mật khẩu mới (Luôn để trống khi mới vào trang)
  const [newPassword, setNewPassword] = useState('');
  // State quản lý trạng thái đang xử lý (hiện vòng quay loading)
  const [loading, setLoading] = useState(false);

  // Hàm xử lý khi người dùng nhấn nút CẬP NHẬT
  const handleUpdate = async () => {
    setLoading(true); // Bật trạng thái loading
    try {
      // KIỂM TRA 1: Nếu tên mới nhập khác với tên cũ trong hệ thống thì mới cập nhật
      if (name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }

      // KIỂM TRA 2: Nếu người dùng có nhập mật khẩu mới
      if (newPassword.length > 0) {
        // Quy định của Firebase: Mật khẩu phải từ 6 ký tự trở lên để đảm bảo an toàn
        if (newPassword.length < 6) {
          Alert.alert("Lỗi", "Mật khẩu bảo mật phải từ 6 ký tự trở lên");
          setLoading(false);
          return;
        }
        // Gọi hàm đổi mật khẩu của Firebase Auth
        await updatePassword(user, newPassword);
      }

      Alert.alert("Thành công", "Thông tin tài khoản đã được cập nhật!");
      navigation.goBack(); // Quay lại màn hình trước đó (thường là màn hình Thống kê)
      
    } catch (error) {
      // XỬ LÝ LỖI ĐẶC BIỆT: Firebase yêu cầu đăng nhập lại nếu đổi mật khẩu sau một thời gian dài
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Bảo mật", "Vì lý do an toàn, bạn cần đăng xuất và đăng nhập lại mới có thể đổi mật khẩu.");
      } else {
        Alert.alert("Lỗi hệ thống", error.message);
      }
    } finally {
      setLoading(false); // Tắt trạng thái loading dù thành công hay thất bại
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thiết Lập Tài Khoản</Text>
      
      {/* EMAIL: Khóa lại không cho sửa (editable={false}) vì đây là ID định danh duy nhất */}
      <Text style={styles.label}>Địa chỉ Email (Định danh hệ thống)</Text>
      <TextInput 
        value={user?.email} 
        editable={false} 
        style={[styles.input, { backgroundColor: '#f0f0f0', color: '#888' }]} 
      />

      {/* HỌ TÊN: Cho phép thay đổi để cá nhân hóa lời chào trên App */}
      <Text style={styles.label}>Họ và tên hiển thị</Text>
      <TextInput 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
        placeholder="Nhập tên mới của bạn" 
      />

      {/* MẬT KHẨU: Ẩn ký tự khi nhập bằng secureTextEntry */}
      <Text style={styles.label}>Mật khẩu mới (Để trống nếu không đổi)</Text>
      <TextInput 
        value={newPassword} 
        onChangeText={setNewPassword} 
        style={styles.input} 
        placeholder="Tối thiểu 6 ký tự" 
        secureTextEntry={true} 
      />

      {/* NÚT BẤM: Vô hiệu hóa khi đang xử lý (disabled={loading}) tránh bấm nhiều lần */}
      <TouchableOpacity 
        style={[styles.btnSave, loading && { opacity: 0.7 }]} 
        onPress={handleUpdate} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnSaveText}>XÁC NHẬN THAY ĐỔI</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.footerNote}>* Thông tin này được đồng bộ trực tiếp với Firebase Auth.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E824C', marginBottom: 25, textAlign: 'center' },
  label: { fontSize: 14, color: '#555', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E8F5E9', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 20 },
  btnSave: { backgroundColor: '#1E824C', padding: 18, alignItems: 'center', borderRadius: 15, marginTop: 10, elevation: 3 },
  btnSaveText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  footerNote: { textAlign: 'center', color: '#bbb', fontSize: 11, marginTop: 20 }
});