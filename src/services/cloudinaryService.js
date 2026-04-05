/**
 * HÀM TẢI ẢNH LÊN CLOUD (Cloudinary)
 * Giải thích cho thầy: Firestore chỉ lưu được chữ, không lưu được file ảnh. 
 * Nên em dùng Cloudinary làm "kho chứa ảnh" trung gian.
 */
export const uploadImageToCloudinary = async (imageUri) => {
  // FormData là đối tượng dùng để đóng gói dữ liệu file gửi lên Server
  const data = new FormData();
  
  // 1. XỬ LÝ ĐƯỜNG DẪN ẢNH (Dành riêng cho React Native)
  // Lấy tên file từ đường dẫn (VD: image_01.jpg)
  let filename = imageUri.split('/').pop();
  // Dùng Regex để tách phần mở rộng (jpg, png) để định dạng kiểu dữ liệu (MIME type)
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;

  // Đóng gói file ảnh vào đối tượng data
  data.append('file', {
    uri: imageUri,
    name: filename,
    type: type,
  });
  
  // 2. CẤU HÌNH CLOUD CỦA THUẬN
  // Upload Preset: Cấu hình cho phép upload không cần khóa bí mật (Unsigned)
  data.append('upload_preset', 'sanpham_preset'); 
  // Cloud Name: Định danh tài khoản của Thuận trên Cloudinary
  data.append('cloud_name', 'dupecsa75'); 

  try {
    // 3. GỬI YÊU CẦU (POST REQUEST)
    // Gọi API của Cloudinary kèm theo Cloud Name của Thuận
    const res = await fetch(`https://api.cloudinary.com/v1_1/dupecsa75/image/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data', // Định dạng gửi dữ liệu đa phương tiện
      }
    });
    
    // Đọc phản hồi trả về từ Server dưới dạng JSON
    const result = await res.json();
    
    // KIỂM TRA LỖI: Nếu Server trả về lỗi thì log ra để debug
    if(result.error) {
      console.error("Lỗi từ Cloudinary: ", result.error.message);
      return null;
    }
    
    // THÀNH CÔNG: Trả về link URL bảo mật (https) của tấm ảnh
    // Link này sau đó sẽ được lưu vào trường 'hinhanh' trong Firestore
    return result.secure_url; 

  } catch (error) {
    console.error("Lỗi code tải ảnh:", error);
    return null;
  }
};