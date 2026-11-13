import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, TrendingUp, Calendar, Download } from 'lucide-react';
import adminApi from '../api/adminClient';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

interface SalesData {
  daily: Array<{
    day: string;
    orders_count: string | number;
    revenue: string | number;
    total_discounts: string | number;
  }>;
  summary: {
    total_revenue: string | number;
    total_orders: string | number;
    avg_order_value: string | number;
  };
}

interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: string | number;
  total_revenue: string | number;
}

export const ReportsPage: React.FC = () => {
  const [sales, setSales] = useState<SalesData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [salesRes, topRes] = await Promise.all([
        adminApi.get('/reports/sales', { params: { from, to } }),
        adminApi.get('/reports/top-products', { params: { from, to, limit: 15 } }),
      ]);
      setSales(salesRes.data.data);
      setTopProducts(topRes.data.data ?? []);
    } catch (err) {
      console.error('Falha ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [from, to]);

  const handleExportCSV = async () => {
    try {
      const res = await adminApi.get('/reports/inventory-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Relatório CSV de estoque baixado!');
    } catch {
      toast.error('Falha ao exportar CSV.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-nude-700">
            Inteligência Comercial
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-1">
            Relatórios & Indicadores de Venda
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" />
            <span>Exportar CSV Estoque</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-nude-600" />
          <span className="font-semibold text-gray-700">Período de Análise:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
          />
          <span className="text-gray-400">até</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Spinner />
          <p className="text-xs text-gray-400 mt-2">Calculando métricas comerciais...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {sales?.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Faturamento Efetivado
                </span>
                <span className="text-2xl font-serif font-bold text-nude-900">
                  {formatCurrency(sales.summary.total_revenue)}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  Vendas confirmadas e concluídas
                </p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Total de Pedidos
                </span>
                <span className="text-2xl font-serif font-bold text-gray-900">
                  {sales.summary.total_orders}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  Volume de pedidos no período
                </p>
              </div>

              <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  Ticket Médio
                </span>
                <span className="text-2xl font-serif font-bold text-emerald-800">
                  {formatCurrency(sales.summary.avg_order_value)}
                </span>
                <p className="text-[11px] text-gray-400 mt-1">
                  Valor médio por pedido realizado
                </p>
              </div>
            </div>
          )}

          {/* Daily Sales Table & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-nude-700" />
                <span>Ranking dos Mais Vendidos no Período</span>
              </h2>

              {topProducts.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">Sem dados no período.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {topProducts.map((p, idx) => (
                    <div key={p.product_id} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-nude-50 text-nude-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-900">{p.product_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{p.total_sold} un</span>
                        <span className="text-gray-400 text-[10px] block">
                          {formatCurrency(p.total_revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-nude-700" />
                <span>Evolução Diária de Vendas</span>
              </h2>

              {!sales?.daily || sales.daily.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">Nenhuma venda diária no período.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {sales.daily.map((d) => (
                    <div key={d.day} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-gray-800">
                          {new Date(d.day).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-gray-400 text-[11px] block">
                          {d.orders_count} {Number(d.orders_count) === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </div>
                      <span className="font-serif font-bold text-gray-900">
                        {formatCurrency(d.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

