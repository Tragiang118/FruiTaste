import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter });

  console.log('Bắt đầu seed dữ liệu trái cây...');
  // Tạo category mặc định
  const category = await prisma.category.upsert({
    where: { name: 'Đặc sản vùng miền' },
    update: {},
    create: {
      name: 'Đặc sản vùng miền',
      description: 'Các loại trái cây đặc sản tươi ngon từ các vùng miền.',
    },
  });

  const fruits = [
    { name: 'Táo Fuji Nhật Bản', price: 45000, stockQuantity: 150, description: 'Táo Fuji ngọt giòn, nhập khẩu từ Nhật Bản', unit: 'kg', images: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Chuối Tiêu Việt Nam', price: 18000, stockQuantity: 200, description: 'Chuối tiêu chín tự nhiên, vị ngọt đặc trưng', unit: 'kg', images: ['https://images.unsplash.com/photo-1571501478200-85fbd29c36ac?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Dâu Tây Đà Lạt', price: 65000, stockQuantity: 80, description: 'Dâu tây tươi hái từ vườn Đà Lạt, chua ngọt', unit: 'hộp', images: ['https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Xoài Cát Hòa Lộc', price: 55000, stockQuantity: 120, description: 'Xoài cát Hòa Lộc đặc sản miền Tây, thịt vàng', unit: 'kg', images: ['https://images.unsplash.com/photo-1553279768-865429fd81ce?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Cam Sành Vĩnh Long', price: 35000, stockQuantity: 180, description: 'Cam sành Vĩnh Long trồng theo quy trình', unit: 'kg', images: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Dưa Hấu Sài Gòn', price: 28000, stockQuantity: 60, description: 'Dưa hấu hắc mỹ nhân vỏ xanh đậm thịt đỏ', unit: 'quả', images: ['https://images.unsplash.com/photo-1587049352851-8d4e8e16ea77?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Nho Xanh Mỹ', price: 220000, stockQuantity: 50, description: 'Nho xanh không hạt nhập khẩu từ Mỹ, hạt', unit: 'kg', images: ['https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Bơ Sáp Đắk Lắk', price: 40000, stockQuantity: 90, description: 'Bơ sáp Đắk Lắk chín mềm, béo thơm, già', unit: 'kg', images: ['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Thanh Long Ruột Đỏ', price: 38000, stockQuantity: 100, description: 'Thanh long ruột đỏ Long An, ngọt hơn thanh', unit: 'kg', images: ['https://images.unsplash.com/photo-1629166085697-7f99ff9d63f9?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Kiwi New Zealand', price: 85000, stockQuantity: 70, description: 'Kiwi vàng và xanh nhập từ New Zealand,', unit: 'kg', images: ['https://images.unsplash.com/photo-1585059895524-72359fa0f07bf?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Dứa Cayen Tiền Giang', price: 25000, stockQuantity: 130, description: 'Dứa cayen Tiền Giang ngọt mát, ít mắt, th', unit: 'quả', images: ['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Mãng Cầu Xiêm Tây Ninh', price: 48000, stockQuantity: 40, description: 'Mãng cầu xiêm Tây Ninh, vị chua ngọt đậ', unit: 'kg', images: ['https://images.unsplash.com/photo-1627995166299-4c8d57dcd5ea?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Măng Cụt Lái Thiêu', price: 60000, stockQuantity: 100, description: 'Măng cụt Lái Thiêu vỏ mỏng, múi trắng n', unit: 'kg', images: ['https://images.unsplash.com/photo-1601490216654-e0b4f85e49c7?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Chôm Chôm Nhãn', price: 32000, stockQuantity: 150, description: 'Chôm chôm nhãn trái nhỏ, râu ngắn, cơm', unit: 'kg', images: ['https://images.unsplash.com/photo-1593444005893-ba588647acae?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Sầu Riêng Ri6', price: 159997, stockQuantity: 50, description: 'Sầu riêng Ri6 cơm vàng, hạt lép, vị béo n', unit: 'kg', images: ['https://images.unsplash.com/photo-1536709861618-ff3fc3e0d866?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Vú Sữa Lò Rèn', price: 45000, stockQuantity: 80, description: 'Vú sữa Lò Rèn Vĩnh Kim vỏ mỏng, nước s', unit: 'kg', images: ['https://images.unsplash.com/photo-1616851608404-58e136371cb1?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Na Chi Lăng', price: 48000, stockQuantity: 90, description: 'Na Chi Lăng (Lạng Sơn) mắt to, thịt trắng', unit: 'kg', images: ['https://images.unsplash.com/photo-1596700684078-43d9642caed9?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Quýt Hồng Lai Vung', price: 35000, stockQuantity: 200, description: 'Quýt hồng Lai Vung vỏ mỏng màu cam rự', unit: 'kg', images: ['https://images.unsplash.com/photo-1582283088210-911e3bce5557?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Ổi Nữ Hoàng', price: 25000, stockQuantity: 300, description: 'Ổi nữ hoàng trái to, ít hạt, giòn tan, vị ng', unit: 'kg', images: ['https://images.unsplash.com/photo-1601646761285-65bfa67cd7a3?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Mít Tố Nữ', price: 42000, stockQuantity: 60, description: 'Mít tố nữ trái nhỏ, múi vàng ươm, thơm', unit: 'kg', images: ['https://images.unsplash.com/photo-1550828520-4cb496926fc9?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Bưởi Da Xanh', price: 110000, stockQuantity: 50, description: 'Bưởi da xanh ruột hồng thơm ngọt', unit: 'quả', images: ['https://images.unsplash.com/photo-1596752003738-4221199a03cf?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Quả Roi', price: 50000, stockQuantity: 100, description: 'Quả roi đỏ mọng giòn ngọt', unit: 'kg', images: ['https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Dưa Vàng', price: 60000, stockQuantity: 10, description: 'Dưa vàng ngọt lịm', unit: 'kg', images: ['https://images.unsplash.com/photo-1598030304671-5aa1d6f21226?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Dưa Lưới', price: 60000, stockQuantity: 10, description: 'Dưa lưới vỏ xanh gân trắng', unit: 'kg', images: ['https://images.unsplash.com/photo-1598030349646-6aa8c7d5c765?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Quả Lựu', price: 55000, stockQuantity: 150, description: 'Lựu đỏ ngọt', unit: 'kg', images: ['https://images.unsplash.com/photo-1565293627255-a0ed8df359cb?auto=format&fit=crop&w=400&q=80'] },
    { name: 'Mận Hà Nội', price: 45000, stockQuantity: 100, description: 'Mận Hà Nội thơm ngon, chua ngọt nức tiếng', unit: 'kg', images: ['https://images.unsplash.com/photo-1628178121659-1ec8b98161ca?auto=format&fit=crop&w=400&q=80'] },
  ];

  for (const fruit of fruits) {
    await prisma.product.create({
      data: {
        name: fruit.name,
        price: fruit.price,
        stockQuantity: fruit.stockQuantity,
        description: fruit.description,
        unit: fruit.unit,
        images: fruit.images,
        categoryId: category.id,
        isActive: true,
      },
    });
  }

  console.log('Seed dữ liệu thành công!');
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });