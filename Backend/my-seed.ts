import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log('Bắt đầu khởi tạo các danh mục (Categories)...');
  
  const specialRegion = await prisma.category.upsert({
    where: { name: 'Đặc sản vùng miền' },
    update: {},
    create: {
      name: 'Đặc sản vùng miền',
      description: 'Các loại trái cây đặc sản tươi ngon nức tiếng từ các vùng miền trên khắp cả nước Việt Nam.',
    },
  });

  const tropical = await prisma.category.upsert({
    where: { name: 'Trái cây nhiệt đới' },
    update: {},
    create: {
      name: 'Trái cây nhiệt đới',
      description: 'Trái cây đặc trưng của khí hậu nhiệt đới, dồi dào vitamin, khoáng chất và hương vị thơm ngọt đậm đà.',
    },
  });

  const imported = await prisma.category.upsert({
    where: { name: 'Trái cây nhập khẩu' },
    update: {},
    create: {
      name: 'Trái cây nhập khẩu',
      description: 'Trái cây cao cấp nhập khẩu chính ngạch từ các quốc gia ôn đới và các nông trại đạt tiêu chuẩn organic quốc tế.',
    },
  });

  const categoryMap: { [key: string]: number } = {
    'Đặc sản vùng miền': specialRegion.id,
    'Trái cây nhiệt đới': tropical.id,
    'Trái cây nhập khẩu': imported.id,
  };

  console.log('Bắt đầu seed 30 sản phẩm trái cây chi tiết...');

  const fruits = [
    {
      name: 'Táo Fuji Nhật Bản',
      price: 45000,
      stockQuantity: 150,
      description: 'Táo Fuji Nhật Bản được trồng và chăm sóc tỉ mỉ tại vùng Aomori nổi tiếng. Quả táo tròn đều, vỏ đỏ hồng tự nhiên, thịt táo giòn ngọt, mọng nước và có hương thơm đặc trưng rất dễ chịu. Đây là loại táo cao cấp thường được chọn làm quà biếu tặng sang trọng.',
      healthInfo: 'Táo chứa nhiều chất xơ hòa tan pectin giúp hỗ trợ hệ tiêu hóa và ổn định đường huyết. Ngoài ra, hàm lượng vitamin C và chất chống oxy hóa dồi dào trong quả táo giúp cải thiện làn da, tăng cường hệ minh dịch và bảo vệ tim mạch hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu']
    },
    {
      name: 'Chuối Tiêu Việt Nam',
      price: 18000,
      stockQuantity: 200,
      description: 'Chuối tiêu Việt Nam chín tự nhiên có màu vàng tươi, cơm chuối mềm dẻo, ngọt đậm đà và có mùi thơm nồng nàn đặc trưng. Sản phẩm được thu hoạch trực tiếp từ các nhà vườn đạt chuẩn, không chất bảo quản, tuyệt đối an toàn cho sức khỏe.',
      healthInfo: 'Chuối tiêu là nguồn cung cấp Kali tuyệt vời giúp điều hòa huyết áp và hỗ trợ cơ bắp. Quả cũng rất giàu vitamin B6, sắt và carbohydrate tự nhiên, giúp bổ sung năng lượng nhanh chóng, rất phù hợp cho người tập thể thao và học tập căng thẳng.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1571501478200-85fbd29c36ac?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Dâu Tây Đà Lạt',
      price: 65000,
      stockQuantity: 80,
      description: 'Dâu tây Đà Lạt được trồng tại các trang trại thủy canh công nghệ cao. Quả dâu chín đỏ mọng, hình tim đẹp mắt, thịt quả mềm, mọng nước với vị chua ngọt hài hòa và hương thơm thanh mát đặc trưng của vùng cao nguyên đất đỏ.',
      healthInfo: 'Dâu tây là siêu thực phẩm chứa lượng vitamin C cực lớn, hỗ trợ chống lão hóa da và tăng cường sản sinh collagen. Chất chống oxy hóa anthocyanin có trong quả dâu còn giúp bảo vệ mạch máu và cải thiện chức năng não bộ.',
      unit: 'hộp',
      images: ['https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Xoài Cát Hòa Lộc',
      price: 55000,
      stockQuantity: 120,
      description: 'Xoài cát Hòa Lộc là loại xoài ngon nổi tiếng bậc nhất miền Tây Nam Bộ. Quả xoài có hình thuôn dài, khi chín vỏ màu vàng chanh, thịt quả màu vàng tươi, ít xơ, cấu trúc dẻo mịn và vị ngọt thanh đậm đà cùng hương thơm ngào ngạt khó quên.',
      healthInfo: 'Xoài cát giàu vitamin A rất tốt cho thị lực, ngăn ngừa khô mắt và quáng gà. Hàm lượng chất xơ dồi dào cùng các enzyme tiêu hóa tự nhiên trong quả xoài giúp hệ đường ruột luôn khỏe mạnh và ngăn ngừa táo bón.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1553279768-865429fd81ce?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Cam Sành Vĩnh Long',
      price: 35000,
      stockQuantity: 180,
      description: 'Cam sành Vĩnh Long nổi tiếng với lớp vỏ sần sùi, màu xanh đậm đặc trưng. Bên trong là các tép cam màu vàng cam mọng nước, vị chua ngọt đậm đà và rất thơm. Cam sành cực kỳ thích hợp để vắt nước uống giải nhiệt hàng ngày.',
      healthInfo: 'Cung cấp lượng lớn Vitamin C tự nhiên giúp cơ thể tăng cường sức đề kháng, chống lại các tác nhân gây cảm cúm và viêm họng. Chất xơ trong quả cam sành còn giúp giảm lượng cholesterol xấu trong máu và làm đẹp da.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Dưa Hấu Sài Gòn',
      price: 28000,
      stockQuantity: 60,
      description: 'Dưa hấu vỏ xanh đậm bóng bẩy, hình dáng thuôn dài đẹp mắt. Ruột dưa đỏ tươi, ít hạt, thịt cát giòn xốp và ngọt lịm. Đây là thức quả giải nhiệt lý tưởng trong những ngày hè oi bức hoặc làm nước ép thanh lọc cơ thể.',
      healthInfo: 'Dưa hấu chứa hơn 90% nước cùng hợp chất lycopene mạnh mẽ giúp chống ung thư và bảo vệ tim mạch. Chất citrulline trong dưa hấu giúp giảm đau nhức cơ bắp sau khi vận động mạnh và kích thích tuần hoàn máu.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1587049352851-8d4e8e16ea77?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới']
    },
    {
      name: 'Nho Xanh Mỹ',
      price: 220000,
      stockQuantity: 50,
      description: 'Nho xanh nhập khẩu trực tiếp từ các trang trại hiện đại của Mỹ. Quả nho thuôn dài, màu xanh hổ phách đẹp mắt, không hạt, vỏ mỏng dai, thịt quả cực kỳ giòn và có vị ngọt thanh khiết rất dễ chịu.',
      healthInfo: 'Nho xanh chứa chất resveratrol chống oxy hóa mạnh mẽ giúp ngăn ngừa sự lão hóa của tế bào và bảo vệ thành mạch máu. Nó còn cung cấp các khoáng chất như đồng, sắt và mangan hỗ trợ tái tạo máu và bảo vệ xương.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu']
    },
    {
      name: 'Bơ Sáp Đắk Lắk',
      price: 40000,
      stockQuantity: 90,
      description: 'Bơ sáp Đắk Lắk được chọn lọc kỹ càng, quả bơ già da bóng lấm tấm vàng. Khi chín bơ có ruột vàng ươm như mỡ gà, thịt bơ dẻo quánh, béo ngậy đặc trưng và không hề bị xơ hay đắng, rất thích hợp làm sinh tố hoặc salad.',
      healthInfo: 'Bơ chứa chất béo không bão hòa đơn lành mạnh tốt cho hệ tim mạch và giảm mỡ máu. Đây cũng là loại quả giàu chất chống oxy hóa lutein tốt cho mắt, cùng vitamin E bảo vệ làn da khỏe đẹp, căng tràn sức sống.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Thanh Long Ruột Đỏ',
      price: 38000,
      stockQuantity: 100,
      description: 'Thanh long ruột đỏ Long An có quả tròn trịa, vỏ màu hồng đậm bóng bẩy. Phần ruột bên trong màu đỏ tím bắt mắt, mọng nước, vị ngọt thanh đậm hơn hẳn thanh long ruột trắng truyền thống và chứa nhiều hạt nhỏ li ti.',
      healthInfo: 'Màu đỏ tím của thanh long ruột đỏ chứa betalain - một chất chống oxy hóa mạnh giúp ngăn ngừa ung thư và bảo vệ gan. Hàm lượng sắt dồi dào trong quả giúp hỗ trợ điều trị thiếu máu và nâng cao hệ miễn dịch.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1629166085697-7f99ff9d63f9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Kiwi New Zealand',
      price: 85000,
      stockQuantity: 70,
      description: 'Kiwi nhập khẩu từ New Zealand nổi tiếng toàn cầu. Quả kiwi có lớp vỏ mỏng phủ lông mịn, thịt quả màu xanh ngọc hoặc vàng óng, vị chua ngọt hài hòa tinh tế rất ngon miệng và mát lạnh.',
      healthInfo: 'Kiwi là vua vitamin C, một quả chứa nhiều vitamin C hơn cả hai quả cam. Kiwi cũng chứa chất actinidin hỗ trợ tiêu hóa chất đạm dễ dàng hơn và nhiều chất xơ giúp ngăn ngừa các bệnh về đường tiêu hóa.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1585059895524-72359fa0f07bf?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu']
    },
    {
      name: 'Dứa Cayen Tiền Giang',
      price: 25000,
      stockQuantity: 130,
      description: 'Dứa Cayen Tiền Giang trái to tròn, mắt dứa nông và thưa. Khi chín quả có màu vàng tươi đẹp mắt, thịt dứa nhiều nước, vị ngọt lịm đậm đà và đặc biệt rất ít rát lưỡi so với các giống dứa thường.',
      healthInfo: 'Dứa chứa enzyme bromelain đặc biệt giúp kháng viêm, giảm sưng và hỗ trợ chữa lành vết thương hiệu quả. Ngoài ra, dứa còn rất tốt cho xương khớp nhờ chứa hàm lượng mangan thiết yếu dồi dào.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Mãng Cầu Xiêm Tây Ninh',
      price: 48000,
      stockQuantity: 40,
      description: 'Mãng cầu xiêm Tây Ninh quả to, gai mềm. Thịt quả màu trắng sữa dẻo dai, nhiều nước, vị chua chua ngọt ngọt rất kích thích vị giác. Thường được xay sinh tố với sữa hoặc làm mứt rất ngon.',
      healthInfo: 'Mãng cầu xiêm giàu vitamin C, vitamin B1 và B2 giúp cải thiện quá trình trao đổi chất. Nhiều nghiên cứu cũng chỉ ra chiết xuất từ quả và lá mãng cầu xiêm có tác dụng hỗ trợ kháng viêm, tăng cường sức khỏe tế bào.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1627995166299-4c8d57dcd5ea?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Măng Cụt Lái Thiêu',
      price: 60000,
      stockQuantity: 100,
      description: 'Măng cụt đặc sản Lái Thiêu vỏ màu tím thẫm mỏng mềm, dễ bóc. Bên trong là các múi trắng muốt như hoa tuyết, vị chua ngọt thanh khiết quyến rũ được mệnh danh là nữ hoàng trái cây miền nhiệt đới.',
      healthInfo: 'Măng cụt chứa hợp chất xanthone quý giá có đặc tính kháng viêm, chống virus và ngăn ngừa lão hóa tế bào cực kỳ hiệu quả. Măng cụt còn giúp kiểm soát cân nặng tốt nhờ lượng calo thấp và nhiều nước.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1601490216654-e0b4f85e49c7?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Chôm Chôm Nhãn',
      price: 32000,
      stockQuantity: 150,
      description: 'Chôm chôm nhãn quả nhỏ, râu ngắn và hơi khô. Vỏ chôm chôm màu vàng đỏ, cơm bên trong màu trắng đục, ráo nước, giòn rụm và tróc hạt hoàn toàn, mang vị ngọt đậm đà như mật ong.',
      healthInfo: 'Chôm chôm cung cấp hàm lượng đồng dồi dào hỗ thể sản sinh hồng cầu và duy trì hệ thần kinh khỏe mạnh. Lượng canxi và phốt pho trong cơm chôm chôm cũng giúp củng cố răng và xương vững chắc.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1593444005893-ba588647acae?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Sầu Riêng Ri6',
      price: 159997,
      stockQuantity: 50,
      description: 'Sầu Riêng Ri6 cơm vàng hạt lép trứ danh miền Tây. Quả sầu riêng gai đều, múi sầu riêng vàng ươm bắt mắt, cơm cực dày dẻo mịn, béo ngậy ngọt lịm với mùi hương nồng nàn quyến rũ đặc trưng.',
      healthInfo: 'Sầu riêng là loại trái cây giàu calo và chất dinh dưỡng, cung cấp nguồn năng lượng dồi dào ngay tức thì. Sầu riêng cũng chứa chất chống oxy hóa tự nhiên và chất xơ giúp cải thiện giấc ngủ nhờ chứa axit amin tryptophan.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1536709861618-ff3fc3e0d866?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Vú Sữa Lò Rèn',
      price: 45000,
      stockQuantity: 80,
      description: 'Vú sữa Lò Rèn Vĩnh Kim nổi tiếng quả tròn căng, vỏ mỏng màu xanh trắng khi chín ngả hồng. Ruột quả trắng đục chứa dòng nước sữa ngọt lịm, thơm ngậy mát lành như sữa mẹ.',
      healthInfo: 'Vú sữa chứa lượng canxi và phốt pho dồi dào tốt cho xương khớp và răng, đặc biệt thích hợp cho trẻ em và phụ nữ mang thai. Lượng nước và vitamin phong phú trong quả giúp giải nhiệt nhanh chóng và làm dịu cơn khát.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1616851608404-58e136371cb1?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Na Chi Lăng',
      price: 48000,
      stockQuantity: 90,
      description: 'Na Chi Lăng Lạng Sơn quả to tròn, mắt na căng mọng vỏ mỏng. Thịt na màu trắng ngà, dai dẻo ngọt đậm đà, ít hạt và có hương thơm thanh mát đặc trưng của vùng núi đá vôi.',
      healthInfo: 'Quả na rất giàu Vitamin B6 giúp hỗ trợ giảm stress và điều hòa tâm trạng. Na cũng chứa các chất chống oxy hóa tự nhiên giúp bảo vệ tim mạch, ngăn ngừa các bệnh viêm nhiễm và làm sáng da hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596700684078-43d9642caed9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Quýt Hồng Lai Vung',
      price: 35000,
      stockQuantity: 200,
      description: 'Quýt hồng Lai Vung Đồng tháp nổi tiếng vỏ mỏng màu vàng cam rực rỡ óng ả. Múi quýt mọng nước, vị chua ngọt thanh tao đậm đà cùng mùi thơm tinh dầu quýt dễ chịu sảng khoái.',
      healthInfo: 'Quýt hồng chứa nhiều vitamin A và C tốt cho thị lực và làm sáng da. Vỏ quýt có chứa nhiều chất limonene giúp giảm ho, hỗ trợ tiêu đờm và tinh dầu quýt giúp giải tỏa căng thẳng thần kinh hiệu quả.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1582283088210-911e3bce5557?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Ổi Nữ Hoàng',
      price: 25000,
      stockQuantity: 300,
      description: 'Ổi Nữ Hoàng trái to tròn đều, vỏ ngoài hơi sần nhẹ màu xanh nhạt. Thịt ổi màu trắng tinh khiết, dày cùi, cực kỳ giòn ngọt và đặc biệt rất ít hạt, ăn kèm muối ớt siêu ngon.',
      healthInfo: 'Ổi là một trong những quả giàu Vitamin C nhất (gấp 4 lần cam), giúp tăng đề kháng tuyệt vời. Ổi cũng giàu chất xơ hòa tan tốt cho tiêu hóa, giúp duy trì vóc dáng thon gọn và ổn định huyết áp.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1601646761285-65bfa67cd7a3?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới']
    },
    {
      name: 'Mít Tố Nữ',
      price: 42000,
      stockQuantity: 60,
      description: 'Mít tố nữ miền Tây quả nhỏ thuôn dài. Khi chín xẻ dọc vỏ có thể nhấc nguyên cuống mít với các múi mít tròn căng màu vàng ươm bám chặt, cơm mít dẻo thơm ngào ngạt ngòn ngọt.',
      healthInfo: 'Mít tố nữ chứa đường tự nhiên dễ hấp thụ cung cấp năng lượng nhanh chóng cho cơ thể. Mít cũng chứa nhiều vitamin A giúp bổ mắt và canxi hỗ trợ hệ xương khớp luôn khỏe mạnh và dẻo dai.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1550828520-4cb496926fc9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Bưởi Da Xanh',
      price: 110000,
      stockQuantity: 50,
      description: 'Bưởi Da Xanh đặc sản Bến Tre vỏ xanh mỏng bóng bẩy. Múi bưởi màu hồng tươi mọng nước, tôm bưởi ráo và dễ tách, vị ngọt thanh mát đậm đà không bị chua đắng.',
      healthInfo: 'Bưởi da xanh là thực phẩm vàng cho chế độ ăn kiêng nhờ chứa enzyme đốt cháy chất béo và kiểm soát cân nặng. Bưởi cũng chứa nhiều lycopene chống oxy hóa mạnh và hỗ trợ giảm cholesterol trong máu.',
      unit: 'quả',
      images: ['https://images.unsplash.com/photo-1596752003738-4221199a03cf?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    },
    {
      name: 'Quả Roi',
      price: 50000,
      stockQuantity: 100,
      description: 'Quả roi (quả mận miền Nam) màu đỏ mọng bóng loáng, quả hình chuông cân đối. Thịt roi màu trắng tinh khôi, giòn xốp, nhiều nước vị ngọt mát dễ chịu cực kỳ thanh nhiệt.',
      healthInfo: 'Quả roi có hàm lượng nước cực kỳ cao (trên 90%) giúp bù nước và làm mát cơ thể tức thì. Nó chứa nhiều vitamin C và chất xơ hỗ trợ hệ tiêu hóa hoạt động nhịp nhàng và ngăn ngừa lão hóa.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới']
    },
    {
      name: 'Dưa Vàng',
      price: 60000,
      stockQuantity: 10,
      description: 'Dưa vàng tròn tria, vỏ mịn màng màu vàng óng bắt mắt. Ruột dưa vàng nhạt, mọng nước, vị ngọt lịm sâu lắng cùng hương thơm nhẹ nhàng quyến rũ dâng tràn khi cắt.',
      healthInfo: 'Dưa vàng chứa lượng lớn beta-carotene (tiền chất vitamin A) giúp đôi mắt sáng khỏe và ngăn ngừa lão hóa da. Hàm lượng kali dồi dào hỗ trợ hoạt động của tim mạch và ổn định đường huyết.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1598030304671-5aa1d6f21226?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới']
    },
    {
      name: 'Dưa Lưới',
      price: 60000,
      stockQuantity: 10,
      description: 'Dưa lưới vỏ xanh xám phủ các đường gân nổi đẹp như lưới dệt. Thịt dưa màu cam vàng bắt mắt, giòn ngọt sắc sảo, mọng nước và có mùi thơm nồng nàn sang trọng.',
      healthInfo: 'Dưa lưới rất giàu vitamin C và chất chống oxy hóa zeaxanthin giúp bảo vệ mắt khỏi tác hại của tia cực tím. Đây còn là nguồn cung cấp axit folic tốt hỗ trợ quá trình phát triển tế bào và thai nhi.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1598030349646-6aa8c7d5c765?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhiệt đới', 'Trái cây nhập khẩu']
    },
    {
      name: 'Quả Lựu',
      price: 55000,
      stockQuantity: 150,
      description: 'Quả lựu vỏ đỏ hồng đẹp mắt. Bên trong chứa hàng trăm hạt lựu nhỏ lấp lánh như hồng ngọc, mọng nước màu đỏ tươi, vị ngọt thanh mát pha chút chua nhẹ tinh tế.',
      healthInfo: 'Lựu chứa chất chống oxy hóa punicalagin cực mạnh (gấp 3 lần trà xanh) giúp bảo vệ tim mạch, giảm xơ vữa động mạch và kháng viêm. Lựu cũng hỗ trợ lưu thông máu và làm đẹp da vượt trội.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1565293627255-a0ed8df359cb?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Trái cây nhập khẩu']
    },
    {
      name: 'Mận Hà Nội',
      price: 45000,
      stockQuantity: 100,
      description: 'Mận Hà Nội (Mận hậu Bắc Hà) chín vỏ đỏ tía phủ lớp phấn trắng tự nhiên. Thịt quả màu đỏ sẫm giòn tan, mọng nước chua ngọt đậm đà khó cưỡng khi chấm muối ớt.',
      healthInfo: 'Mận chứa nhiều vitamin C, chất chống oxy hóa tự nhiên và chất sắt hỗ trợ hệ tuần hoàn và tăng đề kháng. Chất sorbitol tự nhiên trong quả mận còn hỗ trợ nhuận tràng và ngăn táo bón.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1628178121659-1ec8b98161ca?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Hồng Giòn Đà Lạt',
      price: 45000,
      stockQuantity: 90,
      description: 'Hồng giòn Đà Lạt vỏ màu vàng cam mịn màng quả tròn hơi dẹt. Thịt hồng màu vàng tươi, giòn rau ráu, vị ngọt lịm không hề chát nhờ được ủ hơi tự nhiên đúng kỹ thuật.',
      healthInfo: 'Hồng chứa nhiều vitamin A tốt cho mắt và vitamin C tăng cường hệ miễn dịch. Chất shibuol và axit tannic trong hồng có tác dụng hỗ trợ hạ huyết áp và bảo vệ đường ruột luôn khỏe mạnh.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596700684078-43d9642caed9?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Đào Sa Pa',
      price: 38000,
      stockQuantity: 110,
      description: 'Đào Sa Pa nổi tiếng quả nhỏ xinh phủ lông tơ mịn màng, vỏ màu xanh ngà ngả má hồng rực rỡ. Thịt đào giòn, vị chua ngọt hài hòa thanh khiết đậm chất núi rừng Tây Bắc.',
      healthInfo: 'Đào chứa nhiều vitamin C, kali và chất xơ lành mạnh hỗ trợ hệ tim mạch hoạt động tốt. Các hợp chất phenolic trong quả đào có tác dụng chống oxy hóa mạnh giúp ngăn ngừa béo phì và các bệnh liên quan.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1595124253363-c59659b19350?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Lê Đường Lạng Sơn',
      price: 42000,
      stockQuantity: 120,
      description: 'Lê đường Lạng Sơn quả tròn đều vỏ mỏng màu vàng xanh lấm tấm. Thịt lê trắng tinh khiết, nhiều nước, cực kỳ giòn ngọt mát dịu giúp giải nhiệt tuyệt vời.',
      healthInfo: 'Lê có tính mát, vị ngọt thanh giúp thanh phế, tiêu đờm và giảm ho hiệu quả. Hàm lượng nước cao và chất xơ hòa tan dồi dào trong lê giúp làm dịu đường tiêu hóa và ổn định huyết áp.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1514756331096-242fdeb70f4a?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền']
    },
    {
      name: 'Nhãn Xuồng Tiền Giang',
      price: 52000,
      stockQuantity: 130,
      description: 'Nhãn xuồng Tiền Giang trái to vỏ mỏng màu vàng bò. Cơm nhãn dày cùi dẻo dai, màu vàng ngà óng ả, vị ngọt lịm đậm đà cùng hương thơm quyến rũ khó cưỡng.',
      healthInfo: 'Nhãn chứa nhiều vitamin C và chất chống oxy hóa polyphenol giúp ngăn ngừa tế bào ung thư. Nhãn cũng chứa sắt hỗ trợ tuần hoàn máu và các hợp chất kích thích sản sinh collagen làm đẹp da.',
      unit: 'kg',
      images: ['https://images.unsplash.com/photo-1596752003738-4221199a03cf?auto=format&fit=crop&w=400&q=80'],
      categoryNames: ['Đặc sản vùng miền', 'Trái cây nhiệt đới']
    }
  ];

  for (const fruit of fruits) {
    const existing = await prisma.product.findFirst({
      where: { name: fruit.name }
    });

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
          categories: {
            set: categoryConnections
          }
        }
      });
      console.log(`Đã cập nhật sản phẩm: ${fruit.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: fruit.name,
          price: fruit.price,
          stockQuantity: fruit.stockQuantity,
          description: fruit.description,
          healthInfo: fruit.healthInfo,
          unit: fruit.unit,
          mediaUrls: fruit.images,
          categories: {
            connect: categoryConnections
          },
          isActive: true,
        },
      });
      console.log(`Đã tạo mới sản phẩm: ${fruit.name}`);
    }
  }

  console.log('Seed dữ liệu 30 sản phẩm và danh mục thành công!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });