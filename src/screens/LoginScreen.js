import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Hàm đăng nhập chính thức từ Firebase
import { auth } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  // State lưu trữ dữ liệu người dùng nhập vào
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State quản lý trạng thái chờ khi đang xác thực với server
  const [loading, setLoading] = useState(false);

  // Hàm xử lý logic Đăng nhập
  const handleLogin = async () => {
    // Kiểm tra xem người dùng đã nhập đủ thông tin chưa
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ Email và Mật khẩu");
      return;
    }

    setLoading(true); // Bật vòng quay loading
    try {
      // Gửi yêu cầu đăng nhập lên Firebase Auth
      // email.trim() để xóa các khoảng cách thừa nếu người dùng lỡ tay gõ vào
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Nếu thành công, dùng .replace để chuyển sang màn hình chính
      // (.replace giúp người dùng không thể nhấn nút Back để quay lại trang Login sau khi đã vào App)
      navigation.replace('ProductList'); 
    } catch (error) {
      // Xử lý lỗi nếu sai thông tin tài khoản
      Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
      console.log(error.message);
    } finally {
      setLoading(false); // Tắt vòng quay loading dù thành công hay thất bại
    }
  };

  return (
    <View style={styles.container}>
      {/* PHẦN ĐẦU TRANG (HEADER): Tạo ấn tượng đầu tiên với màu xanh thương hiệu */}
      <View style={styles.header}>
        <Text style={styles.helloText}>Xin chào!</Text>
        <Text style={styles.welcomeText}>Chào mừng bạn đến với Farm2Table</Text>
      </View>

      {/* PHẦN FORM NHẬP LIỆU: Thiết kế bo góc phía trên tạo cảm giác hiện đại */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Đăng nhập</Text>
        
        {/* Ô NHẬP EMAIL */}
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={20} color="#1E824C" style={styles.icon} />
          <TextInput 
            placeholder="Địa chỉ Email" 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" // Không tự động viết hoa chữ cái đầu
            keyboardType="email-address" // Hiện bàn phím chuyên dụng cho email
          />
        </View>

        {/* Ô NHẬP MẬT KHẨU */}
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={20} color="#1E824C" style={styles.icon} />
          <TextInput 
            placeholder="Mật khẩu" 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry // Ẩn mật khẩu bằng dấu chấm tròn
          />
        </View>

        {/* NÚT ĐĂNG NHẬP: Sẽ hiện vòng xoay nếu đang trong trạng thái loading */}
        <TouchableOpacity 
          style={[styles.loginBtn, loading && { opacity: 0.8 }]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E824C' },
  header: { padding: 40, paddingTop: 80, alignItems: 'center' },
  helloText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  welcomeText: { fontSize: 16, color: '#E8F5E9', marginTop: 5, textAlign: 'center' },
  formContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, paddingTop: 40 },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3436', marginBottom: 30 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F9F6', borderRadius: 15, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: '#E8F5E9' },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  loginBtn: { backgroundColor: '#1E824C', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 4 },
  loginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});