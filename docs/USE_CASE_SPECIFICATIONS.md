Bảng 2.1 Đặc tả Use Case Đăng ký
Tên Use Case	Đăng ký
Tác nhân	Người dùng vãng lai
Mục đích	Cho phép người dùng vãng lai đăng ký tạo tài khoản để đăng nhập vào hệ thống
Điều kiện kích hoạt	Người dùng vãng lai chọn chức năng “Đăng ký” trên hệ thống
Điều kiện tiên quyết	Người dùng vãng lai chưa có tài khoản trên hệ thống
Luồng sự kiện chính	
1. Người dùng vãng lai vào trang đăng ký 
2. Hệ thống hiển thị form đăng ký yêu cầu nhập thông tin: Họ và tên (bắt buộc, tối thiểu 2 ký tự), Email (bắt buộc, đúng định dạng chuẩn của email), Mật khẩu (bắt buộc, tối thiểu 6 ký tự và có ít nhất 1 ký tự in hoa, 1 thường, 1 chữ số và 1 ký tự đặc biệt)
3. Người dùng vãng lai nhập đầy đủ các thông tin
4. Người dùng vãng lai nhấn “Đăng ký”
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu
6. Hệ thống kiểm tra email không tồn tại trên hệ thống 
7. Hệ thống thông báo đã gửi email xác thực và yêu cầu người dùng xác thực để đăng nhập
8. Người dùng vãng lai xác thực email
9. Hệ thống lưu thông tin vào cơ sở dữ liệu
10. Hệ thống thông báo đăng ký thành công và yêu cầu người dùng vãng lai xác thực email để đăng nhập
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 5, nếu người dùng vãng lai nhập thiếu thông tin
6.1. Hệ thống hiển thị thông báo lỗi “Vui lòng điền đầy đủ thông tin”
Luồng thay thế 2: Tại bước 5, nếu người dùng vãng lai nhập không đúng theo yêu cầu của hệ thống
6.1. Hệ thống hiển thị thông báo lỗi yêu cầu nhập lại họ và tên/email/mật khẩu cho đúng định dạng và yêu cầu
Luồng thay thế 3: Tại bước 6, nếu email đã tồn tại trên hệ thống
7.1. Hệ thống thông báo email đã tồn tại
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 7, nếu hệ thống không gửi được email xác thực
8.1. Hệ thống thông báo không thể gửi email xác thực và yêu cầu người dùng thử lại sau
8.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 9, nếu hệ lưu được dữ liệu của người dùng mới vào cơ sở dữ liệu
10.1 Hệ thống thông báo lỗi và yêu cầu thử lại sau
10.2 Use case kết thúc thất bại
Bảng 2.2 Đặc tả Use Case Đăng nhập
Tên Use Case	Đăng nhập
Tác nhân	Người dùng
Mục đích	Người dùng đăng nhập để sử dụng hệ thống
Điều kiện kích hoạt	Người dùng chọn chức năng “Đăng nhập” trên hệ thống
Điều kiện tiên quyết	Người dùng đã có tài khoàn trên hệ thống
Luồng sự kiện chính	1. Người dùng vào trang đăng nhập
2.	Hệ thống hiển thị form đăng nhập yêu cầu nhập thông tin: Email (bắt buộc, đúng định dạng chuẩn của email), Mật khẩu (bắt buộc, tối thiểu 6 ký tự và có ít nhất 1 ký tự in hoa, 1 thường, 1 chữ số và 1 ký tự đặc biệt)
3.	Người dùng nhập đầy đủ các trường thông tin
4.	Người dùng nhấn “Đăng nhập”
5. Hệ thống kiểm tra tính hợp lệ của dữ liệu
6.	Hệ thống kiểm tra email có tồn tại và mật khẩu khớp không
7. Hệ thống kiểm tra tài khoản đã được xác thực email chưa và đang hoạt động không
8. Hệ thống lưu dữ liệu vào cơ sở dữ liệu
9. Hệ thống hiển thị giao diện tương ứng với quyền của người dùng 
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 5, nếu thông tin đăng nhập còn thiếu
6.1. Hệ thống hiển thị thông báo lỗi “Vui lòng điền đầy đủ thông tin”
Luồng thay thế 2: Tại bước 5, nếu email/mật khẩu không chính xác
6.1. Hệ thống hiển thị thông báo lỗi: “Email hoặc mật khẩu chưa chính xác”
Luồng thay thế 3: Tại bước 7, nếu email chưa được xác thực bởi người dùng
8.1. Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng phải xác thực tài khoản
Luồng thay thế 4: Tại bước 7, hệ thống kiểm tra trạng thái của tài khoản là không còn hoạt động (đã bị khóa)
8.2. Hệ thống hiển thị thông báo lỗi không thể đăng nhập vì tài khoản đang bị khóa
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 5, nếu xảy ra lỗi hệ thống trong quá trình xác thực đăng nhập
5.1. Hệ thống hiển thị thông báo “Không thể thực hiện đăng nhập, vui lòng thử lại sau”
5.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 8, nếu hệ lưu được dữ liệu vào cơ sở dữ liệu
9.1 Hệ thống thông báo lỗi và yêu cầu thử lại sau
9.2 Use case kết thúc thất bại
Bảng 2.3 Đặc tả Use Case Quên mật khẩu
Tên Use Case	Quên mật khẩu
Tác nhân	Người dùng
Mục đích	Cho phép Người dùng lấy lại mật khẩu khi không nhớ
Điều kiện kích hoạt	Người dùng chọn chức năng “Đăng nhập” trên hệ thống
Điều kiện tiên quyết	Người dùng đã có tài khoản trên hệ thống
Luồng sự kiện chính	1. Người dùng truy cập trang đăng nhập và nhấn “Quên mật khẩu”
2.	Hệ thống hiển thị form quên mật khẩu chứa trường Email (bắt buộc, đúng định dạng chuẩn của email)
3.	Người dùng nhập email đã đăng ký
4.	Người dùng nhấn “Gửi mã OTP”
5.	Hệ thống kiểm tra email có hợp lệ và có tồn tại trên hệ thống không 
6. Hệ thống gửi email và thông báo đã gửi email để khôi phục mật khẩu
7. Người dùng nhập mã OTP được gửi qua email
8. Hệ thống kiểm tra tính hợp lệ của mã OTP
9. Hệ thống hiển thị form đổi mật khẩu gồm các trường thông tin: Mật khẩu mới (bắt buộc, không được trùng với mật khẩu cũ), Xác nhận mật khẩu mới (bắt buộc, phải trùng khớp với mật khẩu mới)
10. Người dùng nhập mật khẩu mới và xác nhận mật khẩu mới
11. Người dùng nhấn “Đổi mật khẩu”
12. Hệ thống kiểm tra tính hợp lệ của các trường thông tin
13. Hệ thống cập nhật mật khẩu mới vào cơ sở dữ liệu
14. Hệ thống thông báo đổi mật khẩu thành công và hiển thị giao diện tương ứng với quyền của người dùng
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 5, nếu email không hợp lệ
6.1. Hệ thống hiển thị thông báo lỗi “Email không hợp lệ” và yêu cầu nhập lại email
Luồng thay thế 2: Tại bước 5, nếu email không tồn tại trên hệ thống
6.2. Hệ thống hiển thị thông báo “Email không tồn tại” và yêu cầu người dùng nhập lại
Luồng thay thế 3: Tại bước 8, nếu OTP bị nhập sai
9.1. Hệ thống hiển thị thông báo lỗi “Mã OTP không chính xác” và yêu cầu người dùng nhập lại
Luồng thay thế 4: Tại bước 8, nếu OTP hết hạn (quá 5 phút)
9.2. Hệ thống hiển thị thông báo lỗi “Mã OTP đã hết hạn, vui lòng nhấn Gửi lại”
Luồng thay thế 5: Tại bước 12, nếu mật khẩu mới trùng với mật khẩu cũ
13.1. Hệ thống hiển thị thông báo “Mật khẩu mới không được trùng với mật khẩu cũ”
Luồng thay thế 6: Tại bước 12, nếu mật khẩu mới không đúng theo yêu cầu định dạng của hệ thống
13.2. Hệ thống hiển thị thông báo lỗi và yêu cầu nhập lại
Luồng thay thế 7: Tại bước 12, nếu xác nhận mật khẩu mới không trùng khớp với trường mật khẩu mới 
13.3. Hệ thống hiển thị thông báo lỗi “Xác nhận mật khẩu không trùng khớp”
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 5, nếu xảy ra lỗi hệ thống trong quá trình kiểm tra email
6.1. Hệ thống hiển thị thông báo lỗi “Hệ thống đang gặp sự cố, vui lòng thử lại sau”
6.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 6, nếu hệ thống không gửi được email để khôi phục mật khẩu
7.1. Hệ thống thông báo không thể gửi email để khôi phục mật khẩu và yêu cầu người dùng thử lại sau
7.2 Use case kết thúc thất bại
Luồng ngoại lệ 3: Tại bước 8, nếu xảy ra lỗi hệ thống trong quá trình xác thực mã OTP
9.1. Hệ thống hiển thị thông báo lỗi “Không thể xác thực mã OTP, vui lòng thử lại sau”
9.2 Use case kết thúc thất bại
Luồng ngoại lệ 4: Tại bước 13, nếu xảy ra lỗi hệ thống trong quá trình cập nhật mật khẩu mới
14.1. Hệ thống hiển thị thông báo lỗi “Không thể đổi mật khẩu, vui lòng thử lại sau”
14.2 Use case kết thúc thất bại
Bảng 2.4 Đặc tả Use Case Quản lý sản phẩm
Tên Use Case	Quản lý sản phẩm
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên sử dụng các chức năng của quản lý sản phẩm như Thêm/sửa/xóa sản phẩm
Điều kiện kích hoạt	Quản trị viên vào mục Quản lý sản phẩm trong trang Quản trị
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên
Luồng sự kiện chính	1. Quản trị viên truy cập chức năng Quản lý sản phẩm
2. Hệ thống hiển thị danh sách sản phẩm hiện có
3. Quản trị viên lựa chọn thao tác quản lý sản phẩm
4. Hệ thống thực hiện chức năng tương ứng
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 3, nếu quản trị viên chọn “Thêm sản phẩm”
4.1. Thực hiện Use Case “Thêm sản phẩm”
Luồng thay thế 2: Tại bước 3, nếu quản trị viên chọn biểu tượng “Sửa”
4.2. Thực hiện Use Case “Sửa thông tin sản phẩm”
Luồng thay thế 3: Tại bước 3, nếu quản trị viên chọn biểu tượng “Xóa”
4.3. Thực hiện Use Case “Xóa sản phẩm”
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 2, nếu hệ thống không tải được danh sách sản phẩm
3.1. Hệ thống hiển thị thông báo “Không thể tải danh sách sản phẩm”
3.2 Use case kết thúc thất bại
Bảng 2.5 Đặc tả Use Case Thêm sản phẩm 
Tên Use Case	Thêm sản phẩm 
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên thực hiện việc thêm sản phẩm mới vào hệ thống
Điều kiện kích hoạt	Quản trị viên nhấn “Thêm sản phẩm”
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên
Luồng sự kiện chính	1. Hệ thống hiển thị hộp thoại form Thêm sản phẩm với các trường thông tin: Tên sản phẩm (bắt buộc), Danh mục, Giá (bắt buộc, tối thiểu 1.000 VNĐ), Đơn vị (bắt buộc), Mô tả sản phẩm, Thông tin dinh dưỡng, Hình ảnh sản phẩm (bắt buộc, định dạng .jpg, .png, .avif, .webp, .jpeg, dung lượng tối đa 5MB)
2. Quản trị viên nhập đầy đủ các trường thông tin
3. Quản trị viên nhấn “Xác nhận”
4. Hệ thống kiểm tra tính hợp lệ của các trường thông tin
5. Hệ thống lưu thông tin sản phẩm vào cơ sở dữ liệu. 
6. Hệ thống hiển thị thông báo “Thêm sản phẩm thành công” và hiển thị sản phẩm mới trong danh sách sản phẩm.
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 4, nếu trường thông tin bị bỏ trống 
5.1 Hệ thống sẽ thông báo lỗi và yêu cầu đầy đủ thông tin
Luồng thay thế 2: Tại bước 4, nếu trường thông tin nhập sai yêu cầu của hệ thống
5.2 Hệ thống sẽ thông báo lỗi và yêu cầu nhập lại theo đúng yêu cầu của hệ thống
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 4, nếu không thể tải ảnh lên hệ thống
4.1. Hệ thống thông báo lỗi tải ảnh và yêu cầu người dùng thử lại sau
4.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 5, nếu không lưu được thông tin
6.1. Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
6.2 Use case kết thúc thất bại
Bảng 2.6 Đặc tả Use Case Sửa thông tin sản phẩm
Tên Use Case	Sửa thông tin sản phẩm
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên thực hiện việc sửa thông tin sản phẩm đang có trên hệ thống
Điều kiện kích hoạt	Quản trị viên nhấn biểu tượng “Sửa” hoặc tùy chọn trạng thái tại sản phẩm muốn cập nhật thông tin
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên
Luồng sự kiện chính	1. Hệ thống hiển thị hộp thoại form Sửa thông tin sản phẩm cùng với các thông tin hiện tại của sản phẩm
2. Quản trị viên cập nhật thông tin sản phẩm
3. Quản trị viên nhấn “Xác nhận”
4. Hệ thống kiểm tra tính hợp lệ của các trường thông tin
5. Hệ thống cập nhật thông tin mới của sản phẩm 
6. Hệ thống hiển thị thông báo “Cập nhật sản phẩm thành công”
Luồng sự kiện thay thế	Luồng thay thế 1: Quản trị viên lựa chọn thay đổi trạng thái trực tiếp tại sản phẩm tùy chọn
2.1 Hệ thống cập nhật trạng thái trên cơ sở dữ liệu
2.2 Hệ thống hiển thị thông báo cập nhật trạng thái thành công
Luồng thay thế 2: Tại bước 4, nếu trường thông tin bị bỏ trống 
4.1. Hệ thống sẽ thông báo lỗi và yêu cầu đầy đủ thông tin
Luồng thay thế 3: Tại bước 4, nếu trường thông tin nhập sai yêu cầu của hệ thống
4.2. Hệ thống sẽ thông báo lỗi và yêu cầu nhập lại theo đúng yêu cầu của hệ thống
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 4, nếu không thể tải ảnh lên hệ thống
4.1. Hệ thống thông báo lỗi tải ảnh và yêu cầu người dùng thử lại sau
4.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 5, nếu không cập nhật được thông tin mới
6.1. Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
6.2 Use case kết thúc thất bại
Bảng 2.7 Đặc tả Use Case Xóa mềm sản phẩm
Tên Use Case	Xóa mềm sản phẩm
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên thực hiện việc xóa sản phẩm khỏi hệ thống
Điều kiện kích hoạt	Quản trị viên nhấn biểu tượng “Xóa” tại sản phẩm muốn gỡ bỏ
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên
Luồng sự kiện chính	1. Hệ thống hiển thị hộp thoại Xác nhận xóa
2. Quản trị viên nhấn “Xác nhận”
3. Hệ thống cập nhật trạng thái xóa và ẩn sản phẩm khỏi danh sách sản phẩm 
4. Hệ thống hiển thị thông báo “Gỡ bỏ sản phẩm thành công”
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 2, nếu quản trị viên nhấn “Hủy”
3.1 Hệ thống đóng hộp thoại và giữ nguyên trạng thái sản phẩm
3.2 Hệ thống quay lại trang quản lý sản phẩm
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 3, nếu hệ thống không xóa được sản phẩm do lỗi hệ thống
4.1. Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
4.2 Use case kết thúc thất bại
Bảng 2.8 Đặc tả Use Case Quản lý thông tin cá nhân
Tên Use Case	Quản lý thông tin cá nhân
Tác nhân	Người dùng
Mục đích	Cho phép người dùng cập nhật thông tin cá nhân
Điều kiện kích hoạt	Người dùng truy cập chức năng “Hồ sơ cá nhân” trên hệ thống
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống
Luồng sự kiện chính	1. Hệ thống hiển thị giao diện trang Thông tin cá nhân
2. Người dùng chọn trường thông tin muốn cập nhật (Họ và tên, email, số điện thoại, ảnh đại diện)
3. Hệ thống hiển thị thông tin ban đầu của trường thông tin
4. Người dùng nhập thông tin mới
5. Người dùng nhấn “Xác nhận”
6. Hệ thống kiểm tra tính hợp lệ của thông tin
7. Hệ thống cập nhật thông tin mới lên cơ sở dữ liệu
8. Hệ thống thông báo thành công và hiển thị dữ liệu mới
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 6, nếu trường thông tin bị bỏ trống
7.1 Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin
Luồng thay thế 2: Tại bước 6, nếu trường thông tin nhập không đúng yêu cầu hệ thống
7.2 Hệ thống thông báo lỗi và yêu cầu nhập lại 
Luồng thay thế 3: Tại bước 6, với trường cập nhật là email
7.2 Hệ thống gọi đến use case Thay đổi email (ở bảng 2.10)
Luồng thay thế 4: Tại bước 5, người dùng nhấn “Hủy” hoặc đóng hộp thoại
6.1 Hệ thống đóng hộp thoại và không thay đổi dữ liệu
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 7, nếu không lưu được dữ liệu do lỗi hệ thống
8.1. Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
8.2 Use case kết thúc thất bại
Bảng 2.9 Đặc tả Use Case Thay đổi email
Tên Use Case	Thay đổi email
Tác nhân	Người dùng
Mục đích	Cho phép người dùng thay đổi địa chỉ email liên kết thông qua xác thực
Điều kiện kích hoạt	Người dùng chọn trường thông tin Email trong trang Hồ sơ cá nhân
Điều kiện tiên quyết	Người dùng đã đăng nhập hệ thống 
Luồng sự kiện chính	1. Hệ thống hiển thị form đổi email gồm trường email
2. Người dùng nhập email mới
3. Người dùng nhấn “Cập nhật”
4. Hệ thống kiểm tra tính hợp lệ của email
5. Hệ thống gửi một liên kết xác thực đến địa chỉ email
6. Hệ thống hiển thị hộp thoại trạng thái và thông báo kiểm tra email
7. Người dùng xác thực email
8. Hệ thống kiểm tra tính hợp lệ của xác thực
9. Hệ thống lưu email mới lên cơ sở dữ liệu
10. Hệ thống hiển thị thông báo và hiển thị email mới trên hệ thống
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 4, nếu trường thông tin bị bỏ trống
5.1 Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin
Luồng thay thế 2: Tại bước 4, nếu email sai định dạng
5.2 Hệ thống thông báo lỗi và yêu cầu nhập lại
Luồng thay thế 3: Tại bước 4, nếu email đã tồn tại
5.3 Hệ thống thông báo lỗi và yêu cầu nhập lại
Luồng thay thế 4: Tại bước 3, nếu người dùng đóng hộp thoại
4.1 Hệ thống đóng hộp thoại và không lưu dữ liệu mới
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 5, nếu hệ thống không gửi được email do lỗi hệ thống
6.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
6.2 Use Case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 9, nếu hệ thống không lưu được dữ liệu mới
10.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
10.2 Use Case kết thúc thất bại
Bảng 2.10 Đặc tả Use Case Đổi mật khẩu
Tên Use Case	Đổi mật khẩu
Tác nhân	Người dùng
Mục đích	Cho phép ngưởi dùng thay đổi mật khẩu sau một khoảng thời gian sử dụng nhằm bảo mật hơn
Điều kiện kích hoạt	Người dùng chọn chức năng “Đổi mật khẩu” trong trang Hồ sơ cá nhân
Điều kiện tiên quyết	Người dùng đã đăng nhập hệ thống 
Luồng sự kiện chính	1. Hệ thống hiển thị hộp thoại form Đổi mật khẩu bao gồm các trường Mật khẩu hiện tại, mật khẩu mới, xác nhận mật khẩu mới
2. Người dùng nhập đầy đủ thông tin
3. Người dùng nhấn “Cập nhật ngay”
4. Hệ thống kiểm tra tính hợp lệ của dữ liệu
5. Hệ thống cập mật dữ liệu mới lên cơ sở dữ liệu
6. Hệ thống hiển thị thông báo thành công
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 4, nếu trường thông tin bị bỏ trống
5.1 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại đầy đủ thông tin
Luồng thay thế 2: Tại bước 4, nếu trường thông tin nhập không đúng theo yêu cầu hệ thống
5.2 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại
Luồng thay thế 3: Tại bước 4, nếu mật khẩu mới trùng với mật khẩu cũ
5.3. Hệ thống hiển thị thông báo “Mật khẩu mới không được trùng với mật khẩu cũ”
Luồng thay thế 4: Tại bước 4, nếu mật khẩu cũ không đúng theo yêu cầu định dạng của hệ thống
5.4. Hệ thống hiển thị thông báo “Mật khẩu mới không được trùng với mật khẩu cũ”
Luồng thay thế 4: Tại bước 4, nếu xác nhận mật khẩu mới không trùng khớp với trường mật khẩu mới 
5.5. Hệ thống hiển thị thông báo lỗi “Xác nhận mật khẩu không trùng khớp”
Luồng thay thế 5: Tại bước 3, nếu người dùng nhấn đóng hộp thoại
4.1 Hệ thống quay về trang Đăng nhập 
Luồng thay thế 6: Tại bước 4, nếu mật khẩu hiện tại không chính xác
5.1 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại mật khẩu hiện tại
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 4, nếu không lưu được dữ liệu do lỗi hệ thống
8.1. Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
8.2 Use case kết thúc thất bại
Bảng 2.11 Đặc tả Use Case Đặt hàng và thanh toán
Tên Use Case	Đặt hàng và thanh toán
Tác nhân	Người dùng
Mục đích	Cho phép người dùng mua các sản phẩm từ giỏ hàng và thanh toán
Điều kiện kích hoạt	Người dùng chọn chức năng Mua ngay trên hệ thống
Điều kiện tiên quyết	Người dùng đã đăng nhập hệ thống
Luồng sự kiện chính	1. Hệ thống hiển thị trang Đặt hàng và tính toán tổng tiền đơn hàng (tạm tính)
2. Người dùng nhập đầy đủ/chọn địa chỉ nhận hàng 
3.Người dùng chọn phương thức thanh toán
4. Người dùng nhấn “Đặt hàng”
5. Hệ thống kiểm tra tính hợp lệ của các thông tin khác (địa chỉ, số điện thoại...)
6. Hệ thống thực hiện kiểm tra tồn kho cho các sản phẩm trong giỏ hàng
7. Hệ thống lưu dữ liệu đơn hàng vào cơ sở dữ liệu
8. Hệ thống thực hiện trừ tồn kho của sản phẩm đã được đặt
9. Hệ thống hiển thị thông báo đặt hàng thành công với trạng thái “Chờ xác nhận”
10. Hệ thống gửi email hóa đơn đơn hàng và hiển thị thông báo “Đặt hàng thành công”
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 6, nếu có sản phẩm hết hàng hoặc không đủ số lượng.
7.1. Hệ thống thông báo lỗi tồn kho không đủ.
7.2. Hệ thống yêu cầu khách hàng cập nhật lại giỏ hàng trước khi đặt lại
Luồng thay thế 2: Tại bước 5, nếu trường thông tin bị bỏ trống
6.1. Hệ thống thông báo lỗi và yêu cầu nhập đầy đủ thông tin
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 7, nếu không thể tạo đơn hàng mới do lỗi hệ thống
8.1 Hệ thống thông báo lỗi và yêu cầu người dùng thử lại sau
8.2 Use case kết thúc thất bại
Bảng 2.12 Đặc tả Use Case Cập nhật trạng thái đơn hàng
Tên Use Case	Cập nhật trạng thái đơn hàng
Tác nhân	Quản trị viên
Mục đích	Giúp quản trị viên cập nhật tiến độ xử lý đơn hàng cho khách hàng
Điều kiện kích hoạt	Quản trị viên nhấn chọn chức năng Xem chi tiết đơn hàng bất kỳ trong danh sách đơn hàng trên hệ thống
Điều kiện tiên quyết	Quản trị viên đã đăng nhập với tài khoản có quyền quản trị viên và truy cập vào trang Quản lý đơn hàng
Luồng sự kiện chính	1. Hệ thống hiển thị hộp thoại “Chi tiết đơn hàng”
2. Người dùng cập nhật trạng thái đơn hàng 
3. Hệ thống thực hiện cập nhật trạng thái đơn hàng hoặc trạng thái thanh toán trên cơ sở dữ liệu
4. Hệ thống hiển thị thông báo cập nhật trạng thái thành công và hiển thị trạng thái mới của đơn hàng trên danh sách đơn hàng
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 3, quản trị viên chọn trạng thái "Hủy đơn hàng"
4.1. Hệ thống hiển thị hộp thoại Xác nhận xóa 
4.2 Người dùng nhấn “Xác nhận”
4.3. Hệ thống thực hiện hủy đơn hàng, hoàn và cập nhật lại số lượng tồn kho trên hệ thống
4.4. Hệ thống cập nhật trạng thái "Đã hủy" và người thực hiện hủy là quản trị viên
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 4, nếu hệ thống không cập nhật được trạng thái đơn hàng do lỗi hệ thống
4.1. Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
4.2. Use case kết thúc thất bại.
Bảng 2.13 Đặc tả Use Case Chat với Chatbot
Tên Use Case	Chat với Chatbot
Tác nhân	Người dùng
Mục đích	Cho phép người dùng đặt câu hỏi và tra cứu thông tin liên quan đến sản phẩm và cửa hàng
Điều kiện kích hoạt	Người dùng chọn chức năng Chatbot AI trên hệ thống 
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống 
Luồng sự kiện chính	1. Hệ thống hiển thị cửa sổ Chatbot AI
2. Hệ thống hiển thị các câu hỏi có sẵn
3. Người dùng chọn câu hỏi có sẵn hoặc tự nhập câu hỏi
4. Người dùng nhấn Gửi
5. Hệ thống gửi câu hỏi đến Chatbot AI
6. Mô hình Chatbot hiển thị câu trả lời trên cửa sổ chat
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 6, AI gợi ý kèm danh sách sản phẩm.
6.1. Hệ thống hiển thị card sản phẩm kèm nút "Thêm vào giỏ"
6.2. Người dùng nhấn biểu tượng “Thêm vào giỏ hàng” 
6.3 Hệ thống cập nhật dữ liệu vào cơ sở dữ liệu
6.4 Hệ thống hiển thị dữ liệu mới trong giỏ hàng giỏ hàng 
Luồng thay thế 2: Tại bước 6, người dùng nhấn "Dừng phản hồi" 
6.1. Hệ thống dừng phiên chat, hiển thị phần nội dung đã nhận được.
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 5, nếu không thể kết nối với Chatbot AI
6.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
6.2 Use case kết thúc thất bại
Luồng ngoại lệ 2: Tại bước 6, Chatbot trả về lỗi hoặc không hiển thị câu trả lời
7.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
7.2 Use case kết thúc thất bại
Bảng 2.14 Đặc tả Use Case Quản lý giỏ hàng
Tên Use Case	Theo dõi đơn hàng
Tác nhân	Người dùng
Mục đích	Cho phép người dùng thực hiện các chức năng sửa số lượng sản phẩm và xóa sản phẩm khỏi giỏ hàng
Điều kiện kích hoạt	Người dùng vào chọn biểu tượng Giỏ hàng trên hệ thống
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống
Luồng sự kiện chính	1. Hệ thống hiển thị danh sách sản phẩm hiện có trong giỏ hàng
2. Người dùng lựa chọn thao tác quản lý giỏ hàng
3. Hệ thống thực hiện chức năng tương ứng
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 2, người dùng thay đổi số lượng bằng nút (+) hoặc (-) hoặc nhập số lượng mới ở sản phẩm bất kỳ
4.2. Hệ thống thực hiện Use Case “Sửa số lượng sản phẩm trong giỏ hàng”
Luồng thay thế 2: Tại bước 2, nếu người dùng nhấn biểu tượng “Xóa” ở sản phẩm bất kỳ
4.3. Hệ thống thực hiện Use Case “Xóa sản phẩm khỏi giỏ hàng”
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 1, nếu hệ thống không tải danh sách sản phẩm hiện có trong giỏ hàng
3.1. Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
3.2 Use case kết thúc thất bại
Bảng 2.15 Đặc tả Use Case Thêm sản phẩm vào giỏ hàng 
Tên Use Case	Thêm sản phẩm vào giỏ hàng
Tác nhân	Người dùng
Mục đích	Cho phép khách hàng thêm các sản phẩm muốn mua vào giỏ hàng từ nhiều vị trí khác nhau trên hệ thống
Điều kiện kích hoạt	Khách hàng nhấn "Thêm vào giỏ" tại Trang chủ, Trang danh sách hoặc Trang chi tiết sản phẩm hoặc trang Xem chi tiết món ăn
Khách hàng nhấn biểu tượng "+" trên thẻ sản phẩm trong cửa sổ Chatbot AI hoặc 
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống 
Luồng sự kiện chính	1. Khách hàng nhấn biểu tượng "Thêm vào giỏ hàng" tại một sản phẩm cụ thể
2. Hệ thống kiểm tra số lượng tồn kho của sản phẩm
3. Hệ thống lưu dữ liệu vào cơ sở dữ liệu
4. Hệ thống thêm sản phẩm thành công và hiển thị trạng thái thêm thành công
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 4, nếu trường thông tin bị bỏ trống 
5.1 Hệ thống sẽ thông báo lỗi và yêu cầu đầy đủ thông tin
Luồng thay thế 2: Tại bước 4, nếu trường thông tin nhập sai yêu cầu của hệ thống
5.2 Hệ thống sẽ thông báo lỗi và yêu cầu nhập lại theo đúng yêu cầu của hệ thống
Luồng thay thế 3: Tại bước 3, nếu người dùng nhấn “Hủy”
4.1 Hệ thống đóng hộp thoại và không lưu thay đổi dữ liệu
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 3, nếu không thể lưu dữ liệu do lỗi hệ thống
4.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
4.2 Use case kết thúc thất bại

