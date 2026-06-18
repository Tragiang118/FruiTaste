'use client';

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore, useAuthStore } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/utils";

interface CartItemRowProps {
  item: any;
  updateQuantity: (id: number, quantity: number) => void;
  setItemToDelete: (id: number | null) => void;
  itemToDelete: number | null;
  selectedIds: number[];
  handleSelect: (id: number) => void;
  getImageUrl: (image: any) => any;
}

function CartItemRow({
  item,
  updateQuantity,
  setItemToDelete,
  itemToDelete,
  selectedIds,
  handleSelect,
  getImageUrl,
}: CartItemRowProps) {
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity, itemToDelete]);

  return (
    <div className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-gray-150 shadow-md relative group">
      <Checkbox
        checked={selectedIds.includes(item.id)}
        onCheckedChange={() => handleSelect(item.id)}
        className="mr-2"
        aria-label={`Chọn ${item.name}`}
      />
      <div className="w-20 h-20 bg-[#FFF4E6] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate pr-6">{item.name}</h4>
        <p className="text-[#FF6B4A] font-medium mt-1">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
        </p>
        <div className="flex items-center gap-2 mt-2 border border-gray-100 rounded-full w-fit bg-gray-50 p-0.5">
          <button
            onClick={() => {
              if (item.quantity <= 1) {
                setItemToDelete(item.id);
              } else {
                updateQuantity(item.id, item.quantity - 1);
              }
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-sm hover:text-[#FF6B4A] cursor-pointer"
          >
            <Minus size={14} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val === '') {
                setInputValue('');
              } else {
                const num = parseInt(val, 10);
                if (num === 0) {
                  setInputValue('0');
                } else {
                  const finalNum = Math.min(num, item.stockQuantity);
                  setInputValue(finalNum.toString());
                  updateQuantity(item.id, finalNum);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (inputValue === '0' || inputValue === '') {
                  setItemToDelete(item.id);
                } else {
                  e.currentTarget.blur();
                }
              }
            }}
            onBlur={() => {
              if (inputValue === '0' || inputValue === '') {
                setItemToDelete(item.id);
              }
            }}
            className="w-8 text-center font-bold text-sm bg-transparent border-none outline-none focus:ring-0 p-0 text-gray-900"
            placeholder="0"
          />
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stockQuantity}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-sm disabled:opacity-50 hover:text-[#FF6B4A] cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <button
        onClick={() => setItemToDelete(item.id)}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function CartSheet() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { items: cartItems, updateQuantity, removeItem, selectedIds, setSelectedIds } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const items = isAuthenticated ? cartItems : [];

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      removeItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    if (itemToDelete !== null) {
      const currentItem = items.find(i => i.id === itemToDelete);
      if (currentItem && currentItem.quantity === 0) {
        updateQuantity(itemToDelete, 1);
      }
      setItemToDelete(null);
    }
  };
  // Chọn/bỏ chọn 1 item
  const handleSelect = (id: number) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };
  
  // Chọn/bỏ chọn tất cả
  // allSelected: Khi tất cả item hiện có trong giỏ đều nằm trong selectedIds
  const allSelected = items.length > 0 && items.every(i => selectedIds.includes(i.id));
  
  const handleSelectAll = () => {
    if (allSelected) {
      // Bỏ chọn tất cả các item đang hiển thị
      setSelectedIds(selectedIds.filter(id => !items.find(item => item.id === id)));
    } else {
      // Chọn tất cả các item đang hiển thị (gộp với những gì đã chọn trước đó nếu có)
      const newIds = [...selectedIds];
      items.forEach(item => {
        if (!newIds.includes(item.id)) newIds.push(item.id);
      });
      setSelectedIds(newIds);
    }
  };

  // Chỉ tính tổng các item đã chọn ĐANG CÓ trong giỏ hàng
  const selectedItems = items.filter(i => selectedIds.includes(i.id));
  const totalSelectedPrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  // Tổng số lượng tất cả item (hiển thị ngoài icon)
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="relative text-gray-700 hover:!bg-[#FFF4E6] hover:text-[#FF6B4A] rounded-full w-10 h-10 transition-colors">
        <ShoppingCart size={22} className="stroke-[2.5px]" />
      </Button>
    );
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-700 hover:!bg-[#FFF4E6] hover:!text-[#FF6B4A] rounded-full w-10 h-10 transition-colors cursor-pointer">
          <ShoppingCart size={22} className="stroke-[2.5px]" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF6B4A] text-white text-[11px] leading-none font-bold w-[22px] h-[22px] flex items-center justify-center rounded-full border-2 border-white pb-[1px]">   
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-[#FFFDFB] flex flex-col p-6 rounded-l-[2.5rem] z-[99999] border-none shadow-2xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#FF6B4A]" /> Giỏ hàng của bạn
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 flex flex-col gap-4">
          {items.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} id="select-all-cart" />
              <label htmlFor="select-all-cart" className="text-sm text-gray-700 select-none cursor-pointer">Chọn tất cả</label>
            </div>
          )}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart size={64} className="text-gray-200 mb-4" />
              <p>Giỏ hàng đang trống.</p>
              {!isAuthenticated ? (
                <>
                  <p className="text-sm mt-2 text-center">Vui lòng đăng nhập để thêm và thanh toán sản phẩm.</p>
                  <Link href="/login" className="mt-4">
                    <Button className="rounded-full bg-[#FF6B4A] hover:bg-[#E55A39] text-white cursor-pointer">Đăng nhập ngay</Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm mt-2">Hãy khám phá thêm trái cây tươi nhé!</p>
              )}
            </div>
          ) : (
            items.map((item, index) => (
              <CartItemRow
                key={item.id + '-' + index}
                item={item}
                updateQuantity={updateQuantity}
                setItemToDelete={setItemToDelete}
                itemToDelete={itemToDelete}
                selectedIds={selectedIds}
                handleSelect={handleSelect}
                getImageUrl={getImageUrl}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-center w-full">
              <span className="text-gray-600 font-medium">Tổng cộng (đã chọn):</span>
              <span className="text-2xl font-black text-[#FF6B4A]">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSelectedPrice)}
              </span>
            </div>
            <Button
              className="w-full py-6 rounded-full bg-[#1A1A1A] hover:bg-black text-white text-lg font-bold shadow-lg mt-2 cursor-pointer"
              disabled={selectedItems.length === 0}
              onClick={() => {
                setOpen(false);
                router.push('/checkout');
              }}
            >
              {selectedItems.length === 0 ? "Chọn sản phẩm để mua" : "Thanh toán ngay"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>

      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => { if (!open) cancelDelete(); }}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Số lượng tối thiểu là 1. Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} className="rounded-full border-gray-200 cursor-pointer">Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-red-500 hover:bg-red-600 text-white cursor-pointer">Xóa sản phẩm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}