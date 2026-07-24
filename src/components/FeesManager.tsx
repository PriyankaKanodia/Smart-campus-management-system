import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  DollarSign, 
  Sparkles,
  Clock,
  Printer,
  Download,
  Send,
  Award,
  PieChart as PieChartIcon,
  BarChart3,
  History,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Fee, Student } from '../types';
import { useToast } from './Toast';

interface FeesManagerProps {
  fees: Fee[];
  students: Student[];
  onAdd: (data: any) => Promise<void>;
  onPay?: (feeId: string, details?: any) => Promise<void>;
  user: any;
}

export default function FeesManager({
  fees,
  students,
  onAdd,
  onPay,
  user
}: FeesManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'ledger' | 'analytics' | 'history' | 'scholarships' | 'alerts'>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState<Fee | null>(null);
  const [receiptFee, setReceiptFee] = useState<Fee | null>(null);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState<number | null>(null);

  // Form state for creating new invoice
  const [formData, setFormData] = useState({
    studentId: '',
    amount: 1800,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'tuition' as const,
    scholarshipName: 'None',
    scholarshipAmount: 0,
    fineAmount: 0,
    enableInstallments: false,
    installmentsCount: 2
  });

  // Payment Gateway simulation state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'bank_transfer' | 'netbanking' | 'wallet'>('card');
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardHolder, setCardHolder] = useState(user?.name?.toUpperCase() || 'STUDENT NAME');
  const [upiId, setUpiId] = useState('student@upi');

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'amount' || name === 'scholarshipAmount' || name === 'fineAmount' || name === 'installmentsCount' ? Number(value) : value 
      }));
    }
  };

  const openAddModal = () => {
    setFormData({
      studentId: students[0]?._id || '',
      amount: 1800,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'tuition',
      scholarshipName: 'None',
      scholarshipAmount: 0,
      fineAmount: 0,
      enableInstallments: false,
      installmentsCount: 2
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.studentId) {
        toast('Please select a student for invoice issuance.', 'error');
        return;
      }

      let installmentSchedule = undefined;
      if (formData.enableInstallments && formData.installmentsCount > 1) {
        const netAmount = Math.max(0, formData.amount - formData.scholarshipAmount + formData.fineAmount);
        const eachAmount = Math.round(netAmount / formData.installmentsCount);
        installmentSchedule = Array.from({ length: formData.installmentsCount }).map((_, idx) => ({
          installmentNo: idx + 1,
          amount: eachAmount,
          dueDate: new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'unpaid' as const
        }));
      }

      await onAdd({
        ...formData,
        installments: installmentSchedule
      });
      toast('Student Fee Invoice generated successfully!', 'success');
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast(`Invoice issuance failed: ${err.message}`, 'error');
    }
  };

  const triggerPaymentSimulation = async () => {
    if (!payingFee || !onPay) return;
    setIsPaying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const generatedTxnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      
      await onPay(payingFee._id, {
        paymentMethod,
        transactionId: generatedTxnId,
        installmentIndex: selectedInstallmentIndex
      });

      toast(`Payment successful! Transaction Reference: ${generatedTxnId}`, 'success');
      setPayingFee(null);
      setSelectedInstallmentIndex(null);
    } catch (err: any) {
      toast(`Payment failed: ${err.message}`, 'error');
    } finally {
      setIsPaying(false);
    }
  };

  const sendPendingAlert = (studentName: string, amount: number) => {
    toast(`Payment reminder SMS & Email alert dispatched to ${studentName} for outstanding bill of $${amount}.`, 'info');
  };

  const getStudentObj = (studentId: string) => {
    return students.find(s => s._id === studentId);
  };

  const getStudentNameAndRoll = (studentId: string) => {
    const student = getStudentObj(studentId);
    return student ? `${student.name} (${student.rollNumber})` : 'Unknown Student';
  };

  // Calculate Overdue Fine automatically if due date < today and unpaid
  const calculateAutoFine = (fee: Fee) => {
    if (fee.status === 'paid') return fee.fineAmount || 0;
    const due = new Date(fee.dueDate).getTime();
    const now = Date.now();
    if (now > due) {
      const daysOverdue = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return (fee.fineAmount || 0) + Math.min(100, daysOverdue * 5); // $5 per day overdue, max $100
    }
    return fee.fineAmount || 0;
  };

  const getNetPayable = (fee: Fee) => {
    const gross = fee.amount || 0;
    const scholarship = fee.scholarshipAmount || 0;
    const fine = calculateAutoFine(fee);
    return Math.max(0, gross - scholarship + fine);
  };

  // Statistics
  const totalInvoiced = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + getNetPayable(f), 0);
  const totalUnpaid = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + getNetPayable(f), 0);
  const totalScholarship = fees.reduce((sum, f) => sum + (f.scholarshipAmount || 0), 0);

  // Filtered lists
  const filteredFees = fees.filter(fee => {
    const student = getStudentObj(fee.studentId);
    const matchesSearch = student 
      ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const matchesStatus = selectedStatus === 'all' || fee.status === selectedStatus;
    const matchesType = selectedType === 'all' || fee.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const paidHistory = fees.filter(f => f.status === 'paid');
  const pendingAlerts = fees.filter(f => f.status !== 'paid');

  // Recharts Data Prep
  const chartCategoryData = [
    { name: 'Tuition', value: fees.filter(f => f.type === 'tuition').reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Hostel', value: fees.filter(f => f.type === 'hostel').reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Library', value: fees.filter(f => f.type === 'library').reduce((sum, f) => sum + f.amount, 0) },
    { name: 'Exam', value: fees.filter(f => f.type === 'exam').reduce((sum, f) => sum + f.amount, 0) },
  ];

  const chartMonthlyData = [
    { month: 'Jan', collected: 24000, pending: 4000 },
    { month: 'Feb', collected: 32000, pending: 6000 },
    { month: 'Mar', collected: 28000, pending: 3500 },
    { month: 'Apr', collected: 45000, pending: 8000 },
    { month: 'May', collected: 38000, pending: 5000 },
    { month: 'Jun', collected: totalPaid || 52000, pending: totalUnpaid || 9000 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="text-indigo-600" size={22} />
            Institutional Fee Management & Financial Gateway
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Online checkout, scholarship waivers, fine calculator, installment plans, digital receipts & analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              onClick={openAddModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 shrink-0"
            >
              <Plus size={16} /> Issue Fee Invoice
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Total Invoiced</span>
            <FileText size={16} className="text-indigo-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 font-mono">${totalInvoiced.toLocaleString()}</h4>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">Total {fees.length} billing items</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Collected Revenue</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <h4 className="text-2xl font-bold text-emerald-600 font-mono">${totalPaid.toLocaleString()}</h4>
          <span className="text-[10px] text-emerald-600 font-mono block mt-1 font-medium">
            {totalInvoiced ? Math.round((totalPaid / totalInvoiced) * 100) : 0}% Realization Index
          </span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Outstanding Due</span>
            <AlertCircle size={16} className="text-rose-600" />
          </div>
          <h4 className="text-2xl font-bold text-rose-600 font-mono">${totalUnpaid.toLocaleString()}</h4>
          <span className="text-[10px] text-rose-500 font-mono block mt-1 font-medium">Auto-fines applied</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider">Scholarships Awarded</span>
            <Award size={16} className="text-amber-600" />
          </div>
          <h4 className="text-2xl font-bold text-amber-600 font-mono">${totalScholarship.toLocaleString()}</h4>
          <span className="text-[10px] text-amber-600 font-mono block mt-1 font-medium">Institutional Waivers</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard size={14} /> Fee Ledgers & Invoices
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={14} /> Financial Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={14} /> Payment History
        </button>
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'scholarships' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award size={14} /> Scholarships & Fines
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
            activeTab === 'alerts' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send size={14} /> Pending Alerts ({pendingAlerts.length})
        </button>
      </div>

      {/* 1. LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice by student name or roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Filter size={14} /> Category:
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Fee Types</option>
                <option value="tuition">Tuition Charges</option>
                <option value="hostel">Hostel Accommodations</option>
                <option value="library">Library Cards</option>
                <option value="exam">Examinations</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="paid">Paid (Cleared)</option>
                <option value="unpaid">Unpaid (Outstanding)</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-5">Student Owner</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5 text-right font-mono">Gross Fee</th>
                    <th className="py-3.5 px-5 text-right font-mono">Scholarship / Fine</th>
                    <th className="py-3.5 px-5 text-right font-mono">Net Payable</th>
                    <th className="py-3.5 px-5">Due Date Limit</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <CreditCard size={32} className="mx-auto mb-2 text-slate-300" />
                        No billing ledgers match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredFees.map((fee) => {
                      const autoFine = calculateAutoFine(fee);
                      const netPayable = getNetPayable(fee);
                      const isOverdue = new Date(fee.dueDate).getTime() < Date.now() && fee.status !== 'paid';

                      return (
                        <tr key={fee._id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-800">{getStudentNameAndRoll(fee.studentId)}</div>
                            {fee.installments && fee.installments.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-0.5 font-medium">
                                <Layers size={10} /> {fee.installments.filter(i => i.status === 'paid').length}/{fee.installments.length} Installments Paid
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="capitalize px-2.5 py-0.5 rounded-full font-medium text-xs bg-slate-100 text-slate-700 border border-slate-200">
                              {fee.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-right text-slate-700">
                            ${fee.amount?.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-right">
                            {fee.scholarshipAmount ? (
                              <span className="text-emerald-600 font-semibold block text-[11px]">
                                -${fee.scholarshipAmount} ({fee.scholarshipName || 'Scholarship'})
                              </span>
                            ) : null}
                            {autoFine ? (
                              <span className="text-rose-600 font-semibold block text-[11px]">
                                +${autoFine} (Late Fine)
                              </span>
                            ) : null}
                            {!fee.scholarshipAmount && !autoFine && <span className="text-slate-400">-</span>}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-right font-bold text-slate-900">
                            ${netPayable.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                              <Clock size={12} className={isOverdue ? "text-rose-500" : "text-slate-400"} />
                              <span className={isOverdue ? "text-rose-600 font-semibold" : ""}>
                                {fee.dueDate} {isOverdue ? '(Overdue)' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              fee.status === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : fee.status === 'unpaid'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {fee.status === 'paid' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                              <span className="capitalize">{fee.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {fee.status !== 'paid' ? (
                                <button
                                  onClick={() => {
                                    setPayingFee(fee);
                                    setSelectedInstallmentIndex(null);
                                  }}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
                                >
                                  <Sparkles size={12} /> Pay Online
                                </button>
                              ) : (
                                <button
                                  onClick={() => setReceiptFee(fee)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 border border-slate-200"
                                >
                                  <Printer size={12} /> Receipt PDF
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-600" /> Monthly Revenue Collection ($)
            </h4>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="collected" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Collected" />
                  <Bar dataKey="pending" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <PieChartIcon size={16} className="text-indigo-600" /> Revenue Distribution by Fee Category
            </h4>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              {chartCategoryData.map((cat, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-600 font-medium">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <History size={16} className="text-emerald-600" /> Completed Payment Audit Log
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="py-3 px-4">Transaction Reference</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 font-mono text-right">Amount Cleared</th>
                  <th className="py-3 px-4">Payment Timestamp</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No completed payments recorded in database history.
                    </td>
                  </tr>
                ) : (
                  paidHistory.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {fee.transactionId || `TXN-${fee._id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {getStudentNameAndRoll(fee.studentId)}
                      </td>
                      <td className="py-3 px-4 capitalize">{fee.type}</td>
                      <td className="py-3 px-4 uppercase font-mono font-medium text-slate-600">
                        {fee.paymentMethod || 'Card'}
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-bold text-emerald-600">
                        ${getNetPayable(fee).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : 'Recently'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setReceiptFee(fee)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SCHOLARSHIPS TAB */}
      {activeTab === 'scholarships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Active Campus Scholarship Grants
            </h4>
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-amber-900 text-xs">Academic Excellence Merit Waiver</h5>
                  <p className="text-[11px] text-amber-700 mt-0.5">25% waiver on annual tuition fees for GPA &gt; 3.8 students.</p>
                </div>
                <span className="font-mono font-bold text-amber-800 text-xs">25% OFF</span>
              </div>

              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-indigo-900 text-xs">Need-Based Assistance Grant</h5>
                  <p className="text-[11px] text-indigo-700 mt-0.5">$500 fixed grant per semester for eligible applicants.</p>
                </div>
                <span className="font-mono font-bold text-indigo-800 text-xs">$500 FLAT</span>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-emerald-900 text-xs">Varsity Athletics & Sports Scholarship</h5>
                  <p className="text-[11px] text-emerald-700 mt-0.5">30% tuition reduction for university athletes.</p>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs">30% OFF</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" /> Institutional Fine Calculator Rules
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <p><strong className="text-slate-800">1. Grace Period:</strong> 3 days after due date without fine.</p>
              <p><strong className="text-slate-800">2. Daily Overdue Charge:</strong> $5 per day overdue after grace period.</p>
              <p><strong className="text-slate-800">3. Maximum Fine Cap:</strong> Capped at maximum $100 per semester invoice.</p>
              <p><strong className="text-slate-800">4. Examination Block:</strong> Unpaid fees exceeding 30 days overdue block admit card generation.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Send size={16} className="text-indigo-600" /> Pending Fee Notification Dispatches
            </h4>
            <span className="text-xs text-slate-500">Auto-sends SMS & Email Alerts to registered guardians & students.</span>
          </div>

          <div className="space-y-2">
            {pendingAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No outstanding fees require alert dispatches.</p>
            ) : (
              pendingAlerts.map((fee) => {
                const student = getStudentObj(fee.studentId);
                const net = getNetPayable(fee);
                return (
                  <div key={fee._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{getStudentNameAndRoll(fee.studentId)}</h5>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Due: {fee.dueDate} | Type: <span className="capitalize">{fee.type}</span> | Net Amount: ${net}
                      </p>
                    </div>
                    <button
                      onClick={() => sendPendingAlert(student?.name || 'Student', net)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Send size={12} /> Dispatch Alert
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Issue Invoice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-14 bg-slate-900 px-5 flex items-center justify-between text-white shrink-0">
              <h3 className="font-display font-semibold text-base">Generate Student Fee Invoice</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Enrolled Student</label>
                <select
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
                >
                  <option value="" disabled>-- Select Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Billing Category</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
                  >
                    <option value="tuition">Tuition Fee</option>
                    <option value="hostel">Hostel Fee</option>
                    <option value="library">Library Access</option>
                    <option value="exam">Examination Assessment</option>
                    <option value="transport">Fleet Transport</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gross Fee Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min={10}
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scholarship Grant</label>
                  <select
                    name="scholarshipName"
                    value={formData.scholarshipName}
                    onChange={(e) => {
                      const name = e.target.value;
                      let amt = 0;
                      if (name === 'Merit Scholarship') amt = Math.round(formData.amount * 0.25);
                      if (name === 'Need-Based Assistance') amt = 500;
                      if (name === 'Sports Grant') amt = Math.round(formData.amount * 0.30);
                      setFormData(prev => ({ ...prev, scholarshipName: name, scholarshipAmount: amt }));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none bg-white font-medium"
                  >
                    <option value="None">None</option>
                    <option value="Merit Scholarship">Merit Waiver (25%)</option>
                    <option value="Need-Based Assistance">Need Grant ($500)</option>
                    <option value="Sports Grant">Sports Scholarship (30%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Amount ($)</label>
                  <input
                    type="number"
                    name="scholarshipAmount"
                    value={formData.scholarshipAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date Limit</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableInstallments"
                      checked={formData.enableInstallments}
                      onChange={handleInputChange}
                      className="rounded text-indigo-600 h-4 w-4"
                    />
                    Enable Installment Plan
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Calculated Net Invoice Amount:</span>
                <span className="font-mono font-bold text-indigo-600 text-sm">
                  ${Math.max(0, formData.amount - formData.scholarshipAmount + formData.fineAmount)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Payment Gateway Modal */}
      {payingFee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-indigo-950 p-5 text-white relative">
              <button 
                onClick={() => setPayingFee(null)}
                disabled={isPaying}
                className="absolute right-4 top-4 text-indigo-300 hover:text-white transition"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase font-semibold">
                <ShieldCheck size={14} /> SmartCampus Merchant Payment Gateway
              </div>
              <h3 className="text-lg font-display font-semibold mt-1">Institutional Fee Checkout</h3>
              <p className="text-xs text-indigo-300 mt-0.5">REF-{payingFee._id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-slate-700">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Bill Item</p>
                  <p className="text-slate-800 font-bold text-xs capitalize mt-0.5">{payingFee.type} Charge</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">Total Payable</p>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">${getNetPayable(payingFee)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  {[
                    { id: 'card', label: 'Card' },
                    { id: 'upi', label: 'UPI' },
                    { id: 'netbanking', label: 'NetBank' },
                    { id: 'wallet', label: 'Wallet' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl border font-semibold transition ${
                        paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase">Card Holder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-medium focus:outline-none uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase">CVV</label>
                      <input
                        type="password"
                        defaultValue="891"
                        maxLength={3}
                        className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl font-mono text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="space-y-2 text-xs">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">UPI Virtual Address</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Scan QR or authorize payment in GPay / PhonePe app.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2.5 shrink-0">
              <button 
                onClick={() => setPayingFee(null)}
                disabled={isPaying}
                className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button 
                onClick={triggerPaymentSimulation}
                disabled={isPaying}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isPaying ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authorizing...
                  </>
                ) : (
                  <>Complete Payment</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Fee Receipt Modal */}
      {receiptFee && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 space-y-4 font-sans border-b border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <Building size={28} className="text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">SMART CAMPUS UNIVERSITY</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Office of Institutional Bursar & Student Accounting</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-mono font-bold uppercase">
                    OFFICIAL RECEIPT
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    NO: REC-{receiptFee._id.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">STUDENT DETAILS</span>
                  <strong className="text-slate-900 block">{getStudentNameAndRoll(receiptFee.studentId)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">TRANSACTION HASH</span>
                  <strong className="text-indigo-600 font-mono block">{receiptFee.transactionId || 'TXN-981245'}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 capitalize">{receiptFee.type} Fee Gross Assessment</td>
                      <td className="py-2 px-3 text-right font-mono">${receiptFee.amount}</td>
                    </tr>
                    {receiptFee.scholarshipAmount ? (
                      <tr>
                        <td className="py-2 px-3 text-emerald-600 font-medium">Scholarship Grant ({receiptFee.scholarshipName})</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-600">-${receiptFee.scholarshipAmount}</td>
                      </tr>
                    ) : null}
                    <tr className="bg-slate-50/80 font-bold">
                      <td className="py-2 px-3">Total Amount Paid</td>
                      <td className="py-2 px-3 text-right font-mono text-indigo-600">${getNetPayable(receiptFee)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2">
                <span>Timestamp: {receiptFee.paidAt ? new Date(receiptFee.paidAt).toLocaleString() : new Date().toLocaleString()}</span>
                <span>Verified digitally by SmartCampus ERP</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setReceiptFee(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
