'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddUserDialog from './AddUserDialog';
import { Input } from '@/components/ui/input';
import { Search, User, RefreshCw, ArrowRightLeft, Filter, ArrowUpDown, ChevronDown, Users, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface UserType {
  isActive: boolean;
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // States cho các bộ lọc
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // States cho sắp xếp
  const [nameSort, setNameSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [dateSort, setDateSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');
  const [idSort, setIdSort] = useState<'ASC' | 'DESC' | 'NONE'>('NONE');

  const [confirmBanId, setConfirmBanId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRoleId, setConfirmRoleId] = useState<{ id: number, currentRole: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Lỗi khi tải user:', error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id: number, currentRole: string) => {
    setConfirmRoleId({ id, currentRole });
  };

  const doChangeRole = async () => {
    if (!confirmRoleId) return;
    const { id, currentRole } = confirmRoleId;
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      toast.success(`Đã chuyển quyền thành công!`);
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi khi phân quyền!');
    } finally {
      setConfirmRoleId(null);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('Đã gỡ bỏ tài khoản thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi khi xóa tài khoản');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleLock = async (id: number) => {
    try {
      await api.patch(`/users/${id}/lock`);
      toast.success('Đã khóa tài khoản!');
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi khi khóa tài khoản!');
    } finally {
      setConfirmBanId(null);
    }
  };

  const handleUnlock = async (id: number) => {
    try {
      await api.patch(`/users/${id}/unlock`);
      toast.success('Đã mở khóa tài khoản!');
      fetchUsers();
    } catch (error) {
      toast.error('Có lỗi khi mở khóa tài khoản!');
    }
  };

  // Logic lọc và sắp xếp
  let filteredUsers = users.filter(u => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(search.toLowerCase())) ||
      (u.phone && u.phone.includes(search)) ||
      u.id.toString() === search;

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive) ||
      (statusFilter === 'LOCKED' && !u.isActive);

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchSearch && matchStatus && matchRole;
  });

  // Sắp xếp
  if (nameSort !== 'NONE') {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      const nameA = a.fullName || '';
      const nameB = b.fullName || '';
      return nameSort === 'ASC' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  } else if (dateSort !== 'NONE') {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return dateSort === 'ASC' ? diff : -diff;
    });
  }

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Quản lý Người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers} variant="outline" className="bg-white rounded-full text-gray-700 cursor-pointer border-gray-200 h-8 px-4 text-xs font-bold shadow-none">
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5 text-gray-500", loading && "animate-spin")} /> Làm mới
          </Button>
          <AddUserDialog onSuccess={fetchUsers} />
        </div>
      </div>

      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden flex flex-col bg-white">
        <CardHeader className="border-b border-gray-50 p-6 space-y-4">
          <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
            {/* Search Bar */}
            <div className="relative xl:max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm email, tên, SĐT hoặc ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full bg-gray-50/50 border-gray-200 h-8 text-[13px] shadow-none font-medium focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300 hover:border-gray-300 transition-colors"
              />
            </div>

            {/* Advanced Filters using DropdownMenu (Standard for the project) */}
            <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 whitespace-nowrap">
                <Filter size={16} /> Lọc theo:
              </div>

              {/* Role Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-gray-200 font-bold text-gray-700 bg-white hover:bg-gray-50 min-w-[150px] justify-between">
                    {roleFilter === 'ALL' ? 'Tất cả vai trò' : roleFilter === 'USER' ? 'Người dùng' : 'Quản trị viên'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2">
                  <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-widest">CHỌN VAI TRÒ</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-50" />
                  <DropdownMenuRadioGroup value={roleFilter} onValueChange={setRoleFilter}>
                    <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs transition-colors">Tất cả vai trò</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="USER" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs transition-colors">Người dùng (USER)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ADMIN" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs text-purple-600 transition-colors">Quản trị viên (ADMIN)</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-gray-200 font-bold text-gray-700 bg-white hover:bg-gray-50 min-w-[160px] justify-between">
                    {statusFilter === 'ALL' ? 'Tất cả trạng thái' : statusFilter === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-gray-100 p-2">
                  <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-widest">CHỌN TRẠNG THÁI</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-gray-50" />
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                    <DropdownMenuRadioItem value="ALL" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs transition-colors">Tất cả trạng thái</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ACTIVE" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs text-blue-600 transition-colors">Đang hoạt động</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="LOCKED" className="cursor-pointer rounded-xl font-bold p-2 pr-10 text-xs text-red-500 transition-colors">Đã khóa</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-60 gap-3 text-gray-400">
              <RefreshCw className="animate-spin w-8 h-8 text-primary" />
              <p className="text-sm font-medium">Đang tải dữ liệu người dùng...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-50">
                  <TableHead className="w-16 font-bold text-gray-700 text-center">ID</TableHead>
                  <TableHead className="font-bold text-gray-700 min-w-[250px]">
                    <div className="flex items-center gap-1">
                      Thành viên
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setNameSort(nameSort === 'ASC' ? 'DESC' : nameSort === 'DESC' ? 'NONE' : 'ASC');
                        setIdSort('NONE'); setDateSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", nameSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Số điện thoại</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Vai trò</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">Trạng thái</TableHead>
                  <TableHead className="font-bold text-gray-700 text-center">
                    <div className="flex items-center gap-1">
                      Ngày đăng ký
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {
                        setDateSort(dateSort === 'ASC' ? 'DESC' : dateSort === 'DESC' ? 'NONE' : 'ASC');
                        setIdSort('NONE'); setNameSort('NONE');
                      }}>
                        <ArrowUpDown className={cn("w-3.5 h-3.5", dateSort !== 'NONE' ? 'text-primary' : 'text-gray-400')} />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-700 pr-12">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <User size={40} strokeWidth={1} />
                        <p className="font-medium">Không tìm thấy người dùng nào</p>
                        <Button variant="link" onClick={() => { setSearch(''); setRoleFilter('ALL'); setStatusFilter('ALL'); }} className="text-primary font-bold">
                          Xóa bộ lọc
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="text-center font-bold text-gray-400">#{u.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{u.fullName || 'Khách hàng ẩn danh'}</span>
                          <span className="text-xs text-gray-500 font-medium">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">
                      {u.phone || <span className="text-gray-300 italic">Chưa cập nhật</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                        }`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none focus:ring-0">
                          <span className={`inline-flex justify-center items-center px-3 py-1 rounded-full text-xs font-bold w-[130px] cursor-pointer hover:opacity-80 transition-opacity border ${u.isActive ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-500 border-red-100'
                            }`}>
                            <span className="flex-1 text-center">{u.isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
                            <ChevronDown className="ml-1 w-4 h-4 opacity-50" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48">
                          <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-3 py-2 uppercase tracking-widest">CHỌN TRẠNG THÁI</DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1 bg-gray-50" />
                          <DropdownMenuRadioGroup
                            value={u.isActive ? 'true' : 'false'}
                            onValueChange={val => {
                              if (val === 'true' && !u.isActive) handleUnlock(u.id);
                              if (val === 'false' && u.isActive) setConfirmBanId(u.id);
                            }}
                          >
                            <DropdownMenuRadioItem value="true" className="cursor-pointer rounded-xl text-blue-600 font-semibold px-3 py-2 pr-10 transition-colors hover:bg-blue-50 text-[11px] whitespace-nowrap">Đang hoạt động</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="false" className="cursor-pointer rounded-xl text-red-500 font-semibold px-3 py-2 pr-10 transition-colors hover:bg-red-50 text-[11px] whitespace-nowrap">Khóa tài khoản</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-gray-500 font-medium text-sm">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRoleChange(u.id, u.role)}
                          className="h-9 w-9 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full cursor-pointer transition-all"
                          title="Phân quyền"
                        >
                          <ArrowRightLeft size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer transition-all"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Đổi quyền User Confirmation Dialog */}
      <AlertDialog open={confirmRoleId !== null} onOpenChange={(open) => !open && setConfirmRoleId(null)}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận phân quyền</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {confirmRoleId && (
                <>
                  Bạn có chắc chắn muốn chuyển tài khoản <b className="text-gray-900">#{confirmRoleId.id}</b> từ vai trò <b className="text-gray-900">{confirmRoleId.currentRole}</b> sang <b className="text-primary">{confirmRoleId.currentRole === 'ADMIN' ? 'USER' : 'ADMIN'}</b>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-gray-200 cursor-pointer">Trở lại</AlertDialogCancel>
            <AlertDialogAction onClick={doChangeRole} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer border-none">
              Xác nhận đổi quyền
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Confirmation Dialog */}
      <AlertDialog open={confirmBanId !== null} onOpenChange={(open) => !open && setConfirmBanId(null)}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận khóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Bạn đang chuẩn bị khóa tài khoản <b className="text-gray-900">#{confirmBanId}</b>. Người dùng này sẽ không thể đăng nhập vào hệ thống FruiTaste cho đến khi được mở lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-gray-200 cursor-pointer">Trở lại</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmBanId && handleLock(confirmBanId)} className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer border-none">
              Khóa tài khoản ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-[2.5rem] border-none p-8">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-2">
              <Trash2 className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-gray-900 leading-tight">
              Gỡ bỏ tài khoản?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 font-medium text-sm leading-relaxed">
              Bạn đang chuẩn bị gỡ bỏ tài khoản <b className="text-gray-900">#{confirmDeleteId}</b>. 
              Tài khoản này sẽ bị ẩn khỏi danh sách và không thể đăng nhập.
              <br/><br/>
              <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider bg-blue-50 p-3 rounded-xl block">
                Lưu ý: Email của tài khoản này sẽ được giải phóng để người dùng có thể đăng ký lại nếu cần.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-2xl h-12 flex-1 font-bold border-gray-100 hover:bg-gray-50 cursor-pointer">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmDeleteId && handleDeleteUser(confirmDeleteId)}
              className="rounded-2xl h-12 flex-1 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 border-none cursor-pointer"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}