'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import {
  Package, Calendar, Clock, FileText, ArrowLeft, RefreshCw,
  Layers, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackButton from '@/components/BackButton';

export default function AdminExportDetailPage() {
  const params = useParams();
  const exportId = params?.id ? String(params.id) : '';
  const [receiver, setReceiver] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [exportDate, setExportDate] = useState<Date | null>(null);
  const [createdTime, setCreatedTime] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExportDetails = async () => {
    try {
      setLoading(true);
      // Fetch all stock transactions and filter client-side
      const [txRes, receiptRes] = await Promise.all([
        api.get('/inventory/transactions'),
        api.get(`/inventory/export/${exportId}`).catch(err => {
          console.error("Failed to fetch export receipt details", err);
          return { data: null };
        })
      ]);

      const filtered = txRes.data.filter((t: any) => t.referenceId === exportId && t.type === 'EXPORT');
      setTransactions(filtered);

      const sampleTx = filtered[0];
      if (receiptRes.data) {
        setReceiver(receiptRes.data.receiver || 'Không xác định');
        setReason(receiptRes.data.reason || '');
        setNote(receiptRes.data.note || 'Xuất kho hàng hóa');
        setExportDate(receiptRes.data.createdAt ? new Date(receiptRes.data.createdAt) : (sampleTx ? new Date(sampleTx.createdAt) : null));
        setCreatedTime(sampleTx ? new Date(sampleTx.createdAt) : (receiptRes.data.createdAt ? new Date(receiptRes.data.createdAt) : null));
      } else {
        setReceiver('Không xác định');
        setNote(sampleTx?.reason || 'Xuất kho hàng hóa');
        setExportDate(sampleTx ? new Date(sampleTx.createdAt) : null);
        setCreatedTime(sampleTx ? new Date(sampleTx.createdAt) : null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin chi tiết phiếu xuất");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exportId) {
      fetchExportDetails();
    }
  }, [exportId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-primary w-10 h-10" />
        <p className="text-gray-400 font-bold">Đang tải chi tiết phiếu xuất...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <BackButton />
        <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
          Không tìm thấy thông tin phiếu xuất kho #{exportId} hoặc phiếu không tồn tại.
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalItems = transactions.length;
  const totalQuantity = transactions.reduce((acc, curr) => acc + Math.abs(curr.quantity), 0);

  const getReasonLabel = (r: string) => {
    switch (r) {
      case 'damaged': return 'Hỏng hóc / Dập nát';
      case 'internal': return 'Tiêu dùng nội bộ';
      default: return 'Khác';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto bg-gray-50/30">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Chi tiết phiếu xuất kho #{exportId}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1.5">
            <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              Ngày xuất hàng: {exportDate ? format(exportDate, "dd/MM/yyyy", { locale: vi }) : '--'}
            </p>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Clock size={12} className="text-gray-300" />
              Thời điểm tạo phiếu: {createdTime ? format(createdTime, "HH:mm:ss dd/MM/yyyy", { locale: vi }) : '--'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Package size={16} className="text-primary" /> Danh sách sản phẩm xuất
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-bold text-gray-700 ml-1">Sản phẩm</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Số lượng xuất</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Tồn trước xuất</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Tồn sau xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-gray-900">{tx.product?.name || 'Sản phẩm đã xóa'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Mã SP: #{tx.productId}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full font-bold text-xs border border-red-100/50">
                            {tx.quantity} {tx.product?.unit || 'cái'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-semibold text-gray-500">
                          {tx.previousStock} {tx.product?.unit || 'cái'}
                        </td>
                        <td className="p-4 text-center font-bold text-gray-800">
                          {tx.newStock} {tx.product?.unit || 'cái'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Receipt info */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden p-6 space-y-4">
            <h4 className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2 border-b pb-3">
              <FileText size={14} className="text-primary" /> Thông tin phiếu xuất
            </h4>

            <div className="space-y-4">
              {reason && (
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Lý do xuất</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {getReasonLabel(reason)}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ghi chú phiếu</span>
                <p className="text-sm text-gray-700 font-semibold leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  {note}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-3">
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider block mb-1">Tổng mặt hàng</span>
                  <span className="text-lg font-black text-orange-600 flex items-center gap-1">
                    <Layers size={14} /> {totalItems}
                  </span>
                </div>
                <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-3">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block mb-1">Tổng số lượng</span>
                  <span className="text-lg font-black text-blue-700 flex items-center gap-1">
                    <ArrowUpRight size={14} /> {totalQuantity}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">Người xuất kho / Nhận</span>
                  <span className="text-gray-800 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} className="text-blue-500" /> {receiver}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
