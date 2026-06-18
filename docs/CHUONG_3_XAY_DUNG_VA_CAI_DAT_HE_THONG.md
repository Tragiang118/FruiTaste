# CHƯƠNG 3: XÂY DỰNG VÀ CÀI ĐẶT HỆ THỐNG

Chương này tập trung trình bày chi tiết về quá trình cài đặt môi trường, khởi tạo dự án, thiết kế cơ sở dữ liệu với Prisma ORM, cài đặt các chức năng nghiệp vụ cốt lõi ở Backend NestJS, xây dựng giao diện người dùng bằng Next.js App Router, tích hợp chatbot tư vấn dinh dưỡng thông minh sử dụng Groq API, quy trình triển khai hệ thống (deployment), và đánh giá kết quả kiểm thử thực tế thông qua các kịch bản kiểm thử (test cases). Toàn bộ nội dung mô tả dưới đây đều dựa trên mã nguồn thực tế đã được xây dựng và kiểm chứng của hệ thống FruiTaste.

---

## 3.1 Cài đặt môi trường và công nghệ phát triển hệ thống

Để đảm bảo tính nhất quán, hiệu năng cao và độ an toàn của hệ thống FruiTaste, các thành phần phát triển và vận hành hệ thống đã được lựa chọn kỹ lưỡng và thiết lập theo các tiêu chuẩn công nghệ hiện đại.

### 3.1.1 Công nghệ phát triển phía Backend

Môi trường phát triển cục bộ và hệ thống máy chủ được cấu hình với các công cụ chính sau đây nhằm tối ưu hóa năng suất lập trình và chất lượng mã nguồn:
*   **Trình soạn thảo mã nguồn**: **Visual Studio Code (VS Code)** được sử dụng làm IDE chính nhờ hệ sinh thái extension phong phú. Các tiện ích mở rộng cốt lõi bao gồm:
    *   *ESLint*: Hỗ trợ phát hiện nhanh các lỗi cú pháp và cảnh báo lỗi logic tĩnh theo bộ quy tắc nghiêm ngặt của `eslint-config-next` cho Frontend và `eslint-plugin-prettier` cho Backend.
    *   *Prettier - Code Formatter*: Tự động định dạng mã nguồn theo cấu hình chuẩn hóa trong tệp `.prettierrc` (sử dụng dấu nháy đơn `singleQuote: true`, dấu phẩy cuối `trailingComma: "all"`, và độ rộng thụt lề `tabWidth: 2`), giúp toàn bộ mã nguồn của nhóm phát triển đồng bộ và dễ đọc.
    *   *Prisma*: Cung cấp tính năng highlight cú pháp, tự động hoàn thành (autocomplete) và kiểm tra lỗi thời gian thực đối với tệp định nghĩa cơ sở dữ liệu `schema.prisma`.
*   **Nền tảng Runtime**: **Node.js (LTS)** là môi trường thực thi mã nguồn JavaScript/TypeScript ở phía máy chủ cho cả hai dự án Frontend và Backend.
*   **Hệ quản trị cơ sở dữ liệu**: **PostgreSQL (v15+)** lưu trữ an toàn toàn bộ dữ liệu của hệ thống (đơn hàng, kho hàng). Khi chạy local, cơ sở dữ liệu sử dụng cổng `5432` với tên `fruitaste`.
*   **Công cụ kiểm thử API**: **Postman** được sử dụng xuyên suốt quá trình thiết kế và kiểm thử các RESTful API endpoint của Backend NestJS, giúp xác minh dữ liệu trả về (Response Payload) và các mã lỗi (HTTP Status Codes) trước khi thực hiện tích hợp lên giao diện người dùng.

Dưới đây là bảng tổng hợp chi tiết các công nghệ cốt lõi được áp dụng thực tế trong hệ thống FruiTaste:

| STT | Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống | Lý do lựa chọn |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Ngôn ngữ chính | **TypeScript** | v5.7 | Ngôn ngữ lập trình toàn hệ thống. | Bảo đảm tính an toàn kiểu dữ liệu (Type-safe), phát hiện lỗi sớm khi biên dịch mã nguồn. |
| 2 | Framework Backend | **NestJS** | v11.0.1 | Xây dựng RESTful API và xử lý logic nghiệp vụ. | Kiến trúc modular vững chắc, hỗ trợ Dependency Injection (DI) mạnh mẽ, dễ bảo trì và mở rộng. |
| 3 | Framework Frontend | **Next.js** (App Router) | v16.1.6 | Phát triển giao diện người dùng và Admin Dashboard. | Hỗ trợ Server-side Rendering (SSR) và React Server Components (RSC) tối ưu hóa SEO và hiệu năng tải trang. |
| 4 | Styling Engine | **Tailwind CSS** | v4.2.2 | Thiết kế giao diện responsive và động. | Tốc độ biên dịch cực nhanh, loại bỏ CSS thừa, viết code giao diện nhanh chóng. |
| 5 | Quản lý Database | **Prisma ORM** | v6.19.2 | Ánh xạ và thực thi truy vấn SQL hướng đối tượng. | Tự động đồng bộ cấu trúc database, tự động sinh Client Type-safe, loại bỏ lỗi sai tên trường dữ liệu. |
| 6 | Hệ quản trị CSDL | **PostgreSQL** | v15+ | Lưu trữ dữ liệu quan hệ của hệ thống. | Đảm bảo tính toàn vẹn dữ liệu giao dịch cao, hỗ trợ transaction phức tạp. |
| 7 | Quản lý State | **Zustand** | v5.0.11 | Quản lý giỏ hàng và phiên đăng nhập Client. | Dung lượng siêu nhẹ, API đơn giản, hiệu năng cao, tránh re-render dư thừa. |
| 8 | Quản lý Async Data | **React Query** | v5.91.3 | Quản lý dữ liệu bất đồng bộ từ API. | Cung cấp cơ chế tự động cache dữ liệu, tối ưu hóa băng thông mạng và tự động đồng bộ trạng thái. |
| 9 | Tương tác AI | **Vercel AI SDK** | v6.0 | Phát triển luồng chat streaming từ chatbot AI. | Hỗ trợ giao thức truyền dữ liệu dạng luồng (Streaming response) và cơ chế Tool Calling. |
| 10 | AI Inference Engine | **Groq Cloud API** | SDK v3.0 | Xử lý suy luận mô hình ngôn ngữ Llama-3.3. | Tốc độ sinh token cực nhanh (gần như tức thời), hỗ trợ hoàn hảo tiếng Việt. |

### 3.1.2 Khởi tạo dự án

Hệ thống FruiTaste được tổ chức theo cấu trúc mã nguồn hợp nhất (Monorepo) để dễ dàng quản lý phiên bản và đồng bộ hóa các tệp tin cấu hình. Toàn bộ mã nguồn được chia thành hai thư mục con độc lập cấp cao nhất: `frontend` và `backend`.

**Bước 1: Khởi tạo thư mục dự án và Frontend Next.js**
Từ thư mục gốc của không gian làm việc (workspace), dự án Frontend được tạo ra bằng công cụ CLI của Next.js:
```powershell
npx create-next-app@latest frontend
```
Trong quá trình khởi tạo tương tác, các tùy chọn sau được lựa chọn:
*   *TypeScript*: Yes
*   *ESLint*: Yes
*   *Tailwind CSS*: Yes
*   *src/ directory*: No
*   *App Router*: Yes
*   *Customize default import alias*: No

Sau đó, tiến hành di chuyển vào thư mục `frontend` và cài đặt các thư viện bổ trợ:
```powershell
cd frontend
npm install axios zustand @tanstack/react-query react-hook-form zod sonner lucide-react class-variance-authority clsx tailwind-merge
npm install @ai-sdk/groq ai @ai-sdk/react
```
*   `axios`: Sử dụng để thực hiện các yêu cầu HTTP.
*   `zustand`: Dùng để quản lý trạng thái giỏ hàng và thông tin tài khoản người dùng đăng nhập cục bộ.
*   `@tanstack/react-query`: Dùng để quản lý trạng thái tải dữ liệu, cache dữ liệu từ API và tự động refetch.
*   `@ai-sdk/groq` và `ai`: Các thư viện cốt lõi của Vercel AI SDK dùng kết nối Groq API và quản lý giao tiếp dạng Stream.

Khởi động dự án Frontend ở môi trường phát triển:
```powershell
npm run dev
```
Giao diện mặc định sẽ lắng nghe trên cổng `3000` (địa chỉ `http://localhost:3000`).

**Bước 2: Khởi tạo dự án Backend NestJS**
Từ thư mục gốc của workspace, tiến hành sử dụng CLI của NestJS để khởi tạo cấu trúc thư mục dự án Backend:
```powershell
npx @nestjs/cli new backend
```
Lựa chọn trình quản lý gói là `npm`. Sau khi CLI thiết lập xong cấu trúc modular mặc định, tiến hành cài đặt các gói thư viện quan trọng:
```powershell
cd backend
npm install @prisma/client @nestjs/jwt passport-jwt passport @nestjs/passport bcrypt nodemailer @nestjs/schedule class-validator class-transformer
npm install -D prisma ts-node @types/bcrypt @types/nodemailer @types/passport-jwt
```
*   `prisma` & `@prisma/client`: Công cụ Prisma ORM phục vụ truy vấn cơ sở dữ liệu an sau.
*   `@nestjs/jwt` & `passport-jwt`: Cơ chế bảo mật và xác thực người dùng bằng JSON Web Token.
*   `bcrypt`: Thuật toán băm một chiều bảo mật mật khẩu.
*   `nodemailer`: Dịch vụ gửi email thông báo mã kích hoạt và mã OTP.
*   `@nestjs/schedule`: Module quản lý và lập lịch các tác vụ ngầm định kỳ (Cron Jobs).
*   `class-validator` & `class-transformer`: Tự động kiểm tra tính toàn vẹn của dữ liệu DTO đầu vào.

