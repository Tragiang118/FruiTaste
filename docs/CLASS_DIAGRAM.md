# BIỂU ĐỒ LỚP CHI TIẾT HỆ THỐNG FRUITASTE (UML CLASS DIAGRAM)

Tài liệu này chứa biểu đồ lớp (Class Diagram) chi tiết của hệ thống FruiTaste, được vẽ lại dựa trên cấu trúc các thực thể dữ liệu thực tế trong mã nguồn dự án (Prisma Schema). Biểu đồ sử dụng các ký hiệu chuẩn UML để biểu diễn mối quan hệ giữa các lớp theo đúng tinh thần học thuật và thực tiễn phát triển.

---

## 1. Quy chuẩn Ký hiệu Mối quan hệ UML sử dụng

Dựa trên cấu trúc quan hệ thực tế của các thực thể và ràng buộc toàn vẹn cơ sở dữ liệu (Database Integrity & Cascade Rules), chúng tôi áp dụng các ký hiệu liên kết chuẩn UML như sau:

| Ký hiệu UML | Tên mối quan hệ | Mô tả áp dụng trong hệ thống | Ký hiệu Mermaid |
| :---: | :--- | :--- | :---: |
| `───` | **Association (Liên kết)** | Kết nối giữa hai thực thể độc lập về vòng đời nhưng có tham chiếu dữ liệu đến nhau (ví dụ: một Chi tiết đơn hàng tham chiếu tới một Sản phẩm). | `--` |
| `◆───` | **Composition (Thuộc về hoàn toàn)** | Quan hệ sở hữu mạnh mẽ, phần con là một phần không thể tách rời và phụ thuộc hoàn toàn vào vòng đời của phần cha. Nếu cha bị xóa, con sẽ bị xóa theo (ràng buộc `onDelete: Cascade`). | `*--` |
| `◇───` | **Aggregation (Thu tụ/Thu gom)** | Quan hệ thu gom yếu, phần con có thể tồn tại độc lập với phần cha (ràng buộc `onDelete: SetNull` hoặc liên kết yếu). | `o--` |
| `- - - >` | **Dependency (Phụ thuộc)** | Một thực thể sử dụng thông tin, hàm hoặc cấu hình từ thực thể khác nhưng không lưu trữ trực tiếp dưới dạng trường quan hệ sở hữu. | `<..` |

---

## 2. Biểu đồ lớp hệ thống (Mermaid)

Dưới đây là mã nguồn và sơ đồ lớp chi tiết của hệ thống FruiTaste. Quá trình hiển thị biểu đồ được vẽ động trực tiếp thông qua thư viện Mermaid.

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

---

## 3. Ràng buộc & Giải thích nghiệp vụ quan hệ

### 3.3.1 Các quan hệ Thuộc về (Composition) tiêu biểu
1.  **User ➔ Address & Cart**: Mỗi địa chỉ nhận hàng (`Address`) và giỏ hàng (`Cart`) được định danh và gắn chặt với tài khoản người dùng (`User`). Khi xóa một tài khoản, toàn bộ địa chỉ và giỏ hàng tương ứng sẽ bị xóa sạch khỏi hệ thống.
2.  **Order ➔ OrderItem & Payment**: Một đơn hàng (`Order`) cấu thành từ danh sách chi tiết hàng hóa (`OrderItem`) và một yêu cầu thanh toán (`Payment`). Không thể tồn tại một chi tiết đơn hàng hay một thông tin thanh toán mồ côi nếu đơn hàng chính bị hủy bỏ về mặt cơ sở dữ liệu.
3.  **Product ➔ Inventory & ProductPricing**: Kho chứa (`Inventory`) và Cấu hình giá bán (`ProductPricing`) sử dụng trực tiếp ID của sản phẩm làm khóa chính độc lập. Điều này thể hiện Product đóng vai trò quản lý trực tiếp vòng đời của hai thực thể phụ thuộc này.

### 3.3.2 Các quan hệ Liên kết (Association)
1.  **User ➔ Order**: Liên kết giữa người dùng và đơn hàng. Dù tài khoản bị ẩn/xóa mềm (`isDeleted` hoặc `isActive = false`), thông tin đơn hàng (`Order`) vẫn cần được lưu giữ nguyên vẹn trong hệ thống cho mục đích đối soát tài chính của quản trị viên, do đó đây là liên kết thông thường chứ không phải Composition.
2.  **Category ➔ Product**: Mối quan hệ nhiều - nhiều (`n - m`). Một sản phẩm có thể nằm trong nhiều danh mục khác nhau (ví dụ: vừa thuộc danh mục *Trái cây nhập khẩu* vừa thuộc danh mục *Sản phẩm bán chạy*) và một danh mục chứa nhiều sản phẩm.

### 3.3.3 Quan hệ Phụ thuộc (Dependency)
*   **ProductPricing ➔ PricingConfig**: Lớp quản lý định giá sản phẩm (`ProductPricing`) chứa phương thức `calculatePrice()` để tính toán đề xuất giá bán tự động. Quá trình tính toán này cần tham chiếu đến các thông số thuế VAT mặc định và biên lợi nhuận sàn được lưu trữ trong lớp cấu hình chung `PricingConfig`. Đây là quan hệ phụ thuộc cấu hình (Dependency), được biểu diễn bằng mũi tên nét đứt hướng về phía `PricingConfig`.
