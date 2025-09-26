# Sửa lỗi hiển thị kế hoạch tiết kiệm trong ChatBot

## Vấn đề
- ChatBot chỉ hiển thị tin nhắn "đã cập nhật kế hoạch" mà không show chi tiết kế hoạch mới
- Người dùng phải vào trang Dashboard để xem kế hoạch, gây bất tiện

## Giải pháp đã triển khai

### 1. Cập nhật ChatAPI (`src/utils/chatAPI.ts`)
- ✅ Thêm method `formatPlanDisplay()` để format kế hoạch thành markdown đẹp
- ✅ Thêm logic hiển thị kế hoạch chi tiết khi `planHint = 'proposed'` hoặc `'updated'`
- ✅ Thêm event `planUpdated` để trigger refresh Dashboard
- ✅ Giữ nguyên logic auto-accept plan khi `planHint = 'accepted'`
- ✅ **Sửa thời gian thực**: Gửi `currentDate` và `timezone` lên server
- ✅ **Tự động tính ngày**: Format ngày theo thời gian thực Việt Nam

### 2. Cập nhật PersonalPage (`src/pages/PersonalPage.tsx`)
- ✅ Thêm listener cho event `planUpdated`
- ✅ Auto refresh dashboard khi có plan mới
- ✅ Thêm notification thông báo cập nhật thành công

### 3. Thêm PlanUpdateNotification Component
- ✅ Component thông báo đẹp với animation
- ✅ Auto close sau 3s
- ✅ Styling modern với gradient xanh

## Kết quả
- 🎯 **Giờ khi chatbot cập nhật kế hoạch sẽ hiển thị ngay chi tiết trong tin nhắn**
- 🔄 Dashboard tự động refresh để đồng bộ
- 📱 Notification thông báo thành công
- 🎨 Format kế hoạch đẹp với markdown
- ⏰ **Thời gian hiển thị đúng với thời gian thực** (GMT+7 Việt Nam)

## Files đã thay đổi
1. `src/utils/chatAPI.ts` - Logic chính
2. `src/pages/PersonalPage.tsx` - Event handling
3. `src/components/ui/PlanUpdateNotification.tsx` - Component mới
4. `src/components/ui/PlanUpdateNotification.css` - Styling

## Cách test
1. Đăng nhập vào app
2. Mở chatbot, chọn persona bất kỳ
3. Nói: "Tôi muốn tiết kiệm 1 triệu trong 7 ngày"
4. Khi có kế hoạch, nói: "Hôm nay tôi lỡ tiêu 100k, cập nhật lại kế hoạch"
5. ✅ Sẽ thấy kế hoạch chi tiết hiển thị ngay trong chat
6. ✅ Dashboard sẽ tự động refresh
7. ✅ Có notification thông báo thành công

## Tương thích
- ✅ Không đổi port (giữ nguyên 3000)
- ✅ Không breaking changes
- ✅ Backward compatible với API hiện tại