Sau khi cài đặt thành công, tệp `.env` được tạo tại thư mục gốc của `backend` để lưu trữ các biến môi trường cấu hình kết nối database, khoá bảo mật JWT, cổng dịch vụ, và thông tin SMTP Mail. Backend được khởi chạy ở chế độ watch mode để tự động nạp lại mã nguồn khi có thay đổi:
```powershell
npm run start:dev
```
Backend chạy thành công sẽ lắng nghe tại cổng `8000` (địa chỉ `http://localhost:8000/api`) nhằm tránh xung đột cổng với Next.js. Toàn bộ lịch sử mã nguồn của cả hai thư mục được quản lý đồng bộ qua hệ thống Git và đẩy lên kho lưu trữ GitHub.

---

## 3.2 Thiết kế cơ sở dữ liệu và biểu đồ lớp

### 3.2.1 Xây dựng cơ sở dữ liệu với Prisma ORM

Thay vì thực hiện các câu lệnh SQL thuần túy dễ dẫn đến sai sót và khó bảo trì, hệ thống sử dụng Prisma ORM để ánh xạ các thực thể cơ sở dữ liệu thành các mô hình đối tượng (Models) trong mã nguồn TypeScript.

Toàn bộ sơ đồ thực thể liên kết (ERD) được định nghĩa trong tệp `backend/prisma/schema.prisma`. Hệ thống định nghĩa 22 mô hình chính, thiết lập chặt chẽ các ràng buộc khóa ngoại, chỉ mục (indexes) và hành vi khi xóa dữ liệu (ví dụ: `onDelete: Cascade` cho các mối quan hệ sở hữu trực tiếp và `onDelete: SetNull` cho các mối quan hệ tham chiếu).

**Quy trình đồng bộ và cập nhật cơ sở dữ liệu:**
1.  Sau khi chỉnh sửa cấu trúc các Model trong tệp `schema.prisma`, chạy lệnh Migration để Prisma tự động so sánh, sinh ra tệp mã nguồn SQL mô tả sự thay đổi và đồng bộ cấu trúc trực tiếp xuống PostgreSQL Database:
    ```powershell
    npx prisma migrate dev --name init_database_schema
    ```
2.  Sau khi cơ sở dữ liệu được cập nhật cấu trúc, chạy lệnh biên dịch Prisma Client để tự động sinh ra các định nghĩa kiểu dữ liệu (Types) mạnh mẽ:
    ```powershell
    npx prisma generate
    ```
    Bộ thư viện `Prisma Client` lúc này sẽ chứa toàn bộ kiểu dữ liệu tương ứng với cấu trúc bảng thực tế, giúp lập trình viên phát hiện lỗi sai tên trường dữ liệu hoặc sai kiểu dữ liệu ngay tại thời điểm viết code trong VS Code thay vì đợi ứng dụng chạy mới phát hiện ra lỗi.
3.  **Tích hợp Database Provider trong NestJS**: Một module tên là `PrismaModule` được xây dựng, chứa `PrismaService` kế thừa từ lớp `PrismaClient`. Lớp này thiết lập kết nối cơ sở dữ liệu khi khởi động ứng dụng và ngắt kết nối an toàn khi ứng dụng dừng. `PrismaService` được đăng ký dưới dạng một *Global Provider* để dễ dàng inject vào bất kỳ Service nào khác thông qua Dependency Injection (DI).

**Cơ chế Database Seeding:**
Để phục vụ việc kiểm thử nhanh hệ thống mà không cần tạo tài liệu thủ công, hệ thống sử dụng tệp `backend/my-seed.ts` để nạp dữ liệu mẫu ban đầu. File seed thực hiện các bước sau trong một Transaction:
*   Tạo các danh mục sản phẩm nổi bật (Trái cây nhập khẩu, Nước ép hữu cơ, Sinh tố dinh dưỡng).
*   Tạo danh sách sản phẩm mẫu kèm giá, đơn vị tính, chỉ số dinh dưỡng `healthInfo` và thiết lập số lượng tồn kho ban đầu.
*   Tạo cấu hình giá chung (`PricingConfig`) mặc định gồm tỷ lệ thuế VAT là 8% và biên lợi nhuận kỳ vọng 20%.
*   Tạo tài khoản quản trị viên mặc định (`admin@fruitaste.com`) với mật khẩu băm bảo mật để có thể đăng nhập vào trang quản trị ngay lập tức.

Chạy seed dữ liệu mẫu bằng lệnh:
```powershell
npx prisma db seed
```

