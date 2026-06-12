import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  // ==================== 1. USERS & ADDRESSES ====================
  console.log('\n🧑‍💼 Bắt đầu seed Người dùng (Users)...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fruitaste.vn' },
    update: {},
    create: {
      email: 'admin@fruitaste.vn',
      password: hashedPassword,
      fullName: 'Quản Trị Viên',
      phone: '0901111111',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'nguyen.van.an@gmail.com' },
    update: {},
    create: {
      email: 'nguyen.van.an@gmail.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn An',
      phone: '0912345678',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'tran.thi.bich@gmail.com' },
    update: {},
    create: {
      email: 'tran.thi.bich@gmail.com',
      password: hashedPassword,
      fullName: 'Trần Thị Bích',
      phone: '0923456789',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'le.minh.duc@gmail.com' },
    update: {},
    create: {
      email: 'le.minh.duc@gmail.com',
      password: hashedPassword,
      fullName: 'Lê Minh Đức',
      phone: '0934567890',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'pham.thi.huong@gmail.com' },
    update: {},
    create: {
      email: 'pham.thi.huong@gmail.com',
      password: hashedPassword,
      fullName: 'Phạm Thị Hương',
      phone: '0945678901',
      role: 'USER',
      isEmailVerified: true,
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'hoang.van.khai@gmail.com' },
    update: {},
    create: {
      email: 'hoang.van.khai@gmail.com',
      password: hashedPassword,
      fullName: 'Hoàng Văn Khải',
      phone: '0956789012',
      role: 'USER',
      isEmailVerified: false,
    },
  });

  console.log(`  ✅ Đã tạo ${6} người dùng (1 admin + 5 khách hàng)`);

  // Tạo địa chỉ cho từng user (nếu chưa có)
  const userAddressData = [
    {
      userId: user1.id,
      addresses: [
        {
          recipientName: 'Nguyễn Văn An',
          phone: '0912345678',
          fullAddress: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
        {
          recipientName: 'Nguyễn Văn An (Cơ quan)',
          phone: '0912345678',
          fullAddress: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          isDefault: false,
        },
      ],
    },
    {
      userId: user2.id,
      addresses: [
        {
          recipientName: 'Trần Thị Bích',
          phone: '0923456789',
          fullAddress: '789 Đường Cách Mạng Tháng 8, Phường 15, Quận 10, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ],
    },
    {
      userId: user3.id,
      addresses: [
        {
          recipientName: 'Lê Minh Đức',
          phone: '0934567890',
          fullAddress: '12 Đường Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ],
    },
    {
      userId: user4.id,
      addresses: [
        {
          recipientName: 'Phạm Thị Hương',
          phone: '0945678901',
          fullAddress: '45 Đường Đinh Tiên Hoàng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
          isDefault: true,
        },
        {
          recipientName: 'Phạm Thị Hương (Nhà riêng)',
          phone: '0945678901',
          fullAddress: '88 Đường Võ Thị Sáu, Phường 7, Quận 3, TP. Hồ Chí Minh',
          isDefault: false,
        },
      ],
    },
    {
      userId: user5.id,
      addresses: [
        {
          recipientName: 'Hoàng Văn Khải',
          phone: '0956789012',
          fullAddress: '67 Đường Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh',
          isDefault: true,
        },
      ],
    },
  ];

  for (const userData of userAddressData) {
    const existing = await prisma.address.findFirst({ where: { userId: userData.userId } });
    if (!existing) {
      await prisma.address.createMany({ data: userData.addresses.map(a => ({ ...a, userId: userData.userId })) });
    }
  }
  console.log('  ✅ Đã tạo địa chỉ cho người dùng');

  // ==================== 2. CATEGORIES ====================
  console.log('\n🏷️  Bắt đầu seed Danh mục (Categories)...');

  const specialRegion = await prisma.category.upsert({
    where: { name: 'Đặc sản vùng miền' },
    update: {},
    create: {
      name: 'Đặc sản vùng miền',
      description: 'Các loại trái cây đặc sản tươi ngon nức tiếng từ các vùng miền trên khắp cả nước Việt Nam, mang đậm hương vị quê hương và bản sắc địa phương.',
    },
  });

  const tropical = await prisma.category.upsert({
    where: { name: 'Trái cây nhiệt đới' },
    update: {},
    create: {
      name: 'Trái cây nhiệt đới',
      description: 'Trái cây đặc trưng của khí hậu nhiệt đới nóng ẩm, dồi dào vitamin, khoáng chất và hương vị thơm ngọt đậm đà, thường có quanh năm và rất phổ biến trong ẩm thực Việt Nam.',
    },
  });

  const imported = await prisma.category.upsert({
    where: { name: 'Trái cây nhập khẩu' },
    update: {},
    create: {
      name: 'Trái cây nhập khẩu',
      description: 'Trái cây cao cấp nhập khẩu chính ngạch từ các quốc gia ôn đới và các nông trại đạt tiêu chuẩn GlobalGAP, organic quốc tế. Đảm bảo nguồn gốc rõ ràng, chất lượng cao và an toàn tuyệt đối.',
    },
  });

  const categoryMap: { [key: string]: number } = {
    'Đặc sản vùng miền': specialRegion.id,
    'Trái cây nhiệt đới': tropical.id,
    'Trái cây nhập khẩu': imported.id,
  };

  console.log('  ✅ Đã tạo 3 danh mục');

  // ==================== 3. PRODUCTS ====================
  console.log('\n🍎 Bắt đầu seed 30 Sản phẩm trái cây...');

  const fruits = [
    {
      name: 'Táo Fuji Nhật Bản',
      price: 45000,
      stockQuantity: 150,
      description: 'Táo Fuji Nhật Bản được trồng và chăm sóc tỉ mỉ tại vùng Aomori nổi tiếng. Quả táo tròn đều, vỏ đỏ hồng tự nhiên, thịt táo giòn ngọt, mọng nước và có hương thơm đặc trưng rất dễ chịu. Đây là loại táo cao cấp thường được chọn làm quà biếu tặng sang trọng.',
      healthInfo: 'Táo chứa nhiều chất xơ hòa tan pectin giúp hỗ trợ hệ tiêu hóa và ổn định đường huyết. Ngoài ra, hàm lượng vitamin C và chất chống oxy hóa dồi dào trong quả táo giúp cải thiện làn da, tăng cường hệ miễn dịch và bảo vệ tim mạch hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu'],
      costPrice: 32000,
    },
    {
      name: 'Chuối Tiêu Việt Nam',
      price: 18000,
      stockQuantity: 200,
      description: 'Chuối tiêu Việt Nam chín tự nhiên có màu vàng tươi, cơm chuối mềm dẻo, ngọt đậm đà và có mùi thơm nồng nàn đặc trưng. Sản phẩm được thu hoạch trực tiếp từ các nhà vườn đạt chuẩn, không chất bảo quản, tuyệt đối an toàn cho sức khỏe.',
      healthInfo: 'Chuối tiêu là nguồn cung cấp Kali tuyệt vời giúp điều hòa huyết áp và hỗ trợ cơ bắp. Quả cũng rất giàu vitamin B6, sắt và carbohydrate tự nhiên, giúp bổ sung năng lượng nhanh chóng, rất phù hợp cho người tập thể thao và học tập căng thẳng.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1571501478200-85fbd29c36ac?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 10000,
    },
    {
      name: 'Dâu Tây Đà Lạt',
      price: 65000,
      stockQuantity: 80,
      description: 'Dâu tây Đà Lạt được trồng tại các trang trại thủy canh công nghệ cao. Quả dâu chín đỏ mọng, hình tim đẹp mắt, thịt quả mềm, mọng nước với vị chua ngọt hài hòa và hương thơm thanh mát đặc trưng của vùng cao nguyên đất đỏ.',
      healthInfo: 'Dâu tây là siêu thực phẩm chứa lượng vitamin C cực lớn, hỗ trợ chống lão hóa da và tăng cường sản sinh collagen. Chất chống oxy hóa anthocyanin có trong quả dâu còn giúp bảo vệ mạch máu và cải thiện chức năng não bộ.',
      unit: 'hộp',
      images: ['https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 45000,
    },
    {
      name: 'Xoài Cát Hòa Lộc',
      price: 55000,
      stockQuantity: 120,
      description: 'Xoài cát Hòa Lộc là loại xoài ngon nổi tiếng bậc nhất miền Tây Nam Bộ. Quả xoài có hình thuôn dài, khi chín vỏ màu vàng chanh, thịt quả màu vàng tươi, ít xơ, cấu trúc dẻo mịn và vị ngọt thanh đậm đà cùng hương thơm ngào ngạt khó quên.',
      healthInfo: 'Xoài cát giàu vitamin A rất tốt cho thị lực, ngăn ngừa khô mắt và quáng gà. Hàm lượng chất xơ dồi dào cùng các enzyme tiêu hóa tự nhiên trong quả xoài giúp hệ đường ruột luôn khỏe mạnh và ngăn ngừa táo bón.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1553279768-865429fd81ce?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 38000,
    },
    {
      name: 'Cam Sành Vĩnh Long',
      price: 35000,
      stockQuantity: 180,
      description: 'Cam sành Vĩnh Long nổi tiếng với lớp vỏ sần sùi, màu xanh đậm đặc trưng. Bên trong là các tép cam màu vàng cam mọng nước, vị chua ngọt đậm đà và rất thơm. Cam sành cực kỳ thích hợp để vắt nước uống giải nhiệt hàng ngày.',
      healthInfo: 'Cung cấp lượng lớn Vitamin C tự nhiên giúp cơ thể tăng cường sức đề kháng, chống lại các tác nhân gây cảm cúm và viêm họng. Chất xơ trong quả cam sành còn giúp giảm lượng cholesterol xấu trong máu và làm đẹp da.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 22000,
    },
    {
      name: 'Dưa Hấu Sài Gòn',
      price: 28000,
      stockQuantity: 60,
      description: 'Dưa hấu vỏ xanh đậm bóng bẩy, hình dáng thuôn dài đẹp mắt. Ruột dưa đỏ tươi, ít hạt, thịt cát giòn xốp và ngọt lịm. Đây là thức quả giải nhiệt lý tưởng trong những ngày hè oi bức hoặc làm nước ép thanh lọc cơ thể.',
      healthInfo: 'Dưa hấu chứa hơn 90% nước cùng hợp chất lycopene mạnh mẽ giúp chống ung thư và bảo vệ tim mạch. Chất citrulline trong dưa hấu giúp giảm đau nhức cơ bắp sau khi vận động mạnh và kích thích tuần hoàn máu.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1587049352851-8d4e8e16ea77?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới'],
      costPrice: 18000,
    },
    {
      name: 'Nho Xanh Mỹ',
      price: 220000,
      stockQuantity: 50,
      description: 'Nho xanh nhập khẩu trực tiếp từ các trang trại hiện đại của Mỹ. Quả nho thuôn dài, màu xanh hổ phách đẹp mắt, không hạt, vỏ mỏng dai, thịt quả cực kỳ giòn và có vị ngọt thanh khiết rất dễ chịu.',
      healthInfo: 'Nho xanh chứa chất resveratrol chống oxy hóa mạnh mẽ giúp ngăn ngừa sự lão hóa của tế bào và bảo vệ thành mạch máu. Nó còn cung cấp các khoáng chất như đồng, sắt và mangan hỗ trợ tái tạo máu và bảo vệ xương.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu'],
      costPrice: 160000,
    },
    {
      name: 'Bơ Sáp Đắk Lắk',
      price: 40000,
      stockQuantity: 90,
      description: 'Bơ sáp Đắk Lắk được chọn lọc kỹ càng, quả bơ già da bóng lấm tấm vàng. Khi chín bơ có ruột vàng ươm như mỡ gà, thịt bơ dẻo quánh, béo ngậy đặc trưng và không hề bị xơ hay đắng, rất thích hợp làm sinh tố hoặc salad.',
      healthInfo: 'Bơ chứa chất béo không bão hòa đơn lành mạnh tốt cho hệ tim mạch và giảm mỡ máu. Đây cũng là loại quả giàu chất chống oxy hóa lutein tốt cho mắt, cùng vitamin E bảo vệ làn da khỏe đẹp, căng tràn sức sống.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 27000,
    },
    {
      name: 'Thanh Long Ruột Đỏ',
      price: 38000,
      stockQuantity: 100,
      description: 'Thanh long ruột đỏ Long An có quả tròn trịa, vỏ màu hồng đậm bóng bẩy. Phần ruột bên trong màu đỏ tím bắt mắt, mọng nước, vị ngọt thanh đậm hơn hẳn thanh long ruột trắng truyền thống và chứa nhiều hạt nhỏ li ti.',
      healthInfo: 'Màu đỏ tím của thanh long ruột đỏ chứa betalain - một chất chống oxy hóa mạnh giúp ngăn ngừa ung thư và bảo vệ gan. Hàm lượng sắt dồi dào trong quả giúp hỗ trợ điều trị thiếu máu và nâng cao hệ miễn dịch.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1629166085697-7f99ff9d63f9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 25000,
    },
    {
      name: 'Kiwi New Zealand',
      price: 85000,
      stockQuantity: 70,
      description: 'Kiwi nhập khẩu từ New Zealand nổi tiếng toàn cầu. Quả kiwi có lớp vỏ mỏng phủ lông mịn, thịt quả màu xanh ngọc hoặc vàng óng, vị chua ngọt hài hòa tinh tế rất ngon miệng và mát lạnh.',
      healthInfo: 'Kiwi là vua vitamin C, một quả chứa nhiều vitamin C hơn cả hai quả cam. Kiwi cũng chứa chất actinidin hỗ trợ tiêu hóa chất đạm dễ dàng hơn và nhiều chất xơ giúp ngăn ngừa các bệnh về đường tiêu hóa.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1585059895524-72359fa0f07b?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu'],
      costPrice: 60000,
    },
    {
      name: 'Dứa Cayen Tiền Giang',
      price: 25000,
      stockQuantity: 130,
      description: 'Dứa Cayen Tiền Giang trái to tròn, mắt dứa nông và thưa. Khi chín quả có màu vàng tươi đẹp mắt, thịt dứa nhiều nước, vị ngọt lịm đậm đà và đặc biệt rất ít rát lưỡi so với các giống dứa thường.',
      healthInfo: 'Dứa chứa enzyme bromelain đặc biệt giúp kháng viêm, giảm sưng và hỗ trợ chữa lành vết thương hiệu quả. Ngoài ra, dứa còn rất tốt cho xương khớp nhờ chứa hàm lượng mangan thiết yếu dồi dào.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 15000,
    },
    {
      name: 'Mãng Cầu Xiêm Tây Ninh',
      price: 48000,
      stockQuantity: 40,
      description: 'Mãng cầu xiêm Tây Ninh quả to, gai mềm. Thịt quả màu trắng sữa dẻo dai, nhiều nước, vị chua chua ngọt ngọt rất kích thích vị giác. Thường được xay sinh tố với sữa hoặc làm mứt rất ngon.',
      healthInfo: 'Mãng cầu xiêm giàu vitamin C, vitamin B1 và B2 giúp cải thiện quá trình trao đổi chất. Nhiều nghiên cứu cũng chỉ ra chiết xuất từ quả và lá mãng cầu xiêm có tác dụng hỗ trợ kháng viêm, tăng cường sức khỏe tế bào.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1627995166299-4c8d57dcd5ea?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 32000,
    },
    {
      name: 'Măng Cụt Lái Thiêu',
      price: 60000,
      stockQuantity: 100,
      description: 'Măng cụt đặc sản Lái Thiêu vỏ màu tím thẫm mỏng mềm, dễ bóc. Bên trong là các múi trắng muốt như hoa tuyết, vị chua ngọt thanh khiết quyến rũ được mệnh danh là nữ hoàng trái cây miền nhiệt đới.',
      healthInfo: 'Măng cụt chứa hợp chất xanthone quý giá có đặc tính kháng viêm, chống virus và ngăn ngừa lão hóa tế bào cực kỳ hiệu quả. Măng cụt còn giúp kiểm soát cân nặng tốt nhờ lượng calo thấp và nhiều nước.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1601490216654-e0b4f85e49c7?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 42000,
    },
    {
      name: 'Chôm Chôm Nhãn',
      price: 32000,
      stockQuantity: 150,
      description: 'Chôm chôm nhãn quả nhỏ, râu ngắn và hơi khô. Vỏ chôm chôm màu vàng đỏ, cơm bên trong màu trắng đục, ráo nước, giòn rụm và tróc hạt hoàn toàn, mang vị ngọt đậm đà như mật ong.',
      healthInfo: 'Chôm chôm cung cấp hàm lượng đồng dồi dào hỗ thể sản sinh hồng cầu và duy trì hệ thần kinh khỏe mạnh. Lượng canxi và phốt pho trong cơm chôm chôm cũng giúp củng cố răng và xương vững chắc.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1593444005893-ba588647acae?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 20000,
    },
    {
      name: 'Sầu Riêng Ri6',
      price: 160000,
      stockQuantity: 50,
      description: 'Sầu Riêng Ri6 cơm vàng hạt lép trứ danh miền Tây. Quả sầu riêng gai đều, múi sầu riêng vàng ươm bắt mắt, cơm cực dày dẻo mịn, béo ngậy ngọt lịm với mùi hương nồng nàn quyến rũ đặc trưng.',
      healthInfo: 'Sầu riêng là loại trái cây giàu calo và chất dinh dưỡng, cung cấp nguồn năng lượng dồi dào ngay tức thì. Sầu riêng cũng chứa chất chống oxy hóa tự nhiên và chất xơ giúp cải thiện giấc ngủ nhờ chứa axit amin tryptophan.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1536709861618-ff3fc3e0d866?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 110000,
    },
    {
      name: 'Vú Sữa Lò Rèn',
      price: 45000,
      stockQuantity: 80,
      description: 'Vú sữa Lò Rèn Vĩnh Kim nổi tiếng quả tròn căng, vỏ mỏng màu xanh trắng khi chín ngả hồng. Ruột quả trắng đục chứa dòng nước sữa ngọt lịm, thơm ngậy mát lành như sữa mẹ.',
      healthInfo: 'Vú sữa chứa lượng canxi và phốt pho dồi dào tốt cho xương khớp và răng, đặc biệt thích hợp cho trẻ em và phụ nữ mang thai. Lượng nước và vitamin phong phú trong quả giúp giải nhiệt nhanh chóng và làm dịu cơn khát.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1616851608404-58e136371cb1?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 30000,
    },
    {
      name: 'Na Chi Lăng',
      price: 48000,
      stockQuantity: 90,
      description: 'Na Chi Lăng Lạng Sơn quả to tròn, mắt na căng mọng vỏ mỏng. Thịt na màu trắng ngà, dai dẻo ngọt đậm đà, ít hạt và có hương thơm thanh mát đặc trưng của vùng núi đá vôi.',
      healthInfo: 'Quả na rất giàu Vitamin B6 giúp hỗ trợ giảm stress và điều hòa tâm trạng. Na cũng chứa các chất chống oxy hóa tự nhiên giúp bảo vệ tim mạch, ngăn ngừa các bệnh viêm nhiễm và làm sáng da hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596700684078-43d9642caed9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 32000,
    },
    {
      name: 'Quýt Hồng Lai Vung',
      price: 35000,
      stockQuantity: 200,
      description: 'Quýt hồng Lai Vung Đồng Tháp nổi tiếng vỏ mỏng màu vàng cam rực rỡ óng ả. Múi quýt mọng nước, vị chua ngọt thanh tao đậm đà cùng mùi thơm tinh dầu quýt dễ chịu sảng khoái.',
      healthInfo: 'Quýt hồng chứa nhiều vitamin A và C tốt cho thị lực và làm sáng da. Vỏ quýt có chứa nhiều chất limonene giúp giảm ho, hỗ trợ tiêu đờm và tinh dầu quýt giúp giải tỏa căng thẳng thần kinh hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1582283088210-911e3bce5557?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 22000,
    },
    {
      name: 'Ổi Nữ Hoàng',
      price: 25000,
      stockQuantity: 300,
      description: 'Ổi Nữ Hoàng trái to tròn đều, vỏ ngoài hơi sần nhẹ màu xanh nhạt. Thịt ổi màu trắng tinh khiết, dày cùi, cực kỳ giòn ngọt và đặc biệt rất ít hạt, ăn kèm muối ớt siêu ngon.',
      healthInfo: 'Ổi là một trong những quả giàu Vitamin C nhất (gấp 4 lần cam), giúp tăng đề kháng tuyệt vời. Ổi cũng giàu chất xơ hòa tan tốt cho tiêu hóa, giúp duy trì vóc dáng thon gọn và ổn định huyết áp.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1601646761285-65bfa67cd7a3?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới'],
      costPrice: 15000,
    },
    {
      name: 'Mít Tố Nữ',
      price: 42000,
      stockQuantity: 60,
      description: 'Mít tố nữ miền Tây quả nhỏ thuôn dài. Khi chín xẻ dọc vỏ có thể nhấc nguyên cuống mít với các múi mít tròn căng màu vàng ươm bám chặt, cơm mít dẻo thơm ngào ngạt ngòn ngọt.',
      healthInfo: 'Mít tố nữ chứa đường tự nhiên dễ hấp thụ cung cấp năng lượng nhanh chóng cho cơ thể. Mít cũng chứa nhiều vitamin A giúp bổ mắt và canxi hỗ trợ hệ xương khớp luôn khỏe mạnh và dẻo dai.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1550828520-4cb496926fc9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 28000,
    },
    {
      name: 'Bưởi Da Xanh',
      price: 110000,
      stockQuantity: 50,
      description: 'Bưởi Da Xanh đặc sản Bến Tre vỏ xanh mỏng bóng bẩy. Múi bưởi màu hồng tươi mọng nước, tôm bưởi ráo và dễ tách, vị ngọt thanh mát đậm đà không bị chua đắng.',
      healthInfo: 'Bưởi da xanh là thực phẩm vàng cho chế độ ăn kiêng nhờ chứa enzyme đốt cháy chất béo và kiểm soát cân nặng. Bưởi cũng chứa nhiều lycopene chống oxy hóa mạnh và hỗ trợ giảm cholesterol trong máu.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1596752003738-4221199a03cf?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 75000,
    },
    {
      name: 'Quả Roi',
      price: 50000,
      stockQuantity: 100,
      description: 'Quả roi (quả mận miền Nam) màu đỏ mọng bóng loáng, quả hình chuông cân đối. Thịt roi màu trắng tinh khôi, giòn xốp, nhiều nước vị ngọt mát dễ chịu cực kỳ thanh nhiệt.',
      healthInfo: 'Quả roi có hàm lượng nước cực kỳ cao (trên 90%) giúp bù nước và làm mát cơ thể tức thì. Nó chứa nhiều vitamin C và chất xơ hỗ trợ hệ tiêu hóa hoạt động nhịp nhàng và ngăn ngừa lão hóa.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới'],
      costPrice: 33000,
    },
    {
      name: 'Dưa Vàng',
      price: 60000,
      stockQuantity: 10,
      description: 'Dưa vàng tròn tria, vỏ mịn màng màu vàng óng bắt mắt. Ruột dưa vàng nhạt, mọng nước, vị ngọt lịm sâu lắng cùng hương thơm nhẹ nhàng quyến rũ dâng tràn khi cắt.',
      healthInfo: 'Dưa vàng chứa lượng lớn beta-carotene (tiền chất vitamin A) giúp đôi mắt sáng khỏe và ngăn ngừa lão hóa da. Hàm lượng kali dồi dào hỗ trợ hoạt động của tim mạch và ổn định đường huyết.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1598030304671-5aa1d6f21226?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới'],
      costPrice: 42000,
    },
    {
      name: 'Dưa Lưới',
      price: 60000,
      stockQuantity: 10,
      description: 'Dưa lưới vỏ xanh xám phủ các đường gân nổi đẹp như lưới dệt. Thịt dưa màu cam vàng bắt mắt, giòn ngọt sắc sảo, mọng nước và có mùi thơm nồng nàn sang trọng.',
      healthInfo: 'Dưa lưới rất giàu vitamin C và chất chống oxy hóa zeaxanthin giúp bảo vệ mắt khỏi tác hại của tia cực tím. Đây còn là nguồn cung cấp axit folic tốt hỗ trợ quá trình phát triển tế bào và thai nhi.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1598030349646-6aa8c7d5c765?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới', 'Trái cây nhập khẩu'],
      costPrice: 42000,
    },
    {
      name: 'Quả Lựu',
      price: 55000,
      stockQuantity: 150,
      description: 'Quả lựu vỏ đỏ hồng đẹp mắt. Bên trong chứa hàng trăm hạt lựu nhỏ lấp lánh như hồng ngọc, mọng nước màu đỏ tươi, vị ngọt thanh mát pha chút chua nhẹ tinh tế.',
      healthInfo: 'Lựu chứa chất chống oxy hóa punicalagin cực mạnh (gấp 3 lần trà xanh) giúp bảo vệ tim mạch, giảm xơ vữa động mạch và kháng viêm. Lựu cũng hỗ trợ lưu thông máu và làm đẹp da vượt trội.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1565293627255-a0ed8df359cb?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu'],
      costPrice: 38000,
    },
    {
      name: 'Mận Hà Nội',
      price: 45000,
      stockQuantity: 100,
      description: 'Mận Hà Nội (Mận hậu Bắc Hà) chín vỏ đỏ tía phủ lớp phấn trắng tự nhiên. Thịt quả màu đỏ sẫm giòn tan, mọng nước chua ngọt đậm đà khó cưỡng khi chấm muối ớt.',
      healthInfo: 'Mận chứa nhiều vitamin C, chất chống oxy hóa tự nhiên và chất sắt hỗ trợ hệ tuần hoàn và tăng đề kháng. Chất sorbitol tự nhiên trong quả mận còn hỗ trợ nhuận tràng và ngăn táo bón.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1628178121659-1ec8b98161ca?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 30000,
    },
    {
      name: 'Hồng Giòn Đà Lạt',
      price: 45000,
      stockQuantity: 90,
      description: 'Hồng giòn Đà Lạt vỏ màu vàng cam mịn màng quả tròn hơi dẹt. Thịt hồng màu vàng tươi, giòn rau ráu, vị ngọt lịm không hề chát nhờ được ủ hơi tự nhiên đúng kỹ thuật.',
      healthInfo: 'Hồng chứa nhiều vitamin A tốt cho mắt và vitamin C tăng cường hệ miễn dịch. Chất shibuol và axit tannic trong hồng có tác dụng hỗ trợ hạ huyết áp và bảo vệ đường ruột luôn khỏe mạnh.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596700684078-43d9642caed9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 30000,
    },
    {
      name: 'Đào Sa Pa',
      price: 38000,
      stockQuantity: 110,
      description: 'Đào Sa Pa nổi tiếng quả nhỏ xinh phủ lông tơ mịn màng, vỏ màu xanh ngà ngả má hồng rực rỡ. Thịt đào giòn, vị chua ngọt hài hòa thanh khiết đậm chất núi rừng Tây Bắc.',
      healthInfo: 'Đào chứa nhiều vitamin C, kali và chất xơ lành mạnh hỗ trợ hệ tim mạch hoạt động tốt. Các hợp chất phenolic trong quả đào có tác dụng chống oxy hóa mạnh giúp ngăn ngừa béo phì và các bệnh liên quan.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1595124253363-c59659b19350?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 25000,
    },
    {
      name: 'Lê Đường Lạng Sơn',
      price: 42000,
      stockQuantity: 120,
      description: 'Lê đường Lạng Sơn quả tròn đều vỏ mỏng màu vàng xanh lấm tấm. Thịt lê trắng tinh khiết, nhiều nước, cực kỳ giòn ngọt mát dịu giúp giải nhiệt tuyệt vời.',
      healthInfo: 'Lê có tính mát, vị ngọt thanh giúp thanh phế, tiêu đờm và giảm ho hiệu quả. Hàm lượng nước cao và chất xơ hòa tan dồi dào trong lê giúp làm dịu đường tiêu hóa và ổn định huyết áp.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1514756331096-242fdeb70f4a?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền'],
      costPrice: 28000,
    },
    {
      name: 'Nhãn Xuồng Tiền Giang',
      price: 52000,
      stockQuantity: 130,
      description: 'Nhãn xuồng Tiền Giang trái to vỏ mỏng màu vàng bò. Cơm nhãn dày cùi dẻo dai, màu vàng ngà óng ả, vị ngọt lịm đậm đà cùng hương thơm quyến rũ khó cưỡng.',
      healthInfo: 'Nhãn chứa nhiều vitamin C và chất chống oxy hóa polyphenol giúp ngăn ngừa tế bào ung thư. Nhãn cũng chứa sắt hỗ trợ tuần hoàn máu và các hợp chất kích thích sản sinh collagen làm đẹp da.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596752003738-4221199a03cf?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới'],
      costPrice: 35000,
    },
  ];

  const productIdMap: { [name: string]: number } = {};

  for (const fruit of fruits) {
    const existing = await prisma.product.findFirst({ where: { name: fruit.name } });
    const categoryConnections = fruit.categoryNames.map(name => ({ id: categoryMap[name] }));

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          price: fruit.price,
          stockQuantity: fruit.stockQuantity,
          description: fruit.description,
          healthInfo: fruit.healthInfo,
          unit: fruit.unit,
          mediaUrls: fruit.images,
          categories: { set: categoryConnections },
        },
      });
      productIdMap[fruit.name] = existing.id;
    } else {
      const created = await prisma.product.create({
        data: {
          name: fruit.name,
          price: fruit.price,
          stockQuantity: fruit.stockQuantity,
          description: fruit.description,
          healthInfo: fruit.healthInfo,
          unit: fruit.unit,
          mediaUrls: fruit.images,
          isActive: true,
          categories: { connect: categoryConnections },
        },
      });
      productIdMap[fruit.name] = created.id;
    }
  }

  console.log(`  ✅ Đã seed ${fruits.length} sản phẩm trái cây`);

  // ==================== 4. INVENTORY & PRICING ====================
  console.log('\n🏭 Bắt đầu seed Kho hàng (Inventory & Pricing)...');

  // Cấu hình định giá mặc định
  await prisma.pricingConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      defaultTaxRate: 0.08,
      defaultProfitMargin: 0.20,
      minProfitMargin: 0.05,
      maxProfitMargin: 1.00,
    },
  });

  // Tạo Inventory và ProductPricing cho từng sản phẩm
  for (const fruit of fruits) {
    const productId = productIdMap[fruit.name];
    if (!productId) continue;

    await prisma.inventory.upsert({
      where: { productId },
      update: { currentStock: fruit.stockQuantity },
      create: {
        productId,
        currentStock: fruit.stockQuantity,
        lowStockThreshold: Math.floor(fruit.stockQuantity * 0.15),
        lastImportDate: new Date(),
      },
    });

    await prisma.productPricing.upsert({
      where: { productId },
      update: { costPrice: fruit.costPrice },
      create: {
        productId,
        costPrice: fruit.costPrice,
        lossRate: 0.05,
        customProfitMargin: null,
        manualPrice: null,
      },
    });
  }

  console.log('  ✅ Đã tạo Inventory và ProductPricing cho tất cả sản phẩm');

  // Tạo Phiếu nhập kho (ImportReceipt)
  const importExistingCount = await prisma.importReceipt.count();
  if (importExistingCount === 0) {
    const import1 = await prisma.importReceipt.create({
      data: {
        supplier: 'HTX Nông sản Đà Lạt',
        totalItems: 3,
        totalCost: 12500000,
        note: 'Nhập hàng trái cây cao nguyên đầu mùa tháng 6',
        items: {
          create: [
            { productId: productIdMap['Dâu Tây Đà Lạt'], quantity: 100, importPrice: 45000 },
            { productId: productIdMap['Hồng Giòn Đà Lạt'], quantity: 120, importPrice: 30000 },
            { productId: productIdMap['Đào Sa Pa'], quantity: 150, importPrice: 25000 },
          ],
        },
      },
    });

    await prisma.importReceipt.create({
      data: {
        supplier: 'Công ty TNHH Trái cây Nhập khẩu Sài Gòn',
        totalItems: 3,
        totalCost: 28000000,
        note: 'Nhập táo Fuji, nho Mỹ, kiwi New Zealand từ lô hàng mới',
        items: {
          create: [
            { productId: productIdMap['Táo Fuji Nhật Bản'], quantity: 200, importPrice: 32000 },
            { productId: productIdMap['Nho Xanh Mỹ'], quantity: 80, importPrice: 160000 },
            { productId: productIdMap['Kiwi New Zealand'], quantity: 100, importPrice: 60000 },
          ],
        },
      },
    });

    await prisma.importReceipt.create({
      data: {
        supplier: 'Vườn trái cây miền Tây Nguyễn Thành',
        totalItems: 4,
        totalCost: 18600000,
        note: 'Nhập hàng trái cây miền Tây theo hợp đồng quý 2',
        items: {
          create: [
            { productId: productIdMap['Xoài Cát Hòa Lộc'], quantity: 150, importPrice: 38000 },
            { productId: productIdMap['Sầu Riêng Ri6'], quantity: 60, importPrice: 110000 },
            { productId: productIdMap['Nhãn Xuồng Tiền Giang'], quantity: 180, importPrice: 35000 },
            { productId: productIdMap['Vú Sữa Lò Rèn'], quantity: 100, importPrice: 30000 },
          ],
        },
      },
    });

    console.log('  ✅ Đã tạo 3 phiếu nhập kho');

    // Tạo phiếu xuất kho (ExportReceipt)
    await prisma.exportReceipt.create({
      data: {
        receiver: 'Siêu thị Big C Quận 1',
        totalItems: 3,
        note: 'Xuất hàng cung cấp cho đối tác siêu thị tháng 6',
        items: {
          create: [
            { productId: productIdMap['Chuối Tiêu Việt Nam'], quantity: 50 },
            { productId: productIdMap['Cam Sành Vĩnh Long'], quantity: 80 },
            { productId: productIdMap['Dứa Cayen Tiền Giang'], quantity: 60 },
          ],
        },
      },
    });

    await prisma.exportReceipt.create({
      data: {
        receiver: 'Nhà hàng Vườn Quê',
        totalItems: 2,
        note: 'Xuất nguyên liệu trái cây cho nhà hàng theo đơn đặt hàng tuần',
        items: {
          create: [
            { productId: productIdMap['Bưởi Da Xanh'], quantity: 20 },
            { productId: productIdMap['Dưa Hấu Sài Gòn'], quantity: 15 },
          ],
        },
      },
    });

    console.log('  ✅ Đã tạo 2 phiếu xuất kho');

    // Tạo StockTransaction mẫu
    const txProducts = [
      { name: 'Táo Fuji Nhật Bản', qty: 200, prev: 0 },
      { name: 'Dâu Tây Đà Lạt', qty: 100, prev: 0 },
      { name: 'Xoài Cát Hòa Lộc', qty: 150, prev: 0 },
      { name: 'Chuối Tiêu Việt Nam', qty: 200, prev: 0 },
      { name: 'Sầu Riêng Ri6', qty: 60, prev: 0 },
    ];
    for (const tx of txProducts) {
      const pid = productIdMap[tx.name];
      if (!pid) continue;
      await prisma.stockTransaction.create({
        data: {
          productId: pid,
          type: 'IMPORT',
          quantity: tx.qty,
          previousStock: tx.prev,
          newStock: tx.qty,
          reason: 'Nhập hàng đầu kỳ',
          referenceId: 'IMPORT-001',
        },
      });
    }
    console.log('  ✅ Đã tạo giao dịch kho mẫu');
  } else {
    console.log('  ⏩ Bỏ qua phiếu kho (đã có dữ liệu)');
  }

  // ==================== 5. RECIPES ====================
  console.log('\n🍽️  Bắt đầu seed Công thức (Recipes)...');

  const recipeCount = await prisma.recipe.count();
  if (recipeCount === 0) {
    const recipesData = [
      {
        name: 'Sinh tố xoài mãng cầu',
        description: 'Sinh tố kết hợp xoài cát Hòa Lộc và mãng cầu xiêm Tây Ninh, mịn màng béo ngậy, đậm vị nhiệt đới. Thức uống bổ dưỡng tuyệt vời cho buổi sáng hay sau khi vận động.',
        prepTime: 10,
        imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Gọt vỏ, bỏ hạt xoài và mãng cầu, cắt thành từng miếng nhỏ vừa.\n2. Cho xoài và mãng cầu vào máy xay sinh tố.\n3. Thêm 200ml sữa tươi không đường và 2-3 viên đá lạnh.\n4. Xay nhuyễn trong khoảng 1-2 phút cho đến khi hỗn hợp mịn hoàn toàn.\n5. Nếm thử và thêm đường hoặc mật ong theo khẩu vị.\n6. Rót ra ly cao, trang trí thêm vài lát xoài mỏng và thưởng thức ngay.`,
        ingredients: [
          { name: 'Xoài Cát Hòa Lộc', qty: '200g', productName: 'Xoài Cát Hòa Lộc' },
          { name: 'Mãng Cầu Xiêm Tây Ninh', qty: '150g', productName: 'Mãng Cầu Xiêm Tây Ninh' },
          { name: 'Sữa tươi không đường', qty: '200ml', productName: null },
          { name: 'Đá lạnh', qty: '3 viên', productName: null },
          { name: 'Mật ong', qty: '1 muỗng canh', productName: null },
        ],
      },
      {
        name: 'Salad trái cây nhiệt đới',
        description: 'Món salad thanh mát từ các loại trái cây nhiệt đới tươi ngon, ướp sốt mật ong chanh thơm phức. Rất thích hợp làm món tráng miệng hay ăn sáng lành mạnh.',
        prepTime: 15,
        imageUrl: 'https://images.unsplash.com/photo-1574226516831-e1dff420e562?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Rửa sạch tất cả trái cây dưới vòi nước chảy.\n2. Dưa hấu gọt vỏ, cắt hạt lựu hoặc dùng muỗng khoét thành hình tròn.\n3. Thanh long bổ đôi, dùng muỗng khoét ruột thành từng viên tròn.\n4. Chuối bóc vỏ, cắt lát chéo khoảng 1cm.\n5. Dứa gọt vỏ, cắt bỏ mắt, cắt thành miếng tam giác nhỏ.\n6. Xếp tất cả vào bát lớn, rưới đều 2 muỗng canh mật ong.\n7. Vắt thêm nửa quả chanh, trộn nhẹ tay cho thấm đều.\n8. Rắc thêm lá bạc hà tươi lên trên, để lạnh 15 phút rồi thưởng thức.`,
        ingredients: [
          { name: 'Dưa Hấu Sài Gòn', qty: '300g', productName: 'Dưa Hấu Sài Gòn' },
          { name: 'Thanh Long Ruột Đỏ', qty: '1 quả', productName: 'Thanh Long Ruột Đỏ' },
          { name: 'Chuối Tiêu Việt Nam', qty: '2 quả', productName: 'Chuối Tiêu Việt Nam' },
          { name: 'Dứa Cayen Tiền Giang', qty: '1/4 quả', productName: 'Dứa Cayen Tiền Giang' },
          { name: 'Mật ong', qty: '2 muỗng canh', productName: null },
          { name: 'Chanh tươi', qty: '1/2 quả', productName: null },
          { name: 'Lá bạc hà', qty: '5-6 lá', productName: null },
        ],
      },
      {
        name: 'Nước ép cam sành dâu tây',
        description: 'Ly nước ép đôi từ cam sành Vĩnh Long và dâu tây Đà Lạt, màu sắc đẹp mắt, vị chua ngọt hài hòa, giàu vitamin C. Thức uống tăng cường đề kháng lý tưởng mỗi buổi sáng.',
        prepTime: 8,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Rửa sạch cam sành và dâu tây.\n2. Cắt đôi cam sành, vắt lấy nước qua rây lọc hạt. Cần khoảng 4-5 quả cho 300ml nước cam.\n3. Bỏ cuống dâu tây, cho vào máy xay với 50ml nước lọc, xay mịn.\n4. Lọc hỗn hợp dâu qua rây bỏ hạt.\n5. Rót nước cam ra ly cao, thêm đá lạnh.\n6. Nhẹ nhàng rót nước dâu lên trên theo thành ly để tạo lớp 2 màu đẹp.\n7. Trang trí thêm 1-2 quả dâu nguyên trên miệng ly.`,
        ingredients: [
          { name: 'Cam Sành Vĩnh Long', qty: '4-5 quả (khoảng 500g)', productName: 'Cam Sành Vĩnh Long' },
          { name: 'Dâu Tây Đà Lạt', qty: '150g', productName: 'Dâu Tây Đà Lạt' },
          { name: 'Đá lạnh', qty: '1 nắm', productName: null },
          { name: 'Đường (tùy khẩu vị)', qty: '1-2 muỗng cà phê', productName: null },
        ],
      },
      {
        name: 'Sinh tố bơ sữa đặc',
        description: 'Sinh tố bơ Đắk Lắk béo ngậy kết hợp với sữa đặc thơm ngon. Món nước mát giàu năng lượng và dinh dưỡng, rất được ưa chuộng trong thời tiết nóng bức.',
        prepTime: 7,
        imageUrl: 'https://images.unsplash.com/photo-1570369784278-31f5c18b0be4?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Chọn quả bơ đã chín (ấn nhẹ thấy mềm), bổ đôi và lấy hạt ra.\n2. Dùng muỗng múc hết phần thịt bơ ra bát, tránh phần vỏ xanh.\n3. Cho bơ vào máy xay cùng với 150ml sữa tươi không đường.\n4. Thêm 2 muỗng canh sữa đặc có đường.\n5. Cho thêm 5-6 viên đá xay hoặc đá lạnh.\n6. Xay mạnh trong 1 phút cho đến khi hỗn hợp thật mịn và bông.\n7. Nếm thử độ ngọt, thêm sữa đặc nếu cần.\n8. Rót ra ly, có thể thêm một ít kem tươi lên trên và thưởng thức ngay.`,
        ingredients: [
          { name: 'Bơ Sáp Đắk Lắk', qty: '1 quả lớn (khoảng 250g)', productName: 'Bơ Sáp Đắk Lắk' },
          { name: 'Sữa tươi không đường', qty: '150ml', productName: null },
          { name: 'Sữa đặc có đường', qty: '2 muỗng canh', productName: null },
          { name: 'Đá lạnh', qty: '5-6 viên', productName: null },
        ],
      },
      {
        name: 'Mứt dứa truyền thống',
        description: 'Mứt dứa thơm ngon làm từ dứa Cayen Tiền Giang chính hiệu, vị chua ngọt hài hòa, màu vàng óng hấp dẫn. Món mứt tuyệt vời để thưởng thức cùng trà hoặc làm nhân bánh.',
        prepTime: 60,
        imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Gọt vỏ dứa, khoét bỏ mắt và lõi cứng giữa.\n2. Bào hoặc cắt nhỏ dứa thành sợi hoặc hạt lựu nhỏ.\n3. Trộn dứa với 200g đường, để ngấm trong 30 phút cho ra nước.\n4. Cho hỗn hợp vào chảo chống dính, đun lửa vừa.\n5. Khuấy đều liên tục, không để sát đáy chảo.\n6. Đun khoảng 40-50 phút đến khi nước cạn dần, mứt se lại và ngả màu vàng cánh gián.\n7. Vắt thêm nước cốt chanh, khuấy đều rồi tắt bếp.\n8. Cho mứt ra khay, dàn mỏng để nguội hoàn toàn rồi bảo quản trong hộp kín.`,
        ingredients: [
          { name: 'Dứa Cayen Tiền Giang', qty: '1 quả to (khoảng 1kg)', productName: 'Dứa Cayen Tiền Giang' },
          { name: 'Đường trắng', qty: '200g', productName: null },
          { name: 'Nước cốt chanh', qty: '1 muỗng canh', productName: null },
        ],
      },
      {
        name: 'Chè nhãn hạt sen',
        description: 'Chè nhãn xuồng Tiền Giang kết hợp hạt sen, thanh mát ngọt dịu. Món tráng miệng dân dã nhưng bổ dưỡng, thích hợp thưởng thức sau bữa ăn trong những ngày hè nóng nực.',
        prepTime: 45,
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Bóc vỏ nhãn, lấy hạt ra, để phần cơm nhãn riêng.\n2. Hạt sen khô ngâm nước 2 tiếng cho mềm, sau đó luộc chín khoảng 20 phút.\n3. Đun sôi 1 lít nước lọc với 150g đường, khuấy tan.\n4. Cho hạt sen đã chín vào nồi nước đường, đun thêm 5 phút.\n5. Tắt bếp, để nguội bớt rồi mới cho cơm nhãn vào tránh bị nát.\n6. Nêm thêm một chút gừng tươi giã nhỏ để tăng hương vị.\n7. Múc ra bát, thêm vài viên đá lạnh và thưởng thức.`,
        ingredients: [
          { name: 'Nhãn Xuồng Tiền Giang', qty: '300g cơm nhãn', productName: 'Nhãn Xuồng Tiền Giang' },
          { name: 'Hạt sen khô', qty: '100g', productName: null },
          { name: 'Đường trắng', qty: '150g', productName: null },
          { name: 'Gừng tươi', qty: '1 củ nhỏ', productName: null },
          { name: 'Nước lọc', qty: '1 lít', productName: null },
        ],
      },
      {
        name: 'Kem bơ dứa đóng hộp',
        description: 'Kem trái cây tự làm từ bơ Đắk Lắk và dứa Tiền Giang, không cần máy kem, thơm ngon béo mịn. Món tráng miệng lạnh mát, hoàn toàn từ nguyên liệu tự nhiên.',
        prepTime: 240,
        imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Bơ chín bóc vỏ, lấy hết thịt cho vào máy xay.\n2. Dứa gọt vỏ, cắt nhỏ, xay nhuyễn riêng.\n3. Trộn bơ xay với dứa xay theo tỉ lệ 2:1.\n4. Thêm 200ml kem tươi (heavy cream) và 100g đường bột.\n5. Đánh bông hỗn hợp bằng máy đánh trứng tốc độ cao trong 5 phút.\n6. Thêm nước cốt chanh và một nhúm muối nhỏ, khuấy đều.\n7. Đổ hỗn hợp vào hộp đựng có nắp đậy kín.\n8. Để ngăn đá tối thiểu 4 tiếng (hoặc qua đêm) cho đông cứng.\n9. Trước khi ăn, lấy ra để nhiệt độ phòng 5 phút cho mềm bớt.`,
        ingredients: [
          { name: 'Bơ Sáp Đắk Lắk', qty: '2 quả (khoảng 400g)', productName: 'Bơ Sáp Đắk Lắk' },
          { name: 'Dứa Cayen Tiền Giang', qty: '200g', productName: 'Dứa Cayen Tiền Giang' },
          { name: 'Kem tươi (heavy cream)', qty: '200ml', productName: null },
          { name: 'Đường bột', qty: '100g', productName: null },
          { name: 'Nước cốt chanh', qty: '1 muỗng canh', productName: null },
        ],
      },
      {
        name: 'Nước detox thanh long kiwi',
        description: 'Nước detox thanh lọc cơ thể từ thanh long ruột đỏ và kiwi New Zealand, màu sắc bắt mắt, vị thanh mát. Thức uống lý tưởng hỗ trợ thanh lọc độc tố và làm đẹp da.',
        prepTime: 5,
        imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190bfed6e7?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Thanh long bổ đôi, dùng muỗng múc lấy phần ruột đỏ.\n2. Kiwi gọt vỏ, cắt thành lát tròn mỏng khoảng 5mm.\n3. Đổ 500ml nước lọc lạnh hoặc nước khoáng vào bình thủy tinh.\n4. Cho thanh long vào trước, dùng muỗng nghiền nhẹ để ra màu đỏ.\n5. Xếp các lát kiwi vào bình theo thành bình cho đẹp mắt.\n6. Thêm vài lát chanh mỏng và vài lá bạc hà tươi.\n7. Thêm đá lạnh, khuấy nhẹ và để lạnh 10-15 phút cho ngấm.\n8. Rót ra ly và thưởng thức trong ngày.`,
        ingredients: [
          { name: 'Thanh Long Ruột Đỏ', qty: '1/2 quả', productName: 'Thanh Long Ruột Đỏ' },
          { name: 'Kiwi New Zealand', qty: '2 quả', productName: 'Kiwi New Zealand' },
          { name: 'Nước lọc hoặc nước khoáng', qty: '500ml', productName: null },
          { name: 'Chanh tươi', qty: '3-4 lát', productName: null },
          { name: 'Lá bạc hà', qty: '5-6 lá', productName: null },
          { name: 'Đá lạnh', qty: 'vừa đủ', productName: null },
        ],
      },
      {
        name: 'Gỏi bưởi tôm thịt',
        description: 'Món gỏi bưởi da xanh trứ danh kết hợp tôm tươi và thịt ba chỉ luộc, pha nước mắm chua ngọt. Món khai vị thanh mát, hấp dẫn, thường xuất hiện trong các bữa tiệc gia đình.',
        prepTime: 30,
        imageUrl: 'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Bưởi da xanh bóc múi, lấy từng tép bưởi bỏ màng trắng, để ráo.\n2. Tôm sú luộc chín với chút muối và sả, bóc vỏ, chẻ đôi theo chiều dọc.\n3. Thịt ba chỉ luộc chín, để nguội rồi thái lát mỏng.\n4. Phi thơm tỏi băm với dầu ăn, cho đến khi vàng thơm thì vớt ra.\n5. Pha nước mắm: 3 muỗng canh nước mắm + 2 muỗng canh đường + 2 muỗng canh nước cốt chanh + tỏi ớt băm.\n6. Trộn đều bưởi, tôm, thịt với nước mắm pha.\n7. Cho ra đĩa, rắc đậu phộng rang giã thô và tỏi phi lên trên.\n8. Trang trí thêm rau răm và ăn ngay.`,
        ingredients: [
          { name: 'Bưởi Da Xanh', qty: '1/2 quả', productName: 'Bưởi Da Xanh' },
          { name: 'Tôm sú tươi', qty: '200g', productName: null },
          { name: 'Thịt ba chỉ', qty: '150g', productName: null },
          { name: 'Nước mắm', qty: '3 muỗng canh', productName: null },
          { name: 'Đường', qty: '2 muỗng canh', productName: null },
          { name: 'Chanh tươi', qty: '2 quả', productName: null },
          { name: 'Rau răm, đậu phộng', qty: 'vừa đủ', productName: null },
        ],
      },
      {
        name: 'Jam dâu tây tự làm',
        description: 'Mứt dâu tây Đà Lạt tự làm tại nhà, không chất bảo quản, màu đỏ tươi đẹp mắt và vị chua ngọt tự nhiên hoàn hảo. Tuyệt vời khi phết lên bánh mì nướng bơ hay ăn cùng bánh bông lan.',
        prepTime: 50,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
        instructions: `1. Rửa sạch dâu tây, bỏ cuống, để ráo nước hoàn toàn.\n2. Cắt dâu thành 4 phần, cho vào nồi inox dày đáy.\n3. Thêm 250g đường vào nồi dâu, trộn đều và để ngấm 20 phút cho ra nước.\n4. Bật bếp lửa trung bình, vừa đun vừa khuấy nhẹ tay.\n5. Vớt bọt liên tục khi hỗn hợp sôi để mứt trong và đẹp.\n6. Vắt thêm nước cốt 1 quả chanh, khuấy đều.\n7. Đun thêm 25-30 phút đến khi mứt đặc sánh, nhỏ giọt lên đĩa lạnh thấy không chảy lan.\n8. Đổ ngay vào hũ thủy tinh đã khử trùng, đậy kín nắp và lật ngược hũ để tạo chân không.\n9. Để nguội hoàn toàn rồi bảo quản ngăn mát, dùng được trong 2-3 tháng.`,
        ingredients: [
          { name: 'Dâu Tây Đà Lạt', qty: '500g', productName: 'Dâu Tây Đà Lạt' },
          { name: 'Đường trắng', qty: '250g', productName: null },
          { name: 'Chanh tươi', qty: '1 quả', productName: null },
        ],
      },
    ];

    for (const recipe of recipesData) {
      await prisma.recipe.create({
        data: {
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          imageUrl: recipe.imageUrl,
          instructions: recipe.instructions,
          ingredients: {
            create: recipe.ingredients.map(ing => ({
              ingredientName: ing.name,
              quantityStr: ing.qty,
              productId: ing.productName ? productIdMap[ing.productName] ?? null : null,
            })),
          },
        },
      });
      console.log(`  ✅ Đã tạo công thức: ${recipe.name}`);
    }
  } else {
    console.log(`  ⏩ Bỏ qua công thức (đã có ${recipeCount} công thức)`);
  }

  // ==================== 6. ORDERS ====================
  console.log('\n🛒 Bắt đầu seed Đơn hàng (Orders)...');

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const ordersData = [
      {
        user: user1,
        address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        status: 'COMPLETED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 20000,
        items: [
          { productName: 'Táo Fuji Nhật Bản', qty: 2, price: 45000 },
          { productName: 'Dâu Tây Đà Lạt', qty: 3, price: 65000 },
        ],
      },
      {
        user: user2,
        address: '789 Đường Cách Mạng Tháng 8, Phường 15, Quận 10, TP. Hồ Chí Minh',
        status: 'SHIPPING' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 25000,
        items: [
          { productName: 'Xoài Cát Hòa Lộc', qty: 3, price: 55000 },
          { productName: 'Cam Sành Vĩnh Long', qty: 2, price: 35000 },
          { productName: 'Ổi Nữ Hoàng', qty: 1, price: 25000 },
        ],
      },
      {
        user: user3,
        address: '12 Đường Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
        status: 'CONFIRMED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'PENDING' as const,
        shippingFee: 15000,
        items: [
          { productName: 'Sầu Riêng Ri6', qty: 2, price: 160000 },
          { productName: 'Măng Cụt Lái Thiêu', qty: 1, price: 60000 },
        ],
      },
      {
        user: user4,
        address: '45 Đường Đinh Tiên Hoàng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh',
        status: 'PENDING' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'PENDING' as const,
        shippingFee: 20000,
        items: [
          { productName: 'Nho Xanh Mỹ', qty: 1, price: 220000 },
          { productName: 'Kiwi New Zealand', qty: 1, price: 85000 },
          { productName: 'Quả Lựu', qty: 1, price: 55000 },
        ],
      },
      {
        user: user1,
        address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        status: 'COMPLETED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 30000,
        items: [
          { productName: 'Bơ Sáp Đắk Lắk', qty: 3, price: 40000 },
          { productName: 'Chuối Tiêu Việt Nam', qty: 2, price: 18000 },
          { productName: 'Dứa Cayen Tiền Giang', qty: 4, price: 25000 },
        ],
      },
      {
        user: user2,
        address: '789 Đường Cách Mạng Tháng 8, Phường 15, Quận 10, TP. Hồ Chí Minh',
        status: 'CANCELLED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'FAILED' as const,
        shippingFee: 20000,
        items: [
          { productName: 'Dưa Hấu Sài Gòn', qty: 1, price: 28000 },
        ],
      },
      {
        user: user5,
        address: '67 Đường Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh',
        status: 'COMPLETED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 15000,
        items: [
          { productName: 'Quýt Hồng Lai Vung', qty: 2, price: 35000 },
          { productName: 'Lê Đường Lạng Sơn', qty: 2, price: 42000 },
        ],
      },
      {
        user: user3,
        address: '12 Đường Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh',
        status: 'PREPARING' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 25000,
        items: [
          { productName: 'Nhãn Xuồng Tiền Giang', qty: 2, price: 52000 },
          { productName: 'Vú Sữa Lò Rèn', qty: 2, price: 45000 },
          { productName: 'Mít Tố Nữ', qty: 1, price: 42000 },
        ],
      },
      {
        user: user4,
        address: '88 Đường Võ Thị Sáu, Phường 7, Quận 3, TP. Hồ Chí Minh',
        status: 'COMPLETED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'SUCCESS' as const,
        shippingFee: 20000,
        items: [
          { productName: 'Thanh Long Ruột Đỏ', qty: 3, price: 38000 },
          { productName: 'Dâu Tây Đà Lạt', qty: 2, price: 65000 },
        ],
      },
      {
        user: user1,
        address: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        status: 'CONFIRMED' as const,
        paymentMethod: 'COD' as const,
        paymentStatus: 'PENDING' as const,
        shippingFee: 30000,
        items: [
          { productName: 'Bưởi Da Xanh', qty: 2, price: 110000 },
          { productName: 'Na Chi Lăng', qty: 1, price: 48000 },
          { productName: 'Mận Hà Nội', qty: 1, price: 45000 },
        ],
      },
    ];

    for (const orderData of ordersData) {
      const totalAmount = orderData.items.reduce((sum, item) => sum + item.qty * item.price, 0);
      const finalAmount = totalAmount + orderData.shippingFee;

      const order = await prisma.order.create({
        data: {
          userId: orderData.user.id,
          shippingName: orderData.user.fullName ?? 'Khách hàng',
          shippingPhone: orderData.user.phone ?? '0900000000',
          shippingAddress: orderData.address,
          totalAmount,
          shippingFee: orderData.shippingFee,
          finalAmount,
          status: orderData.status,
          items: {
            create: orderData.items.map(item => ({
              productId: productIdMap[item.productName],
              quantity: item.qty,
              priceAtPurchase: item.price,
            })),
          },
          payment: {
            create: {
              method: orderData.paymentMethod,
              status: orderData.paymentStatus,
              transactionId: orderData.paymentStatus === 'SUCCESS'
                ? `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`
                : null,
            },
          },
        },
      });
      console.log(`  ✅ Đơn hàng #${order.id} - ${orderData.user.fullName} (${orderData.status}): ${finalAmount.toLocaleString('vi-VN')}đ`);
    }
  } else {
    console.log(`  ⏩ Bỏ qua đơn hàng (đã có ${orderCount} đơn)`);
  }

  // ==================== HOÀN TẤT ====================
  console.log('\n🎉 ===== SEED DỮ LIỆU HOÀN TẤT =====');
  console.log('📦 Sản phẩm:     30 trái cây');
  console.log('🏷️  Danh mục:     3 danh mục');
  console.log('👥 Người dùng:   6 (1 admin + 5 khách hàng)');
  console.log('🏭 Kho hàng:     Inventory + Pricing + 3 phiếu nhập + 2 phiếu xuất');
  console.log('🍽️  Công thức:    10 món ăn/nước uống từ trái cây');
  console.log('🛒 Đơn hàng:     10 đơn hàng mẫu (nhiều trạng thái)');
  console.log('=====================================\n');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});