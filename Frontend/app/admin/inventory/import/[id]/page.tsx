'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import {
  Package, Calendar, FileText, ArrowLeft, RefreshCw,
  Layers, ArrowUpRight, Hash, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BackButton from '@/components/BackButton';

export default function AdminImportDetailPage() {
  const params = useParams();
  const importId = params?.id ? String(params.id) : '';
  const [receiver, setReceiver] = useState('');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImportDetails = async () => {
    try {
      setLoading(true);
      // Fetch all stock transactions and filter client-side since there's no single import receipt detail API
      const res = await api.get('/inventory/transactions');
      const filtered = res.data.filter((t: any) => t.referenceId === importId && t.type === 'IMPORT');
      setTransactions(filtered);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin chi tiết phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (importId) {
      fetchImportDetails();
    }
  }, [importId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="animate-spin text-primary w-10 h-10" />
        <p className="text-gray-400 font-bold">Đang tải chi tiết phiếu nhập...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <BackButton />
        <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
          Không tìm thấy thông tin phiếu nhập kho #{importId} hoặc phiếu không tồn tại.
        </div>
      </div>
    );
  }

  // Extract shared metadata from the first transaction in the group
  const sampleTx = transactions[0];
  const importDate = new Date(sampleTx.createdAt);
  const note = sampleTx.reason || 'Nhập kho hàng hóa';

  // Calculate stats
  const totalItems = transactions.length;
  const totalQuantity = transactions.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="p-6 md:p-8 space-y-6 w-full h-full overflow-y-auto bg-gray-50/30">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Chi tiết phiếu nhập kho #{importId}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            Thời gian: {format(importDate, "HH:mm:ss dd/MM/yyyy", { locale: vi })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-base font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Package size={16} className="text-primary" /> Danh sách sản phẩm nhập
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 text-sm font-bold text-gray-700 ml-1">Sản phẩm</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Số lượng nhập</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Tồn trước nhập</th>
                      <th className="text-center p-4 text-sm font-bold text-gray-700 ml-1">Tồn sau nhập</th>
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
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-xs border border-green-100/50">
                            +{tx.quantity} {tx.product?.unit || 'cái'}
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
              <FileText size={14} className="text-primary" /> Thông tin phiếu nhập
            </h4>

            <div className="space-y-4">
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
                <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-3">
                  <span className="text-[9px] font-black text-green-600 uppercase tracking-wider block mb-1">Tổng số lượng</span>
                  <span className="text-lg font-black text-green-700 flex items-center gap-1">
                    <ArrowUpRight size={14} /> {totalQuantity}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold">Người lập phiếu</span>
                  <span className="text-gray-800 font-bold flex items-center gap-1">
                    <ShieldCheck size={13} className="text-green-500" /> {receiver}
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