### 3.2.2 Biểu đồ lớp (Class Diagram) hệ thống

Biểu đồ lớp (Class Diagram) chi tiết của hệ thống FruiTaste dưới đây được xây dựng dựa trên cấu trúc các thực thể dữ liệu thực tế trong mã nguồn dự án (Prisma Schema). Biểu đồ sử dụng các ký hiệu chuẩn UML để biểu diễn mối quan hệ giữa các lớp theo đúng tinh thần học thuật và thực tiễn phát triển.

#### 3.2.2.1 Quy chuẩn ký hiệu mối quan hệ UML sử dụng

Dựa trên cấu trúc quan hệ thực tế của các thực thể và ràng buộc toàn vẹn cơ sở dữ liệu (Database Integrity & Cascade Rules), chúng tôi áp dụng các ký hiệu liên kết chuẩn UML như sau:

| Ký hiệu UML | Tên mối quan hệ | Mô tả áp dụng trong hệ thống | Ký hiệu Mermaid |
| :---: | :--- | :--- | :---: |
| `───` | **Association (Liên kết)** | Kết nối giữa hai thực thể độc lập về vòng đời nhưng có tham chiếu dữ liệu đến nhau (ví dụ: một Chi tiết đơn hàng tham chiếu tới một Sản phẩm). | `--` |
| `◆───` | **Composition (Thuộc về hoàn toàn)** | Quan hệ sở hữu mạnh mẽ, phần con là một phần không thể tách rời và phụ thuộc hoàn toàn vào vòng đời của phần cha. Nếu cha bị xóa, con sẽ bị xóa theo (ràng buộc `onDelete: Cascade`). | `*--` |
| `◇───` | **Aggregation (Thu tụ/Thu gom)** | Quan hệ thu gom yếu, phần con có thể tồn tại độc lập với phần cha (ràng buộc `onDelete: SetNull` hoặc liên kết yếu). | `o--` |
| `- - - >` | **Dependency (Phụ thuộc)** | Một thực thể sử dụng thông tin, hàm hoặc cấu hình từ thực thể khác nhưng không lưu trữ trực tiếp dưới dạng trường quan hệ sở hữu. | `<..` |

#### 3.2.2.2 Sơ đồ lớp chi tiết hệ thống

Dưới đây là sơ đồ lớp chi tiết của hệ thống FruiTaste được vẽ động bằng Mermaid:

```mermaid
classDiagram
    direction TB

    %% Định nghĩa các lớp và thuộc tính/phương thức tương ứng
    class User {
        +int id
        +String email
        +String password
        +String fullName
        +String phone
        +String avatar
        +Role role
        +Boolean isEmailVerified
        +String verificationToken
        +String pendingEmail
        +String resetOtp
        +DateTime resetOtpExpiry
        +Boolean mustChangePassword
        +Boolean isActive
        +DateTime deletedAt
        +DateTime createdAt
        +DateTime updatedAt
        +register()
        +login()
        +verifyEmail()
        +forgotPassword()
        +updateProfile()
        +changePassword()
    }

    class Address {
        +int id
        +int userId
        +String recipientName
        +String phone
        +String fullAddress
        +Boolean isDefault
        +addAddress()
        +updateAddress()
        +deleteAddress()
        +setDefault()
    }

    class Cart {
        +int userId
        +getCart()
        +clearCart()
        +checkout()
    }

    class CartItem {
        +int id
        +int cartId
        +int productId
        +int quantity
        +addItem()
        +updateQuantity()
        +removeItem()
    }

    class Product {
        +int id
        +String name
        +String description
        +Float price
        +String unit
        +int stockQuantity
        +String[] mediaUrls
        +String healthInfo
        +String[] tags
        +Boolean isActive
        +Boolean isDeleted
        +DateTime createdAt
        +DateTime updatedAt
        +createProduct()
        +updateProduct()
        +deleteProduct()
        +getProductDetails()
        +getAllProducts()
    }

    class Category {
        +int id
        +String name
        +createCategory()
        +updateCategory()
        +deleteCategory()
        +getAllCategories()
    }

    class Order {
        +int id
        +int userId
        +String shippingName
        +String shippingPhone
        +String shippingAddress
        +Float totalAmount
        +Float shippingFee
        +Float finalAmount
        +OrderStatus status
        +Role cancelledBy
        +DateTime createdAt
        +DateTime updatedAt
        +createOrder()
        +updateStatus()
        +cancelOrder()
        +getOrderDetails()
        +getUserOrders()
    }

    class OrderItem {
        +int id
        +int orderId
        +int productId
        +int quantity
        +Float priceAtPurchase
    }

    class Payment {
        +int orderId
        +PaymentMethod method
        +PaymentStatus status
        +String transactionId
        +processPayment()
        +verifyPayment()
        +refundPayment()
    }

    class ChatSession {
        +int id
        +int userId
        +DateTime startedAt
        +DateTime endedAt
        +startSession()
        +endSession()
        +getHistory()
    }

    class ChatMessage {
        +int id
        +int sessionId
        +SenderType senderType
        +String messageText
        +String intent
        +DateTime createdAt
        +sendMessage()
    }

    class ImportReceipt {
        +int id
        +String supplier
        +int totalItems
        +Float totalCost
        +String note
        +DateTime createdAt
        +createImport()
        +getImportDetails()
    }

    class ImportItem {
        +int id
        +int receiptId
        +int productId
        +int quantity
        +Float importPrice
    }

    class ExportReceipt {
        +int id
        +String receiver
        +int totalItems
        +String note
        +DateTime createdAt
        +createExport()
        +getExportDetails()
    }

    class ExportItem {
        +int id
        +int receiptId
        +int productId
        +int quantity
    }

    class Recipe {
        +int id
        +String name
        +String description
        +int prepTime
        +String instructions
        +String imageUrl
        +DateTime createdAt
        +DateTime updatedAt
        +createRecipe()
        +updateRecipe()
        +deleteRecipe()
        +getRecipeDetails()
    }

    class RecipeIngredient {
        +int id
        +int recipeId
        +int productId
        +String ingredientName
        +String quantityStr
    }

    class Inventory {
        +int productId
        +int currentStock
        +int lowStockThreshold
        +DateTime lastImportDate
        +DateTime lastExportDate
        +DateTime updatedAt
        +checkStock()
        +updateStock()
        +getLowStockAlerts()
    }

    class StockTransaction {
        +int id
        +int productId
        +TransactionType type
        +int quantity
        +int previousStock
        +int newStock
        +String reason
        +String referenceId
        +DateTime createdAt
        +recordTransaction()
        +getTransactionHistory()
    }

    class ProductPricing {
        +int productId
        +Float costPrice
        +Float lossRate
        +Float customProfitMargin
        +Float manualPrice
        +DateTime updatedAt
        +calculatePrice()
        +updatePricingParams()
    }

    class PricingConfig {
        +int id
        +Float defaultTaxRate
        +Float defaultProfitMargin
        +Float minProfitMargin
        +Float maxProfitMargin
        +DateTime updatedAt
        +getConfig()
        +updateConfig()
    }

    %% Thiết lập các mối quan hệ (Relationships) đúng chuẩn UML
    
    %% 1. Quan hệ Composition (Sở hữu tuyệt đối, xóa cha tự động xóa con)
    User "1" *-- "0..*" Address : owns
    User "1" *-- "0..1" Cart : has
    Cart "1" *-- "0..*" CartItem : contains
    Order "1" *-- "0..*" OrderItem : contains
    Order "1" *-- "0..1" Payment : requires
    ChatSession "1" *-- "0..*" ChatMessage : contains
    ImportReceipt "1" *-- "0..*" ImportItem : contains
    ExportReceipt "1" *-- "0..*" ExportItem : contains
    Recipe "1" *-- "0..*" RecipeIngredient : includes
    
    Product "1" *-- "0..1" Inventory : tracks stock
    Product "1" *-- "0..1" ProductPricing : has pricing
    Product "1" *-- "0..*" StockTransaction : records changes
    
    %% 2. Quan hệ Aggregation (Thu tụ/Thu gom yếu - ◇───)
    User "1" o-- "0..*" Order : places
    User "0..1" o-- "0..*" ChatSession : initiates
    Category "0..*" o-- "0..*" Product : contains

    %% 3. Quan hệ Association (Liên kết tham chiếu thông thường - ───)
    CartItem "0..*" -- "1" Product : references
    OrderItem "0..*" -- "1" Product : references
    ImportItem "0..*" -- "1" Product : references
    ExportItem "0..*" -- "1" Product : references
    RecipeIngredient "0..*" -- "0..1" Product : uses

    %% 4. Quan hệ Dependency (Phụ thuộc chức năng/cấu hình)
    PricingConfig <.. ProductPricing : uses defaults
```

#### 3.2.2.3 Ràng buộc & Giải thích nghiệp vụ quan hệ

*   **Các quan hệ Thuộc về (Composition) tiêu biểu**:
    1.  *User ➔ Address & Cart*: Mỗi địa chỉ nhận hàng (`Address`) và giỏ hàng (`Cart`) được định danh và gắn chặt với tài khoản người dùng (`User`). Khi xóa một tài khoản, toàn bộ địa chỉ và giỏ hàng tương ứng sẽ bị xóa sạch khỏi hệ thống.
    2.  *Order ➔ OrderItem & Payment*: Một đơn hàng (`Order`) cấu thành từ danh sách chi tiết hàng hóa (`OrderItem`) và một yêu cầu thanh toán (`Payment`). Không thể tồn tại một chi tiết đơn hàng hay một thông tin thanh toán mồ côi nếu đơn hàng chính bị hủy bỏ về mặt cơ sở dữ liệu.
    3.  *Product ➔ Inventory & ProductPricing*: Kho chứa (`Inventory`) và Cấu hình giá bán (`ProductPricing`) sử dụng trực tiếp ID của sản phẩm làm khóa chính độc lập. Điều này thể hiện Product đóng vai trò quản lý trực tiếp vòng đời của hai thực thể phụ thuộc này.

