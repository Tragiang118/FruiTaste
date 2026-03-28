import api from "@/lib/axios";

export default async function HomePage() {
  let users = [];
  try {
    const res = await api.get("/users");
    if (res.status === 200) {
      users = res.data;
      console.log("Users fetched from backend:", users);
    }
  } catch (err: any) {
    console.error("Lỗi kết nối Backend:", err.message);
  }
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6 text-green-600">FruiTaste 🍏</h1>
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Danh sách người dùng từ Backend:</h2>
        {users.length === 0 ? (
          <p className="text-gray-500 italic">Chưa có người dùng nào hoặc Backend chưa chạy (cổng 8080).</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user: any) => (
              <li key={user.id} className="p-4 border rounded shadow-sm hover:shadow-md transition">
                <span className="font-medium">{user.fullName || user.email}</span> - {user.role}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
