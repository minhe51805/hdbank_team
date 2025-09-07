document.addEventListener('DOMContentLoaded', function() {
    // Xử lý chuyển đổi giữa cá nhân và doanh nghiệp
    const userButtons = document.querySelectorAll('.user-btn');
    
    userButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa class active từ tất cả các nút
            userButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm class active vào nút được nhấp
            this.classList.add('active');
            
            // Ở đây bạn có thể thêm logic để thay đổi form đăng nhập
            // tùy thuộc vào loại người dùng (cá nhân/doanh nghiệp)
            const userType = this.getAttribute('data-type');
            console.log('Đã chọn: ', userType);
        });
    });
    
    // Xử lý form đăng nhập
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Kiểm tra cơ bản
            if (!username || !password) {
                alert('Vui lòng điền đầy đủ thông tin đăng nhập!');
                return;
            }
            
            // Ở đây bạn có thể thêm logic gửi dữ liệu đến server
            console.log('Thông tin đăng nhập:', { username, password });
            
            // Hiển thị thông báo đăng nhập thành công (tạm thời)
            alert('Đăng nhập thành công! (Đây chỉ là demo)');
        });
    }
    
    // Có thể thêm các chức năng khác ở đây
});