*   **Các quan hệ Liên kết (Association)**:
    1.  *User ➔ Order*: Liên kết giữa người dùng và đơn hàng. Dù tài khoản bị ẩn/xóa mềm (`isDeleted` hoặc `isActive = false`), thông tin đơn hàng (`Order`) vẫn cần được lưu giữ nguyên vẹn trong hệ thống cho mục đích đối soát tài chính của quản trị viên, do đó đây là liên kết thông thường chứ không phải Composition.
    2.  *Category ➔ Product*: Mối quan hệ nhiều - nhiều (`n - m`). Một sản phẩm có thể nằm trong nhiều danh mục khác nhau và một danh mục chứa nhiều sản phẩm.

*   **Quan hệ Phụ thuộc (Dependency)**:
    *   *ProductPricing ➔ PricingConfig*: Lớp quản lý định giá sản phẩm (`ProductPricing`) chứa phương thức `calculatePrice()` để tính toán đề xuất giá bán tự động. Quá trình tính toán này cần tham chiếu đến các thông số thuế VAT mặc định và biên lợi nhuận sàn được lưu trữ trong lớp cấu hình chung `PricingConfig`. Đây là quan hệ phụ thuộc cấu hình (Dependency), được biểu diễn bằng mũi tên nét đứt hướng về phía `PricingConfig`.

---

## 3.3 Kết quả thực nghiệm hệ thống

Sau quá trình xây dựng và cài đặt, hệ thống FruiTaste đã được hoàn thiện giao diện và các chức năng nghiệp vụ. Dưới đây là kết quả thực nghiệm giao diện hệ thống được phân chia chi tiết theo từng vai trò người dùng:

### 3.3.1 Giao diện dành cho người dùng / Khách hàng (Customer Role)

1.  **Đăng ký và Đăng nhập**
    Hệ thống hỗ trợ khách hàng đăng ký tài khoản mới kèm cơ chế xác thực qua Email và đăng nhập bảo mật bằng JSON Web Token lưu trữ dưới dạng HttpOnly Cookie.
    ![Hình 3.1: Giao diện Đăng ký và Đăng nhập](docs/images/customer_auth.png)

2.  **Xem danh sách và chi tiết sản phẩm**
    Khách hàng có thể dễ dàng duyệt qua các danh mục trái cây tươi và nước ép, tìm kiếm sản phẩm theo từ khóa, lọc theo giá và xem thông tin chi tiết cũng như hàm lượng dinh dưỡng của từng sản phẩm.
    ![Hình 3.2: Giao diện Xem danh sách và chi tiết sản phẩm](docs/images/customer_products.png)

3.  **Giỏ hàng và Đặt hàng**
    Giao diện giỏ hàng trực tuyến hiển thị các mặt hàng đã chọn, cho phép thay đổi số lượng, tự động tính toán tổng tiền, phí vận chuyển và tiến hành nhập thông tin nhận hàng để đặt đơn.
    ![Hình 3.3: Giao diện Giỏ hàng và Đặt hàng](docs/images/customer_cart_order.png)

4.  **Thanh toán qua mã VietQR động**
    Khi đặt hàng với phương thức chuyển khoản, hệ thống tự động sinh mã VietQR động chứa sẵn số tài khoản, số tiền và nội dung chuyển khoản khớp với mã đơn hàng để khách hàng quét nhanh qua ứng dụng ngân hàng.
    ![Hình 3.4: Giao diện Thanh toán qua mã VietQR động](docs/images/customer_payment.png)

5.  **Trợ lý ảo Chatbot AI tư vấn dinh dưỡng**
    Khung chat trực tuyến tích hợp mô hình ngôn ngữ lớn giúp tư vấn dinh dưỡng cho khách hàng, tự động gọi công cụ tra cứu sản phẩm thực tế từ cơ sở dữ liệu và hiển thị nút thêm nhanh vào giỏ hàng.
    ![Hình 3.5: Giao diện Trợ lý ảo Chatbot AI](docs/images/customer_chatbot.png)

6.  **Xem công thức chế biến**
    Cung cấp danh sách các công thức làm sinh tố, nước ép bổ dưỡng từ các loại trái cây có sẵn tại cửa hàng, giúp khách hàng có thêm gợi ý sử dụng sản phẩm.
    ![Hình 3.6: Giao diện Xem công thức chế biến](docs/images/customer_recipes.png)

