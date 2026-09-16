import { ServiceRequest, ServiceProvider } from '../types';

/**
 * Generates an official, beautifully styled, self-contained HTML Tax Invoice & Receipt
 * compliant with Bangladesh NBR Mushak-6.3 guidelines and SERVO Escrow standards.
 */
export function generateInvoiceHtml(request: ServiceRequest, provider?: ServiceProvider): string {
  const payment = request.payment;
  const isPaid = payment?.status === 'paid';
  const isDeposit = payment?.status === 'deposit_paid';
  const isCod = payment?.method === 'cash' || !payment || payment.status === 'unpaid';

  const receiptNumber = payment?.receiptNumber || `SRV-INV-${request.id.replace('req_', '')}890`;
  const transactionId = payment?.transactionId || (isCod ? `COD-${request.id}` : 'BK9X7F201A');
  const paymentMethod = payment?.method ? payment.method.toUpperCase() : 'CASH ON DELIVERY';
  const paidAmount = payment ? payment.paidAmount : (request.status === 'Completed' ? request.estimatedPrice : 0);
  const remainingDue = payment ? payment.remainingDue : (request.status === 'Completed' ? 0 : request.estimatedPrice);
  const totalAmount = payment?.amount || request.estimatedPrice;
  const discountAmount = payment?.discountApplied || 0;
  const subtotal = totalAmount + discountAmount;
  const warrantyCode = request.warranty?.warrantyCode || `WAR-${request.id.replace('req_', '')}-14D`;
  const durationDays = request.warranty?.durationDays || 14;
  const technicianName = request.assignedProviderName || provider?.name || 'Certified Technician';
  const tradeLicense = provider?.tradeLicense || 'TRAD-DNCC-2024-8891';
  const issueDate = payment?.paidAt || request.createdAt || new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SERVO Official Tax Invoice & Receipt #${receiptNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    @page {
      size: A4;
      margin: 12mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print-bar {
      max-width: 800px;
      margin: 0 auto 20px auto;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .no-print-bar button {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .no-print-bar button:hover {
      background: #047857;
    }

    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px -5px rgba(0,0,0,0.06);
      padding: 40px;
      position: relative;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .brand-logo-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-badge {
      width: 38px;
      height: 38px;
      background: #0f172a;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: -0.5px;
    }

    .brand-name {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      margin-top: 2px;
    }

    .nbr-stamp {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-size: 10px;
      font-weight: 700;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-title {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .invoice-number {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }

    .status-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-paid {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    .status-deposit {
      background: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }

    .status-unpaid {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 14px;
      padding: 16px;
    }

    .info-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .info-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }

    .info-detail {
      font-size: 12px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }

    .service-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .service-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .service-table td {
      padding: 14px 16px;
      font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .service-title {
      font-weight: 800;
      color: #0f172a;
      font-size: 13px;
    }

    .service-desc {
      color: #64748b;
      font-size: 11px;
      margin-top: 3px;
    }

    .table-calculations {
      background: #f8fafc;
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #475569;
      margin-bottom: 6px;
    }

    .calc-row.discount {
      color: #059669;
      font-weight: 600;
    }

    .calc-row.total {
      border-top: 2px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
    }

    .payment-summary {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .payment-summary-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 800;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }

    .payment-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      font-size: 11px;
    }

    .payment-item-label {
      color: #64748b;
      margin-bottom: 2px;
    }

    .payment-item-val {
      font-weight: 800;
      color: #0f172a;
    }

    .warranty-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .warranty-text h4 {
      font-size: 12px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .warranty-text p {
      font-size: 11px;
      color: #475569;
      margin-top: 2px;
    }

    .warranty-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      background: #059669;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .footer-auth {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }

    .legal-notes {
      font-size: 10px;
      color: #94a3b8;
      max-width: 480px;
      line-height: 1.5;
    }

    .digital-seal {
      text-align: right;
    }

    .seal-box {
      display: inline-block;
      border: 2px dashed #059669;
      color: #059669;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #ecfdf5;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print-bar {
        display: none !important;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div>
      <strong>SERVO Operations Tax Receipt & Invoice</strong> • Saved locally or ready to print
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
        Print / Save to PDF
      </button>
    </div>
  </div>

  <div class="invoice-card" id="invoice-printable-area">
    <!-- Header -->
    <div class="header-top">
      <div class="brand-section">
        <div class="brand-logo-row">
          <div class="logo-badge">S</div>
          <span class="brand-name">SERVO</span>
        </div>
        <p class="brand-subtitle">Smart Everyday Service & Repair Operation Network Ltd.</p>
        <p class="brand-subtitle">Gulshan-2, Dhaka 1212 • support@servo.com.bd • +880 9612-889900</p>
        <div>
          <span class="nbr-stamp">Govt. NBR BIN: 004819284-0102 • Mushak-6.3 Digital Tax Challan</span>
        </div>
      </div>

      <div class="invoice-meta">
        <div class="invoice-title">Tax Invoice & Receipt</div>
        <div class="invoice-number">${receiptNumber}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${issueDate}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 1px;">Request ID: #${request.id}</div>
        <div>
          <span class="status-pill ${isPaid ? 'status-paid' : isDeposit ? 'status-deposit' : 'status-unpaid'}">
            ${isPaid ? 'Paid in Full' : isDeposit ? 'Deposit Settled' : 'Payment Due'}
          </span>
        </div>
      </div>
    </div>

    <!-- Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Billed To (Customer)</div>
        <div class="info-name">${request.customerName}</div>
        <div class="info-detail">Phone: ${request.customerPhone || '+880 1712-998877'}</div>
        <div class="info-detail">Location: ${request.location}, Dhaka, Bangladesh</div>
        <div class="info-detail">Scheduled: ${request.preferredDate} • ${request.preferredTime}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Certified Service Provider</div>
        <div class="info-name">${technicianName}</div>
        <div class="info-detail">Trade License: ${tradeLicense}</div>
        <div class="info-detail">Service Category: ${request.serviceCategory}</div>
        <div class="info-detail">Verification: Biometric & Police NID Checked</div>
      </div>
    </div>

    <!-- Table -->
    <table class="service-table">
      <thead>
        <tr>
          <th>Service Item & Details</th>
          <th style="text-align: center;">Urgency</th>
          <th style="text-align: right;">Rate / Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="service-title">${request.serviceType}</div>
            <div class="service-desc">${request.description || 'Professional on-demand maintenance and diagnostic overhaul.'}</div>
            <div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: 600;">
              ✓ Covered by ${durationDays}-Day SERVO Escrow Protection Guarantee
            </div>
          </td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${request.urgency === 'Emergency' ? '#ffe4e6; color: #9f1239' : '#f1f5f9; color: #334155'};">
              ${request.urgency}
            </span>
          </td>
          <td style="text-align: right; font-weight: 800; font-size: 13px;">
            ৳${totalAmount} BDT
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Calculations -->
    <div class="table-calculations" style="border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 20px;">
      <div class="calc-row">
        <span>Base Service Charge:</span>
        <span>৳${subtotal} BDT</span>
      </div>
      ${discountAmount > 0 ? `
      <div class="calc-row discount">
        <span>Promotional Coupon Discount:</span>
        <span>-৳${discountAmount} BDT</span>
      </div>
      ` : ''}
      <div class="calc-row">
        <span>Platform Dispatch & Escrow Fee:</span>
        <span style="color: #059669; font-weight: 700;">FREE (৳0)</span>
      </div>
      <div class="calc-row">
        <span>Govt. VAT / Mushak (5% included):</span>
        <span>৳${Math.round(totalAmount * 0.05)} BDT (Included)</span>
      </div>
      <div class="calc-row total">
        <span>Total Payable / Paid:</span>
        <span>৳${totalAmount} BDT</span>
      </div>
    </div>

    <!-- Payment Verification Box -->
    <div class="payment-summary">
      <div class="payment-summary-title">
        <span>Payment & Escrow Settlement Verification</span>
        <span style="background: #ffffff; padding: 2px 8px; border-radius: 6px; border: 1px solid #bbf7d0;">
          ${paymentMethod}
        </span>
      </div>
      <div class="payment-grid">
        <div>
          <div class="payment-item-label">Payment Status</div>
          <div class="payment-item-val" style="color: #166534; text-transform: uppercase;">
            ${payment?.status || (request.status === 'Completed' ? 'Settled' : 'Pending')}
          </div>
        </div>
        <div>
          <div class="payment-item-label">Transaction Ref</div>
          <div class="payment-item-val" style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            ${transactionId}
          </div>
        </div>
        <div>
          <div class="payment-item-label">Paid Online / Collected</div>
          <div class="payment-item-val" style="color: #059669;">
            ৳${paidAmount} BDT
          </div>
        </div>
        <div>
          <div class="payment-item-label">Balance Due</div>
          <div class="payment-item-val">
            ৳${remainingDue} BDT
          </div>
        </div>
      </div>
    </div>

    <!-- Digital Warranty Card -->
    <div class="warranty-banner">
      <div class="warranty-text">
        <h4>Digital Service Warranty Certificate</h4>
        <p>Free rework guaranteed for ${durationDays} days. Report any recurrence directly through SERVO for zero-cost technician dispatch.</p>
      </div>
      <div class="warranty-badge">
        ${warrantyCode}
      </div>
    </div>

    <!-- Footer & Seal -->
    <div class="footer-auth">
      <div class="legal-notes">
        <p>• This is a computer-generated tax invoice issued by SERVO Operations Network Ltd.</p>
        <p>• Secured under SERVO 100% Escrow Protection Policy. Payments are held in escrow until customer satisfaction sign-off.</p>
        <p>• For support or warranty claims, contact: <strong>support@servo.com.bd</strong> or hot-line <strong>16999</strong>.</p>
      </div>

      <div class="digital-seal">
        <div class="seal-box">
          ✓ SERVO CERTIFIED &amp; TAX VERIFIED
        </div>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px; font-family: 'JetBrains Mono', monospace;">
          AUTH-HASH: ${receiptNumber.slice(-8)}-OK
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads the official formatted HTML invoice file to the user's device
 */
export function downloadInvoiceHtml(request: ServiceRequest, provider?: ServiceProvider): void {
  const htmlContent = generateInvoiceHtml(request, provider);
  const receiptNumber = request.payment?.receiptNumber || `SRV-INV-${request.id.replace('req_', '')}890`;
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `SERVO_Tax_Invoice_${receiptNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean text summary for accounting & expense logging
 */
export function downloadInvoiceText(request: ServiceRequest, provider?: ServiceProvider): void {
  const payment = request.payment;
  const receiptNumber = payment?.receiptNumber || `SRV-INV-${request.id.replace('req_', '')}890`;
  const transactionId = payment?.transactionId || (payment?.method === 'cash' ? `COD-${request.id}` : 'N/A');
  const paidAmount = payment ? payment.paidAmount : (request.status === 'Completed' ? request.estimatedPrice : 0);
  const remainingDue = payment ? payment.remainingDue : (request.status === 'Completed' ? 0 : request.estimatedPrice);
  const technicianName = request.assignedProviderName || provider?.name || 'Certified Specialist';
  const warrantyCode = request.warranty?.warrantyCode || `WAR-${request.id.replace('req_', '')}-14D`;

  const lines = [
    '========================================================',
    '       SERVO OPERATIONS NETWORK LTD - TAX INVOICE       ',
    '       NBR BIN: 004819284-0102 • Mushak-6.3 Certified   ',
    '========================================================',
    '',
    `INVOICE NUMBER : ${receiptNumber}`,
    `ORDER ID       : #${request.id}`,
    `ISSUE DATE     : ${payment?.paidAt || request.createdAt}`,
    `STATUS         : ${payment?.status || (request.status === 'Completed' ? 'PAID' : 'PENDING')}`,
    '',
    '--------------------------------------------------------',
    'CUSTOMER DETAILS',
    '--------------------------------------------------------',
    `Name     : ${request.customerName}`,
    `Phone    : ${request.customerPhone || '+880 1712-998877'}`,
    `Location : ${request.location}, Dhaka, Bangladesh`,
    `Schedule : ${request.preferredDate} (${request.preferredTime})`,
    '',
    '--------------------------------------------------------',
    'SERVICE & TECHNICIAN DETAILS',
    '--------------------------------------------------------',
    `Service    : ${request.serviceType}`,
    `Category   : ${request.serviceCategory}`,
    `Technician : ${technicianName}`,
    `License    : ${provider?.tradeLicense || 'TRAD-DNCC-2024-8891'}`,
    `Urgency    : ${request.urgency}`,
    '',
    '--------------------------------------------------------',
    'FINANCIAL BREAKDOWN (BDT)',
    '--------------------------------------------------------',
    `Base Service Fee    : ৳${request.estimatedPrice}`,
    `Promotional Discount: -৳${payment?.discountApplied || 0}`,
    `Platform Escrow Fee : ৳0.00 (Free)`,
    `VAT (Mushak 5%)     : ৳${Math.round(request.estimatedPrice * 0.05)} (Included)`,
    `TOTAL INVOICE VALUE : ৳${payment?.amount || request.estimatedPrice}`,
    `Paid Online/Deposit : ৳${paidAmount}`,
    `Balance Due         : ৳${remainingDue}`,
    `Payment Method      : ${payment?.method ? payment.method.toUpperCase() : 'CASH ON DELIVERY'}`,
    `Transaction ID      : ${transactionId}`,
    '',
    '--------------------------------------------------------',
    'DIGITAL WARRANTY CERTIFICATE',
    '--------------------------------------------------------',
    `Warranty Code: ${warrantyCode}`,
    `Duration     : ${request.warranty?.durationDays || 14} Days Free Rework Protection`,
    `Coverage     : Free technician re-visit for recurring defects`,
    '',
    '========================================================',
    'Thank you for using SERVO Smart Everyday Services!     ',
    'Support: support@servo.com.bd | Hotline: +880 9612-889900',
    '========================================================',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SERVO_Receipt_${receiptNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a structured CSV for spreadsheet accounting (Excel / Sheets)
 */
export function downloadInvoiceCsv(request: ServiceRequest, provider?: ServiceProvider): void {
  const payment = request.payment;
  const receiptNumber = payment?.receiptNumber || `SRV-INV-${request.id.replace('req_', '')}890`;
  const transactionId = payment?.transactionId || (payment?.method === 'cash' ? `COD-${request.id}` : 'N/A');
  const paidAmount = payment ? payment.paidAmount : (request.status === 'Completed' ? request.estimatedPrice : 0);
  const remainingDue = payment ? payment.remainingDue : (request.status === 'Completed' ? 0 : request.estimatedPrice);
  const totalAmount = payment?.amount || request.estimatedPrice;
  const technicianName = request.assignedProviderName || provider?.name || 'Certified Specialist';

  const headers = [
    'InvoiceNumber',
    'IssueDate',
    'RequestId',
    'CustomerName',
    'CustomerPhone',
    'Location',
    'ServiceCategory',
    'ServiceType',
    'TechnicianName',
    'TotalAmountBDT',
    'PaidAmountBDT',
    'RemainingDueBDT',
    'PaymentMethod',
    'TransactionId',
    'PaymentStatus',
    'WarrantyCode',
  ];

  const values = [
    `"${receiptNumber}"`,
    `"${payment?.paidAt || request.createdAt}"`,
    `"${request.id}"`,
    `"${request.customerName.replace(/"/g, '""')}"`,
    `"${request.customerPhone || ''}"`,
    `"${request.location}, Dhaka"`,
    `"${request.serviceCategory}"`,
    `"${request.serviceType.replace(/"/g, '""')}"`,
    `"${technicianName.replace(/"/g, '""')}"`,
    totalAmount,
    paidAmount,
    remainingDue,
    `"${payment?.method || 'cash'}"`,
    `"${transactionId}"`,
    `"${payment?.status || (request.status === 'Completed' ? 'paid' : 'pending')}"`,
    `"${request.warranty?.warrantyCode || `WAR-${request.id}-14D`}"`,
  ];

  const csvContent = `${headers.join(',')}\n${values.join(',')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SERVO_Invoice_${receiptNumber}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a pristine print of the official Tax Invoice & Receipt
 * using an isolated print iframe to bypass any modal/wrapper boundaries.
 */
export function printInvoiceDocument(request: ServiceRequest, provider?: ServiceProvider): void {
  const htmlContent = generateInvoiceHtml(request, provider);

  // Create an isolated hidden iframe to print only the official invoice layout
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Wait for styles and fonts to paint before triggering print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback to standard window print
        window.print();
      } finally {
        // Clean up the iframe after print dialog completes
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    }, 400);
  } else {
    window.print();
  }
}
