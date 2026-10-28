import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { FeeRecord, Student } from '../types/index.ts';
import { Modal } from '../components/Modal.tsx';
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Search,
  Filter,
  Plus,
  Printer,
  Calendar,
} from 'lucide-react';

export const FeesPage: React.FC = () => {
  const { role, isAdmin, isStudent, user } = useAuth();

  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Modal
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Online Banking');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // View Receipt Modal
  const [viewReceipt, setViewReceipt] = useState<FeeRecord | null>(null);

  useEffect(() => {
    loadFees();
  }, [statusFilter]);

  const loadFees = async () => {
    try {
      setLoading(true);
      const studentId = isStudent ? user?.studentProfile?.id : undefined;
      const data = await api.getFees({
        status: statusFilter || undefined,
        studentId,
      });
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (fee: FeeRecord) => {
    setSelectedFeeForPayment(fee);
    setPaymentAmount(fee.pendingAmount);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeForPayment) return;
    try {
      setIsProcessingPayment(true);
      const updated = await api.recordPayment(
        selectedFeeForPayment.id,
        paymentAmount,
        paymentMethod
      );
      setSelectedFeeForPayment(null);
      setViewReceipt(updated);
      await loadFees();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const filteredFees = fees.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.studentName?.toLowerCase().includes(term) ||
      f.rollNumber?.toLowerCase().includes(term) ||
      f.title?.toLowerCase().includes(term) ||
      f.receiptNumber?.toLowerCase().includes(term)
    );
  });

  const totalBilled = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + f.pendingAmount, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Tuition & Fee Invoices' : 'Tuition & Fee Management'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track student vouchers, due dates, payments, and generate official payment receipts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Billed Fees
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalBilled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all registered student accounts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Collected
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            ${totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}% collected successfully
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Pending Dues
          </span>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            ${totalPending.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Awaiting reconciliation</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, roll number, or receipt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No fee records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student / Roll</th>
                  <th className="px-4 py-3.5">Fee Title</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Paid</th>
                  <th className="px-4 py-3.5">Pending</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>{fee.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {fee.studentCode} • Roll {fee.rollNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{fee.title}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ${fee.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-600">
                      ${fee.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-amber-600">
                      ${fee.pendingAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{fee.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : fee.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {fee.receiptNumber && (
                        <button
                          onClick={() => setViewReceipt(fee)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-[11px] inline-flex items-center gap-1"
                          title="View official receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Receipt
                        </button>
                      )}
                      {fee.pendingAmount > 0 && (
                        <button
                          onClick={() => handleOpenPayment(fee)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Collect Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedFeeForPayment && (
        <Modal
          isOpen={!!selectedFeeForPayment}
          onClose={() => setSelectedFeeForPayment(null)}
          title="Collect Fee Payment"
          subtitle={`${selectedFeeForPayment.title} • Student: ${selectedFeeForPayment.studentName}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
              <span className="text-slate-500">Current Outstanding Balance:</span>
              <span className="font-extrabold text-amber-600">
                ${selectedFeeForPayment.pendingAmount.toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Amount ($) *
              </label>
              <input
                type="number"
                min="1"
                max={selectedFeeForPayment.pendingAmount}
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Online Banking">Online Banking / Wire</option>
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Cash">Cash at University Cashier</option>
                <option value="Scholarship Grant">Scholarship / Financial Aid Grant</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFeeForPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingPayment || paymentAmount <= 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
              >
                {isProcessingPayment ? 'Processing...' : 'Confirm Payment & Generate Receipt'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Payment Receipt Modal */}
      {viewReceipt && (
        <Modal
          isOpen={!!viewReceipt}
          onClose={() => setViewReceipt(null)}
          title="Official Fee Payment Receipt"
          maxWidth="md"
        >
          <div className="space-y-6 print:p-0">
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">CampusCore University</h4>
                  <p className="text-[11px] text-slate-500">Office of the Bursar & Financial Services</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Receipt Number</div>
                  <div className="font-mono font-bold text-indigo-700 text-xs">
                    {viewReceipt.receiptNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Billed To:</span>
                  <div className="font-bold text-slate-900">{viewReceipt.studentName}</div>
                  <div className="font-mono text-slate-500 text-[11px]">ID: {viewReceipt.studentCode}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Payment Date:</span>
                  <div className="font-semibold text-slate-800">
                    {viewReceipt.paidDate || new Date().toISOString().split('T')[0]}
                  </div>
                  <div className="text-slate-500 text-[11px]">{viewReceipt.paymentMethod}</div>
                </div>
              </div>

              <div className="border-t border-b border-slate-200 py-3 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>{viewReceipt.title}</span>
                  <span>${viewReceipt.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Amount Paid to Date</span>
                  <span className="text-emerald-600 font-bold">${viewReceipt.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Remaining Dues</span>
                  <span className="font-bold">${viewReceipt.pendingAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-slate-700">Payment Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {viewReceipt.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={() => setViewReceipt(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