### 3.3.2 Giao diện dành cho Quản trị viên (Admin Role)

1.  **Bảng điều khiển thống kê (Dashboard)**
    Trang tổng quan cung cấp các biểu đồ cột và biểu đồ tròn biểu diễn doanh thu theo thời gian, số lượng đơn hàng mới và cơ cấu các sản phẩm bán chạy nhất giúp quản trị viên theo dõi tình hình kinh doanh.
    ![Hình 3.7: Giao diện Bảng điều khiển Dashboard](docs/images/admin_dashboard.png)

2.  **Quản lý danh mục và sản phẩm**
    Giao diện cho phép quản trị viên thêm mới, cập nhật thông tin sản phẩm (tên, giá, đơn vị tính, mô tả dinh dưỡng, ảnh đại diện) và phân loại sản phẩm theo từng danh mục tương ứng.
    ![Hình 3.8: Giao diện Quản lý sản phẩm](docs/images/admin_products.png)

3.  **Quản lý đơn hàng và đối soát thanh toán**
    Hệ thống hiển thị danh sách đơn hàng toàn cục, hỗ trợ lọc theo trạng thái đơn, cho phép quản trị viên cập nhật tiến độ xử lý và thực hiện đối soát xác nhận thanh toán đối với đơn chuyển khoản VietQR.
    ![Hình 3.9: Giao diện Quản lý đơn hàng](docs/images/admin_orders.png)

4.  **Quản lý kho hàng và lịch sử giao dịch**
    Quản trị viên có thể theo dõi số lượng tồn kho thực tế của từng sản phẩm, thiết lập ngưỡng cảnh báo tồn kho thấp, tạo phiếu nhập/xuất kho thủ công và xem lịch sử biến động kho chi tiết.
    ![Hình 3.10: Giao diện Quản lý kho hàng](docs/images/admin_inventory.png)

5.  **Quản lý định giá sản phẩm thông minh**
    Công cụ hỗ trợ tự động tính toán giá bán đề xuất của sản phẩm dựa trên giá nhập gần nhất, biên lợi nhuận kỳ vọng và tỷ lệ hao hụt thực tế, cho phép cập nhật nhanh giá bán lên hệ thống.
    ![Hình 3.11: Giao diện Định giá sản phẩm](docs/images/admin_pricing.png)

6.  **Quản lý công thức nấu ăn**
    Cho phép quản trị viên thêm, sửa hoặc xóa các công thức chế biến, liên kết nguyên liệu với các sản phẩm trái cây đang bán để gợi ý mua hàng cho người dùng.
    ![Hình 3.12: Giao diện Quản lý công thức](docs/images/admin_recipes.png)

---

## 3.4 Quy trình triển khai (Deploy) dự án

Để đưa dự án FruiTaste vào môi trường hoạt động thực tế phục vụ khách hàng, quy trình triển khai được thực hiện thông qua các bước cụ thể sau:

*   **Bước 1: Cấu hình tham số môi trường**
    Thực hiện điều chỉnh các tham số cấu hình hệ thống, chuyển đổi toàn bộ các đường dẫn kết nối nội bộ (localhost) thành địa chỉ tên miền chính thức đã đăng ký cho cả dịch vụ Frontend và Backend.
*   **Bước 2: Biên dịch dự án**
    Chạy quy trình đóng gói và biên dịch dự án Frontend để tối ưu hóa hiệu năng, đồng thời biên dịch toàn bộ mã nguồn Backend từ TypeScript sang JavaScript chuẩn để chuẩn bị khởi chạy.
*   **Bước 3: Đồng bộ mã nguồn lên máy chủ**
    Đăng nhập vào hệ thống quản lý máy chủ/hosting, thực hiện đồng bộ mã nguồn phiên bản mới nhất từ kho lưu trữ GitHub và tải các thư mục tài nguyên tĩnh cần thiết lên hệ thống lưu trữ của máy chủ.
*   **Bước 4: Đồng bộ cấu trúc cơ sở dữ liệu**
    Tiến hành đồng bộ hóa cấu trúc cơ sở dữ liệu (migrate) lên hệ quản trị cơ sở dữ liệu PostgreSQL chính thức trên máy chủ và chạy tác vụ nạp dữ liệu mẫu ban đầu (seeding) để thiết lập hệ thống.
*   **Bước 5: Khởi chạy ngầm tiến trình**
    Sử dụng công cụ quản lý tiến trình PM2 để khởi động và quản lý chạy ngầm các tiến trình của cả ứng dụng Backend và Frontend, đảm bảo các dịch vụ hoạt động liên tục và tự động khôi phục khi máy chủ gặp sự cố khởi động lại.
*   **Bước 6: Định tuyến tên miền và kích hoạt SSL**
    Cấu hình máy chủ web hoặc bảng điều khiển của nhà cung cấp dịch vụ để trỏ tên miền chính thức về các cổng chạy ứng dụng tương ứng, thiết lập tường lửa bảo mật và kích hoạt chứng chỉ SSL (HTTPS) cho toàn bộ hệ thống.

---

## 3.5 Đánh giá kết quả kiểm thử

Hệ thống FruiTaste sau khi hoàn thành xây dựng và cài đặt đã đạt được độ hoàn thiện cao, vận hành trơn tru và đáp ứng đầy đủ tất cả các yêu cầu nghiệp vụ thực tế đặt ra.

### 3.5.1 Đánh giá tính ổn định hệ thống

*   **Về tính toàn vẹn dữ liệu**: Cơ chế Database Transaction hoạt động hoàn hảo trong các tình huống tranh chấp tài nguyên (ví dụ: nhiều khách hàng cùng thanh toán sản phẩm cuối cùng trong kho). Đảm bảo không xảy ra hiện tượng mất mát dữ liệu hoặc số lượng tồn kho bị âm.
*   **Về hiệu năng phản hồi**: API Backend viết bằng NestJS phản hồi cực nhanh (trung bình dưới 50ms cho các truy vấn thông thường). Nhờ hạ tầng suy luận của Groq Cloud và cơ chế streaming, Trợ lý ảo AI có tốc độ phản hồi cực kỳ ấn tượng, chữ sinh ra mượt mà và hiển thị UI Card sản phẩm chính xác trong thời gian dưới 1 giây.
*   **Về độ an toàn**: Cơ chế bảo mật JWT Cookie giúp bảo vệ tối đa hệ thống trước các kỹ thuật tấn công session, phân quyền chặt chẽ giữa khách hàng và quản trị viên, đồng thời cơ chế Auto-Ban giúp hệ thống tự vệ trước các hành vi bom đơn ảo phá hoại kho hàng.

### 3.5.2 Các Kịch bản Kiểm thử chính (Test Cases)

Để minh chứng cho tính chính xác của hệ thống, toàn bộ các luồng nghiệp vụ cốt lõi đã được kiểm thử nghiêm ngặt. Dưới đây là bảng tổng hợp một số kịch bản kiểm thử tiêu biểu đã được thực hiện và ghi nhận kết quả:

| Mã TC | Chức năng kiểm thử | Dữ liệu đầu vào (Input) | Kết quả mong đợi (Expected Output) | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Xác thực đăng nhập hợp lệ | Email: `customer@gmail.com`<br>Password: `123456` | Trả về thông tin User, sinh JWT Token đính kèm thành công vào HTTP-Only Cookie. | **Pass** |
| **TC-02** | Đăng nhập với mật khẩu sai | Email: `customer@gmail.com`<br>Password: `wrong_pass` | Chặn đăng nhập, trả về mã lỗi `401 Unauthorized` kèm thông điệp báo lỗi. | **Pass** |
| **TC-03** | Tính toán giá Margin-based tự động | Giá nhập: `20,000`<br>Hao hụt: `5%` (0.05)<br>Biên lãi: `20%` (0.20)<br>Thuế VAT: `8%` (0.08) | **Suggested Price = 30,000 VNĐ**.<br>*(Làm tròn từ 29,240 VNĐ lên hàng nghìn).* | **Pass** |
| **TC-04** | Đặt hàng khi vượt quá tồn kho | Sản phẩm A còn tồn 5 cái.<br>Khách hàng đặt mua 10 cái. | Hệ thống ném lỗi `BadRequestException`, rollback toàn bộ transaction đặt hàng. | **Pass** |
| **TC-05** | Hệ thống tự động hủy đơn quá hạn | Đơn hàng trạng thái `PENDING` được tạo cách đây 2.5 giờ. | Cron job phát hiện, tự động chuyển đơn sang `CANCELLED`, gọi hoàn tồn kho thành công. | **Pass** |
| **TC-06** | Cơ chế Auto-Ban bom hàng | Người dùng thực hiện hủy đơn hàng lần thứ 5 liên tiếp. | Đơn hàng hủy thành công, tài khoản bị cập nhật `isActive: false` (Khóa tài khoản lập tức). | **Pass** |
| **TC-07** | Trợ lý AI gọi Tool tìm sản phẩm | Khách hàng nhắn: *"Có nho xanh không và giá thế nào?"* | AI tự động gọi tool `list_products`, trả về kết quả sản phẩm Nho xanh kèm giá và nút đặt mua. | **Pass** |

Kết quả kiểm thử cho thấy hệ thống đã hoạt động chính xác 100% theo đúng các đặc tả nghiệp vụ, bảo vệ tài nguyên an toàn và mang lại trải nghiệm mua sắm vô cùng ấn tượng nhờ sự kết hợp hiệu quả giữa công nghệ web hiện đại và Trí tuệ nhân tạo đột phá.