Bảng 2.16 Đặc tả Use Case Sửa số lượng sản phẩm
Tên Use Case	Sửa số lượng sản phẩm
Tác nhân	Người dùng
Mục đích	Cho phép người dùng thay đổi số lượng sản phẩm trong giỏ hàng
Điều kiện kích hoạt	 Người dùng nhấn vào nút tăng (+) hoặc giảm (-) tại một sản phẩm trong giỏ hàng
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống và truy cập vào giỏ hàng
Luồng sự kiện chính	1. Hệ thống hiển thị chi tiết giỏ hàng
2. Người dùng nhấn vào nút tăng (+) hoặc giảm (-) hoặc nhập số lượng mới tại một sản phẩm trong giỏ hàng
3. Hệ thống kiểm tra số lượng tồn kho thực tế của sản phẩm
4. Hệ thống cập nhật dữ liệu mới vào cơ sở dữ liệu
5. Hệ thống hiển thị số lượng và tổng tiền mới
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 2, nếu giảm hoặc nhập số lượng về 0
3.1 Hệ thống gọi đến use case Xóa sản phẩm trong giỏ hàng
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 4, nếu không thể lưu dữ liệu mới do lỗi hệ thống
5.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
5.2 Use case kết thúc thất bại
Bảng 2.17 Đặc tả Use Case Xóa sản phẩm khỏi giỏ hàng
Tên Use Case	Xóa sản phẩm khỏi giỏ hàng
Tác nhân	Người dùng
Mục đích	Cho phép người dùng thực hiện việc xóa sản phẩm khỏi hệ thống
Điều kiện kích hoạt	Người dùng nhập/giảm số lượng về 0 hoặc nhấn biểu tượng “Xóa” tại sản phẩm muốn xóa khỏi giỏ hàng
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống và truy cập vào giỏ hàng
Luồng sự kiện chính	
1. Hệ thống hiển thị hộp thoại Xác nhận xóa
2. Người dùng nhấn “Xác nhận”
3. Hệ thống cập nhật dữ liệu của giỏ hàng vào cơ sở dữ liệu
4. Hệ thống hiển thị thông báo “Đã xóa sản phẩm khỏi giỏ hàng”
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 2, nếu người dùng nhấn “Hủy”
3.1 Hệ thống đóng hộp thoại và giữ nguyên trạng thái sản phẩm
3.2 Hệ thống quay lại hộp thoại giỏ hàng
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 3, nếu không thể lưu dữ liệu mới do lỗi hệ thống
4.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
4.2 Use case kết thúc thất bại
Bảng 2.18 Đặc tả Use Case Tạo phiếu nhập kho
Tên Use Case	Tạo phiếu nhập kho
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên thực hiện việc nhập thêm sản phẩm vào kho, cập nhật số lượng tồn kho thực tế và lưu trữ thông tin nhập kho
Điều kiện kích hoạt	Quản trị viên chọn chức năng “Tạo phiếu nhập/xuất kho” hoặc nhấn biểu tượng “+” tại sản phẩm muốn nhập kho trong danh sách tồn kho
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên và truy cập trang Quản lý kho
Luồng sự kiện chính	
1. Hệ thống hiển thị Trang tạo phiếu nhập/xuất kho
2. Người dùng chọn chức năng Nhập kho
3. Hệ thống hiển thị form Tạo phiếu nhập kho
4. Quản trị viên tìm kiếm và chọn các sản phẩm cần nhập vào danh sách phiếu nhập
5. Hệ thống hiển thị danh sách sản phẩm đã chọn kèm thông tin tồn kho hiện tại của sản phẩm
6. Quản trị viên nhập đầy đủ các trường thông tin gồm: Người nhập kho (bắt buộc), Ngày nhập (bắt buộc, mặc định là ngày tại thời điểm tạo phiếu nhập), Ghi chú (bắt buộc), Số lượng nhập (bắt buộc, tối thiểu 1) và Giá nhập cho từng sản phẩm (bắt buộc, tối thiểu 1.000 VNĐ)
7. Quản trị viên nhấn nút "Xác nhận nhập kho"
8. Hệ thống kiểm tra tính hợp lệ của dữ liệu 
9. Hệ thống lưu dữ liệu vào cơ sở dữ liệu
10. Hệ thống thông báo "Nhập kho thành công" và làm mới danh sách của quản lý kho
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 8, nếu các trường thông tin bị bỏ trống
9.1 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập đầy đủ
Luồng thay thế 2: Tại bước 8, nếu dữ liệu được nhập không hợp lệ
8.2 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 9, nếu không thể lưu dữ liệu mới do lỗi hệ thống
10.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
10.2 Use case kết thúc thất bại
Bảng 2.19 Đặc tả Use Case Tạo phiếu xuất kho
Tên Use Case	Tạo phiếu xuất kho
Tác nhân	Quản trị viên
Mục đích	Cho phép quản trị viên thực hiện ghi nhận việc hàng hóa xuất khỏi kho (do hỏng hóc, tiêu dùng nội bộ,...) và cập nhật giảm số lượng tồn kho thực tế.
Điều kiện kích hoạt	Quản trị viên chọn chức năng “Tạo phiếu nhập/xuất kho” hoặc nhấn biểu tượng “-” tại sản phẩm muốn xuất kho trong danh sách tồn kho
Điều kiện tiên quyết	Người dùng đã đăng nhập vào hệ thống với tài khoản có quyền quản trị viên và truy cập trang Quản lý kho
Luồng sự kiện chính	
1. Hệ thống hiển thị trang Tạo phiếu nhập/xuất kho
2. Người dùng chọn chức năng Xuất kho
3. Hệ thống hiển thị form Tạo phiếu nhập kho
4. Quản trị viên tìm kiếm và chọn các sản phẩm cần xuất vào danh sách phiếu xuất kho
5. Hệ thống hiển thị danh sách sản phẩm đã chọn kèm thông tin tồn kho hiện tại của sản phẩm
6. Quản trị viên nhập đầy đủ các trường thông tin gồm: Lý do xuất (bắt buộc chọn), Người xác nhận (bắt buộc), Ngày xuất (bắt buộc, mặc định là ngày tại thời điểm tạo phiếu xuất), Ghi chú (bắt buộc), Số lượng xuất (bắt buộc, tối thiểu 1) 
7. Quản trị viên nhấn nút "Xác nhận xuất kho"
8. Hệ thống kiểm tra tính hợp lệ của dữ liệu 
9. Hệ thống lưu dữ liệu vào cơ sở dữ liệu
10. Hệ thống thông báo "Xuất kho thành công" và làm mới danh sách của quản lý kho
Luồng sự kiện thay thế	Luồng thay thế 1: Tại bước 8, nếu các trường thông tin bị bỏ trống
9.1 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập đầy đủ
Luồng thay thế 2: Tại bước 8, nếu dữ liệu được nhập không hợp lệ (số lượng xuất vượt quá số lượng tồn kho)
8.2 Hệ thống hiển thị thông báo lỗi và yêu cầu người dùng nhập lại
Luồng sự kiện ngoại lệ	Luồng ngoại lệ 1: Tại bước 9, nếu không thể lưu dữ liệu mới do lỗi hệ thống
10.1 Hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau
10.2 Use case kết thúc thất bại
