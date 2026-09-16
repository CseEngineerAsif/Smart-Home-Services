import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight,
  Receipt,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Coins,
  Banknote,
  RefreshCw,
} from 'lucide-react';
import { PaymentDetails, PaymentMethodType, PaymentPlanType, ServiceProvider } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  categoryName: string;
  provider?: ServiceProvider | null;
  baseAmount: number;
  scheduledTime: string;
  scheduledDate: string;
  location: string;
  onPaymentComplete: (payment: PaymentDetails) => void;
  // Optional if paying an existing request balance
  existingRequestId?: string;
  isSettlingRemaining?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceName,
  categoryName,
  provider,
  baseAmount,
  scheduledTime,
  scheduledDate,
  location,
  onPaymentComplete,
  existingRequestId,
  isSettlingRemaining = false,
}) => {
  // Method selection
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('bkash');
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanType>(
    isSettlingRemaining ? 'full' : 'full'
  );

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Form states per method
  // bKash
  const [bkashNumber, setBkashNumber] = useState('01712-998877');
  const [bkashStep, setBkashStep] = useState<'phone' | 'otp' | 'pin' | 'processing' | 'success'>('phone');
  const [bkashOtp, setBkashOtp] = useState('');
  const [bkashPin, setBkashPin] = useState('');

  // Nagad
  const [nagadNumber, setNagadNumber] = useState('01819-345678');
  const [nagadStep, setNagadStep] = useState<'phone' | 'otp' | 'pin' | 'processing' | 'success'>('phone');
  const [nagadOtp, setNagadOtp] = useState('');
  const [nagadPin, setNagadPin] = useState('');

  // Card
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('FAHIM ALOM');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardStep, setCardStep] = useState<'details' | '3ds' | 'processing' | 'success'>('details');
  const [cardBrand, setCardBrand] = useState<'Visa' | 'Mastercard' | 'Amex'>('Visa');
  const [card3dsOtp, setCard3dsOtp] = useState('');

  // General Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [completedPayment, setCompletedPayment] = useState<PaymentDetails | null>(null);
  const [copiedTrx, setCopiedTrx] = useState(false);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setBkashStep('phone');
      setNagadStep('phone');
      setCardStep('details');
      setIsProcessing(false);
      setCompletedPayment(null);
      setPromoApplied(false);
      setDiscountAmount(0);
      setPromoError('');
    }
  }, [isOpen]);

  const handleFinishAndProceed = () => {
    if (completedPayment) {
      onPaymentComplete(completedPayment);
      onClose();
    }
  };

  // Auto transition to booking sent confirmation popup after short delay
  useEffect(() => {
    if (completedPayment && isOpen) {
      const timer = setTimeout(() => {
        handleFinishAndProceed();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [completedPayment, isOpen]);

  // Pricing calculations
  const platformFee = 0; // Waived demo fee
  const safeBaseAmount = typeof baseAmount === 'number' && !isNaN(baseAmount) ? baseAmount : (Number(baseAmount) || 800);
  const safeDiscount = typeof discountAmount === 'number' && !isNaN(discountAmount) ? discountAmount : 0;
  const subtotal = Math.max(0, safeBaseAmount - safeDiscount);
  
  // Effective amount payable now based on plan
  let payableNow = subtotal;
  let remainingDue = 0;
  if (paymentPlan === 'advance_deposit') {
    payableNow = Math.round(subtotal * 0.15); // 15% advance deposit
    remainingDue = Math.max(0, subtotal - payableNow);
  } else if (paymentPlan === 'cash_on_delivery') {
    payableNow = 0;
    remainingDue = subtotal;
  }

  // Handle Promo Code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'SERVO50' || code === 'SAVE50') {
      const disc = Math.min(50, Math.round(baseAmount * 0.1));
      setDiscountAmount(disc);
      setPromoApplied(true);
      setPromoError('');
    } else if (code === 'EID2026' || code === 'DHAKA100') {
      const disc = Math.min(100, Math.round(baseAmount * 0.15));
      setDiscountAmount(disc);
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon. Try "SERVO50" or "DHAKA100"');
    }
  };

  // Generate unique transaction reference
  const generateTrxId = (method: PaymentMethodType) => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (method === 'bkash') return `BK9${randomPart}`;
    if (method === 'nagad') return `NG8${randomPart}`;
    if (method === 'card') return `CARD-${randomPart}`;
    return `COD-${randomPart}`;
  };

  // Execute payment completion
  const finalizePayment = (
    method: PaymentMethodType,
    trxId: string,
    accountMasked: string,
    extraCardBrand?: 'Visa' | 'Mastercard' | 'Amex'
  ) => {
    const isPaidInFull = paymentPlan === 'full';
    const isDeposit = paymentPlan === 'advance_deposit';
    const isCod = paymentPlan === 'cash_on_delivery';

    const paymentResult: PaymentDetails = {
      method,
      status: isPaidInFull ? 'paid' : isDeposit ? 'deposit_paid' : 'unpaid',
      plan: paymentPlan,
      amount: subtotal,
      paidAmount: payableNow,
      remainingDue: remainingDue,
      currency: 'BDT',
      transactionId: trxId,
      accountNumberMasked: accountMasked,
      cardBrand: extraCardBrand,
      paidAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      receiptNumber: `SRV-REC-${Date.now().toString().slice(-6)}`,
      discountApplied: discountAmount,
      note: isCod
        ? 'Customer selected Cash on Delivery. To be collected by technician upon service completion.'
        : isDeposit
        ? `15% Booking token settled online. ৳${remainingDue} due upon completion.`
        : '100% Pre-paid and held in SERVO Secure Escrow until job verification.',
    };

    setCompletedPayment(paymentResult);
    setIsProcessing(false);
  };

  // bKash Flow Handlers
  const handleBkashProceedToOtp = () => {
    if (!bkashNumber || bkashNumber.length < 10) {
      alert('Please enter a valid 11-digit bKash wallet number.');
      return;
    }
    setProcessingStatusText('Requesting bKash OTP for ' + bkashNumber + '...');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBkashOtp('849201'); // test auto-filled OTP
      setBkashStep('otp');
    }, 700);
  };

  const handleBkashProceedToPin = () => {
    setProcessingStatusText('Validating bKash Verification Code...');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBkashStep('pin');
    }, 600);
  };

  const handleBkashSubmitPin = () => {
    setProcessingStatusText('Connecting to bKash PGW • Authorizing ৳' + payableNow + '...');
    setIsProcessing(true);
    setTimeout(() => {
      const trx = generateTrxId('bkash');
      finalizePayment('bkash', trx, `bKash (${bkashNumber.slice(0, 4)}***${bkashNumber.slice(-3)})`);
      setBkashStep('success');
    }, 1200);
  };

  // Nagad Flow Handlers
  const handleNagadProceedToOtp = () => {
    if (!nagadNumber || nagadNumber.length < 10) {
      alert('Please enter a valid 11-digit Nagad account number.');
      return;
    }
    setProcessingStatusText('Generating Nagad Instant OTP...');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setNagadOtp('593812');
      setNagadStep('otp');
    }, 700);
  };

  const handleNagadProceedToPin = () => {
    setProcessingStatusText('Verifying Nagad OTP Code...');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setNagadStep('pin');
    }, 600);
  };

  const handleNagadSubmitPin = () => {
    setProcessingStatusText('Submitting to Bangladesh Post Office Nagad Gateway...');
    setIsProcessing(true);
    setTimeout(() => {
      const trx = generateTrxId('nagad');
      finalizePayment('nagad', trx, `Nagad (${nagadNumber.slice(0, 4)}***${nagadNumber.slice(-3)})`);
      setNagadStep('success');
    }, 1200);
  };

  // Card Flow Handlers
  const handleCardProceedTo3ds = () => {
    setProcessingStatusText('Connecting to 3D-Secure Bank Gateway...');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCard3dsOtp('7391');
      setCardStep('3ds');
    }, 700);
  };

  const handleCardSubmit3ds = () => {
    setProcessingStatusText('Verifying Bank SMS Token & Settling...');
    setIsProcessing(true);
    setTimeout(() => {
      const trx = generateTrxId('card');
      finalizePayment('card', trx, `${cardBrand} (•••• ${cardNumber.replace(/\D/g, '').slice(-4) || '4242'})`, cardBrand);
      setCardStep('success');
    }, 1200);
  };

  // Cash on Delivery Handler
  const handleCashOnDeliveryConfirm = () => {
    setProcessingStatusText('Locking slot with Cash on Delivery guarantee...');
    setIsProcessing(true);
    setTimeout(() => {
      const trx = generateTrxId('cash');
      finalizePayment('cash', trx, 'Cash on Delivery (Pay at Doorstep)');
    }, 800);
  };

  // Quick fill test card helper
  const handleFillTestCard = (brand: 'Visa' | 'Mastercard') => {
    if (brand === 'Visa') {
      setCardNumber('4242 •••• •••• 4242');
      setCardBrand('Visa');
    } else {
      setCardNumber('5555 •••• •••• 5555');
      setCardBrand('Mastercard');
    }
    setCardHolder('FAHIM ALOM');
    setCardExpiry('12/28');
    setCardCvv('921');
  };

  const handleCopyTrx = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTrx(true);
    setTimeout(() => setCopiedTrx(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] sm:max-h-[95vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {completedPayment ? 'Payment Successful' : 'SERVO Secure Checkout'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Demo Sandbox
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                256-Bit SSL Encrypted • Bangladesh MFS & Bank Gateways
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (completedPayment) {
                onPaymentComplete(completedPayment);
              }
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer active:scale-90"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overscroll-contain">
          {/* ======================================================== */}
          {/* STATE: PAYMENT COMPLETED SUCCESS VIEW                    */}
          {/* ======================================================== */}
          {completedPayment ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-in zoom-in-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {completedPayment.plan === 'cash_on_delivery'
                    ? 'Booking Confirmed (Cash on Delivery)'
                    : 'Payment Successfully Processed!'}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  {completedPayment.plan === 'cash_on_delivery'
                    ? 'Your service technician has been assigned. You will pay the technician in cash or MFS upon job inspection.'
                    : `৳${completedPayment.paidAmount.toLocaleString()} has been safely authorized via ${completedPayment.method.toUpperCase()} and held in SERVO escrow.`}
                </p>
              </div>

              {/* Digital Payment Receipt Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3.5 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Receipt No</span>
                    <p className="font-mono text-xs font-bold text-slate-900">{completedPayment.receiptNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</span>
                    <p className="text-xs text-slate-700 font-medium">{completedPayment.paidAt}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold text-slate-900">{serviceName}</span>
                  </div>
                  {provider && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Technician:</span>
                      <span className="font-semibold text-slate-800">{provider.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="font-bold text-indigo-700 uppercase">
                      {completedPayment.method} ({completedPayment.accountNumberMasked})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Transaction ID:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      <span>{completedPayment.transactionId}</span>
                      <button
                        onClick={() => handleCopyTrx(completedPayment.transactionId || '')}
                        className="text-slate-400 hover:text-slate-700"
                        title="Copy TrxID"
                      >
                        {copiedTrx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                    <span className="font-bold text-slate-700">Amount Paid Now:</span>
                    <span className="font-extrabold text-emerald-600">৳{completedPayment.paidAmount.toLocaleString()} BDT</span>
                  </div>
                  {completedPayment.remainingDue > 0 && (
                    <div className="flex justify-between text-xs bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <span className="text-amber-800 font-medium">Due Upon Completion:</span>
                      <span className="font-bold text-amber-900">৳{completedPayment.remainingDue.toLocaleString()} BDT</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  id="payment-success-proceed-btn"
                  onClick={handleFinishAndProceed}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>View Booking Confirmation & Sent Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Auto-forwarding in 3s • Your service request has been transmitted
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Service Summary Strip */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{categoryName}</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{serviceName}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {location} • {scheduledDate}, {scheduledTime}
                  </p>
                </div>
                {provider && (
                  <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-slate-200 self-start sm:self-auto">
                    <img
                      src={provider.avatar}
                      alt={provider.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">{provider.name}</p>
                      <p className="text-[10px] text-amber-500 font-bold">{provider.rating}★ Rated Tech</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Plan Options (Full, 15% Deposit, Cash on Delivery) */}
              {!isSettlingRemaining && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Select Payment Structure:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Plan 1: Full Payment */}
                    <button
                      type="button"
                      onClick={() => setPaymentPlan('full')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'full'
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Pay in Full</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          100%
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-indigo-700 mt-1">৳{subtotal}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Escrow secured release</p>
                    </button>

                    {/* Plan 2: 15% Advance Deposit */}
                    <button
                      type="button"
                      onClick={() => setPaymentPlan('advance_deposit')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'advance_deposit'
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">15% Deposit</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Token
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-emerald-600 mt-1">
                        ৳{Math.round(subtotal * 0.15)}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Rest ৳{subtotal - Math.round(subtotal * 0.15)} on site
                      </p>
                    </button>

                    {/* Plan 3: Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentPlan('cash_on_delivery');
                        setSelectedMethod('cash');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'cash_on_delivery'
                          ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Pay on Site</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Cash
                        </span>
                      </div>
                      <p className="text-base font-extrabold text-slate-800 mt-1">৳0 Advance</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pay after repair inspection</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Method Selector Tabs */}
              {paymentPlan !== 'cash_on_delivery' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Choose Payment Channel:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {/* bKash Tab */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('bkash')}
                      className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        selectedMethod === 'bkash'
                          ? 'border-[#E2136E] bg-pink-50/50 text-[#E2136E] ring-2 ring-[#E2136E]/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#E2136E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ৳
                      </div>
                      <span className="text-xs font-extrabold">bKash</span>
                      <span className="text-[9px] text-slate-400 font-medium">Instant OTP</span>
                    </button>

                    {/* Nagad Tab */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('nagad')}
                      className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        selectedMethod === 'nagad'
                          ? 'border-[#F7941D] bg-orange-50/50 text-[#D83726] ring-2 ring-[#F7941D]/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D83726] to-[#F7941D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ন
                      </div>
                      <span className="text-xs font-extrabold">Nagad</span>
                      <span className="text-[9px] text-slate-400 font-medium">Post Office MFS</span>
                    </button>

                    {/* Card Tab */}
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        selectedMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold">Bank Card</span>
                      <span className="text-[9px] text-slate-400 font-medium">Visa / Mastercard</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* GATEWAY 1: BKASH FLOW                                    */}
              {/* ======================================================== */}
              {selectedMethod === 'bkash' && paymentPlan !== 'cash_on_delivery' && (
                <div className="p-4 rounded-2xl bg-[#E2136E]/5 border border-[#E2136E]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#E2136E] uppercase tracking-wider flex items-center gap-1">
                        <span>bKash Payment Gateway</span>
                      </span>
                      <span className="text-[10px] text-slate-500">MFS Helpline: 16247</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">Payable: ৳{payableNow}</span>
                  </div>

                  {/* Step 1: Phone */}
                  {bkashStep === 'phone' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Your bKash Account Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bkashNumber}
                            onChange={(e) => setBkashNumber(e.target.value)}
                            placeholder="017XX-XXXXXX"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#E2136E] focus:ring-2 focus:ring-[#E2136E]/20"
                          />
                          <button
                            type="button"
                            onClick={() => setBkashNumber('01712-998877')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#E2136E] bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            Demo Fill
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          We will send a 6-digit verification code to this number.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleBkashProceedToOtp}
                        className="w-full py-2.5 rounded-xl bg-[#E2136E] hover:bg-[#c20f5c] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <span>Confirm & Send OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: OTP */}
                  {bkashStep === 'otp' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Enter 6-Digit bKash Verification Code
                          </label>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Demo Code: 849201
                          </span>
                        </div>
                        <input
                          type="text"
                          value={bkashOtp}
                          onChange={(e) => setBkashOtp(e.target.value)}
                          placeholder="e.g. 849201"
                          maxLength={6}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-widest text-center text-slate-900 focus:outline-none focus:border-[#E2136E]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBkashStep('phone')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleBkashProceedToPin}
                          className="flex-1 py-2.5 rounded-xl bg-[#E2136E] hover:bg-[#c20f5c] text-white font-extrabold text-xs shadow-xs transition-colors"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: PIN */}
                  {bkashStep === 'pin' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Enter bKash 4-digit PIN
                          </label>
                          <span className="text-[10px] font-bold text-slate-500">
                            Demo Sandbox PIN: Any (e.g. 1234)
                          </span>
                        </div>
                        <input
                          type="password"
                          value={bkashPin}
                          onChange={(e) => setBkashPin(e.target.value)}
                          placeholder="••••"
                          maxLength={4}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-lg font-mono font-bold tracking-widest text-center text-slate-900 focus:outline-none focus:border-[#E2136E]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBkashStep('otp')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleBkashSubmitPin}
                          className="flex-1 py-2.5 rounded-xl bg-[#E2136E] hover:bg-[#c20f5c] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Authorize ৳{payableNow} bKash Payment</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* GATEWAY 2: NAGAD FLOW                                    */}
              {/* ======================================================== */}
              {selectedMethod === 'nagad' && paymentPlan !== 'cash_on_delivery' && (
                <div className="p-4 rounded-2xl bg-[#F7941D]/5 border border-[#F7941D]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#D83726] uppercase tracking-wider">
                        Nagad Gateway
                      </span>
                      <span className="text-[10px] text-slate-500">Post Office Helpline: 16167</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">Payable: ৳{payableNow}</span>
                  </div>

                  {/* Step 1: Phone */}
                  {nagadStep === 'phone' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nagad Account Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={nagadNumber}
                            onChange={(e) => setNagadNumber(e.target.value)}
                            placeholder="018XX-XXXXXX"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#F7941D]"
                          />
                          <button
                            type="button"
                            onClick={() => setNagadNumber('01819-345678')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#D83726] bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            Demo Fill
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleNagadProceedToOtp}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D83726] to-[#F7941D] hover:opacity-95 text-white font-extrabold text-xs shadow-xs transition-opacity flex items-center justify-center gap-2"
                      >
                        <span>Send Nagad OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: OTP */}
                  {nagadStep === 'otp' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Enter Nagad 6-Digit OTP
                          </label>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Demo Code: 593812
                          </span>
                        </div>
                        <input
                          type="text"
                          value={nagadOtp}
                          onChange={(e) => setNagadOtp(e.target.value)}
                          placeholder="e.g. 593812"
                          maxLength={6}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-widest text-center text-slate-900 focus:outline-none focus:border-[#F7941D]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNagadStep('phone')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNagadProceedToPin}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D83726] to-[#F7941D] text-white font-extrabold text-xs shadow-xs"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: PIN */}
                  {nagadStep === 'pin' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Enter Nagad 4-Digit PIN
                          </label>
                          <span className="text-[10px] font-bold text-slate-500">
                            Demo Sandbox PIN: 4321
                          </span>
                        </div>
                        <input
                          type="password"
                          value={nagadPin}
                          onChange={(e) => setNagadPin(e.target.value)}
                          placeholder="••••"
                          maxLength={4}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-lg font-mono font-bold tracking-widest text-center text-slate-900 focus:outline-none focus:border-[#F7941D]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNagadStep('otp')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNagadSubmitPin}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D83726] to-[#F7941D] text-white font-extrabold text-xs shadow-xs"
                        >
                          Authorize ৳{payableNow} Payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* GATEWAY 3: CARD FLOW                                     */}
              {/* ======================================================== */}
              {selectedMethod === 'card' && paymentPlan !== 'cash_on_delivery' && (
                <div className="space-y-4">
                  {/* Virtual Card Graphic Preview */}
                  <div className="relative rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white p-4 sm:p-5 shadow-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-7 rounded-md bg-amber-400/90 border border-amber-300 flex items-center justify-center">
                        <div className="w-5 h-4 border border-amber-600/60 rounded-xs" />
                      </div>
                      <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white/90">
                        {cardBrand}
                      </span>
                    </div>

                    <p className="font-mono text-base sm:text-lg font-bold tracking-widest text-white/90 mb-3">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase text-slate-300">
                      <div>
                        <span className="text-[8px] text-slate-400 block">Cardholder</span>
                        <span className="font-semibold text-white">{cardHolder || 'VALUED CUSTOMER'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block">Expires</span>
                        <span className="font-semibold text-white">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Fill Test Cards */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 font-medium">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('Visa')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] transition-colors border border-slate-200"
                    >
                      Test Visa (4242)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('Mastercard')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] transition-colors border border-slate-200"
                    >
                      Test Mastercard (5555)
                    </button>
                  </div>

                  {cardStep === 'details' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="FAHIM ALOM"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 uppercase focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Expires</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="CVV"
                              maxLength={4}
                              className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCardProceedTo3ds}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Proceed to 3D-Secure Bank Authorization (৳{payableNow})</span>
                      </button>
                    </div>
                  )}

                  {cardStep === '3ds' && (
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-900 text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Verified by Visa / Mastercard ID Check
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">SMS Token: 7391</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Please enter the simulated 4-digit bank SMS one-time passcode sent to your registered mobile.
                      </p>
                      <input
                        type="text"
                        value={card3dsOtp}
                        onChange={(e) => setCard3dsOtp(e.target.value)}
                        placeholder="7391"
                        maxLength={4}
                        className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 text-center font-mono font-bold text-sm bg-white text-slate-900"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCardStep('details')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleCardSubmit3ds}
                          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                        >
                          Confirm & Pay ৳{payableNow}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* GATEWAY 4: CASH ON DELIVERY CONFIRMATION                 */}
              {/* ======================================================== */}
              {paymentPlan === 'cash_on_delivery' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Pay on Site (Cash / Mobile Banking)</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Zero advance payment needed right now. Your appointment will be scheduled and technician will visit your location.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Charge to Pay Technician:</span>
                      <strong className="text-slate-900 font-extrabold">৳{subtotal} BDT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Advance Due Right Now:</span>
                      <strong className="text-emerald-700 font-extrabold">৳0.00 BDT</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCashOnDeliveryConfirm}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Booking with Cash on Delivery</span>
                  </button>
                </div>
              )}

              {/* Coupon / Promo Code Strip */}
              <div className="pt-2 border-t border-slate-100">
                {!promoApplied ? (
                  <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Coupon: try SERVO50 or DHAKA100"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs uppercase font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-emerald-800 font-bold">
                      🎉 Coupon Applied: -৳{discountAmount} BDT Discount
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setDiscountAmount(0);
                        setPromoCode('');
                      }}
                      className="text-emerald-600 hover:text-emerald-800 font-bold text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-rose-500 mt-1">{promoError}</p>}
              </div>

              {/* Bill Summary Table */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Base Repair / Service Fee</span>
                  <span>৳{baseAmount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Promo Discount</span>
                    <span>-৳{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Platform Escrow Dispatch Guarantee</span>
                  <span className="text-emerald-600 font-bold">FREE (৳0)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Payable Right Now:</span>
                  <span className="text-indigo-700 font-extrabold">৳{payableNow} BDT</span>
                </div>
                {remainingDue > 0 && (
                  <div className="flex justify-between text-[11px] text-amber-700 font-medium pt-1">
                    <span>Remaining Due Upon Job Completion:</span>
                    <span className="font-bold">৳{remainingDue} BDT</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white z-50">
            <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
            <h4 className="font-bold text-base">{processingStatusText || 'Processing Payment Gateway...'}</h4>
            <p className="text-xs text-slate-300 mt-1">
              Communicating securely with central banking API. Please do not close this window.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
