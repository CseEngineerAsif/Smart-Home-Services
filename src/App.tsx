import React, { useState } from 'react';
import {
  AppUser,
  ServiceCategory,
  ServiceRequest,
  ServiceProvider,
  ServiceStatus,
  AppNotification,
  UserRole,
  PaymentDetails,
  ChatMessage,
} from './types';
import {
  MOCK_PROVIDERS,
  INITIAL_REQUESTS,
  INITIAL_NOTIFICATIONS,
  SERVICE_CATEGORIES,
  INITIAL_CHAT_MESSAGES,
} from './data/mockData';
import {
  getActiveSessionUser,
  setActiveSessionUser,
  clearActiveSession,
  updateStoredUser,
  DEMO_CUSTOMER_USER,
  DEMO_PROVIDER_USER,
  DEMO_ADMIN_USER,
} from './data/authUsers';
import { rankProviders } from './services/providerMatching';
import {
  Navbar,
  CustomerNavTab,
  ProviderNavTab,
  AdminNavTab,
} from './components/Navbar';
import { CustomerHome } from './components/CustomerHome';
import { CustomerExploreView } from './components/CustomerExploreView';
import { CustomerJobsView } from './components/CustomerJobsView';
import { CustomerProfileView } from './components/CustomerProfileView';
import { ProviderProfileView } from './components/ProviderProfileView';
import { ProviderDashboardView } from './components/ProviderDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AuthView } from './components/AuthView';
import { AiAnalyzerModal } from './components/AiAnalyzerModal';
import { CreateRequestModal } from './components/CreateRequestModal';
import { ProviderMatchingModal } from './components/ProviderMatchingModal';
import { RequestTrackingView } from './components/RequestTrackingView';
import { NotificationsModal } from './components/NotificationsModal';
import { FlutterDocsModal } from './components/FlutterDocsModal';
import { PaymentModal } from './components/PaymentModal';
import { InvoiceReceiptModal } from './components/InvoiceReceiptModal';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';
import { InAppChatModal } from './components/InAppChatModal';
import { WorkProofUploadModal } from './components/WorkProofUploadModal';
import { DigitalWarrantyModal } from './components/DigitalWarrantyModal';
import { ProviderMapNavigationModal } from './components/ProviderMapNavigationModal';

export default function App() {
  // Session & User State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(getActiveSessionUser);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Platform Data States
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({
    'prov_1': ['04:00 PM - 06:00 PM'],
  });

  // Navigation state per role
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerNavTab>('home');
  const [activeProviderTab, setActiveProviderTab] = useState<ProviderNavTab>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminNavTab>('overview');

  // Customer tracking & dialog states
  const [activeTrackingRequest, setActiveTrackingRequest] = useState<ServiceRequest | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  // Payment & In-Flight Booking States
  const [pendingBooking, setPendingBooking] = useState<{
    provider: ServiceProvider;
    autoAssign: boolean;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [settlingPaymentRequest, setSettlingPaymentRequest] = useState<ServiceRequest | null>(null);
  const [selectedInvoiceRequest, setSelectedInvoiceRequest] = useState<ServiceRequest | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    request: ServiceRequest;
    provider: ServiceProvider | null;
    payment: PaymentDetails;
  } | null>(null);

  // New Feature Modals: Chat, Work Proof, Digital Warranty, Map Navigation
  const [activeChatRequest, setActiveChatRequest] = useState<ServiceRequest | null>(null);
  const [activeProofRequest, setActiveProofRequest] = useState<ServiceRequest | null>(null);
  const [activeWarrantyRequest, setActiveWarrantyRequest] = useState<ServiceRequest | null>(null);
  const [activeMapNavRequest, setActiveMapNavRequest] = useState<ServiceRequest | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);

  // Request creation in-flight data
  const [inFlightCategory, setInFlightCategory] = useState<ServiceCategory | null>(null);
  const [inFlightSubService, setInFlightSubService] = useState<string>('');
  const [inFlightUrgency, setInFlightUrgency] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [inFlightDescription, setInFlightDescription] = useState<string>('');
  const [inFlightLocation, setInFlightLocation] = useState<string>('');
  const [inFlightDate, setInFlightDate] = useState<string>('');
  const [inFlightTime, setInFlightTime] = useState<string>('');
  const [inFlightRequestData, setInFlightRequestData] = useState<{
    category: string;
    subService: string;
    description: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    urgency: 'Normal' | 'Urgent' | 'Emergency';
    imageUrl?: string;
    contactPhone: string;
  } | null>(null);

  // Login Success Handler
  const handleLoginSuccess = (user: AppUser, newProvider?: ServiceProvider) => {
    setCurrentUser(user);
    setShowAuthModal(false);

    if (newProvider) {
      setProviders((prev) => {
        if (prev.some((p) => p.id === newProvider.id)) return prev;
        return [newProvider, ...prev];
      });
    }

    // Set view according to role
    if (user.role === 'customer') {
      setActiveCustomerTab('home');
      setActiveTrackingRequest(null);
    } else if (user.role === 'provider') {
      setActiveProviderTab('home');
    } else if (user.role === 'admin') {
      setActiveAdminTab('overview');
    }

    // In-app welcome notification
    const welcomeNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `Welcome, ${user.name}!`,
      message: `Signed in as ${user.role.toUpperCase()} on SERVO Dispatch Network.`,
      timestamp: 'Just now',
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);
  };

  // Logout Handler
  const handleLogout = () => {
    clearActiveSession();
    setCurrentUser(null);
    setShowAuthModal(false);
    setActiveTrackingRequest(null);
  };

  // Role Switcher Handler (Customer <-> Provider <-> Admin)
  const handleSwitchRole = (newRole: UserRole) => {
    if (currentUser?.role === newRole) return;

    let targetUser: AppUser;
    if (newRole === 'customer') {
      targetUser = DEMO_CUSTOMER_USER;
      setActiveCustomerTab('home');
      setActiveTrackingRequest(null);
    } else if (newRole === 'provider') {
      targetUser = DEMO_PROVIDER_USER;
      setActiveProviderTab('home');
      setActiveTrackingRequest(null);
    } else {
      targetUser = DEMO_ADMIN_USER;
      setActiveAdminTab('overview');
      setActiveTrackingRequest(null);
    }

    setActiveSessionUser(targetUser);
    setCurrentUser(targetUser);

    const switchNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `Switched to ${newRole.toUpperCase()} View`,
      message: `Operating as ${targetUser.name} (${targetUser.role}).`,
      timestamp: 'Just now',
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [switchNotif, ...prev]);
  };

  // Customer Navigation Tab Selector
  const handleSelectCustomerTab = (tab: CustomerNavTab) => {
    if (tab === 'request') {
      setActiveCustomerTab('request');
      setActiveTrackingRequest(null);
      // Open Create Request flow directly
      const defaultCat = categories[0] || SERVICE_CATEGORIES[0];
      setInFlightCategory(defaultCat);
      setInFlightSubService(defaultCat.subServices[0]);
      setInFlightUrgency('Normal');
      setInFlightDescription('');
      setShowCreateModal(true);
    } else {
      setActiveCustomerTab(tab);
      if (tab !== 'home') {
        setActiveTrackingRequest(null);
      }
    }
  };

  // Provider Navigation Tab Selector
  const handleSelectProviderTab = (tab: ProviderNavTab) => {
    setActiveProviderTab(tab);
  };

  // Admin Navigation Tab Selector
  const handleSelectAdminTab = (tab: AdminNavTab) => {
    setActiveAdminTab(tab);
  };

  // Select Category from Home
  const handleSelectCategory = (category: ServiceCategory, subService?: string) => {
    setInFlightCategory(category);
    setInFlightSubService(subService || category.subServices[0]);
    setInFlightUrgency('Normal');
    setInFlightDescription(subService ? `Service requested: ${subService}` : '');
    setShowCreateModal(true);
  };

  // Direct Book Service from Home (Featured cards, packages, etc.) -> Opens Request Form
  const handleBookDirectService = (categoryId: string, subService: string) => {
    const cat =
      categories.find((c) => c.id === categoryId) ||
      SERVICE_CATEGORIES.find((c) => c.id === categoryId) ||
      categories[0] ||
      SERVICE_CATEGORIES[0];
    setInFlightCategory(cat);
    setInFlightSubService(subService || cat.subServices[0]);
    setInFlightUrgency('Normal');
    setInFlightDescription(`Booking service for ${subService}`);
    setShowCreateModal(true);
  };

  // Open Emergency from Home
  const handleOpenEmergency = () => {
    const electricalCat = categories.find((c) => c.name === 'Electrical') || categories[0] || SERVICE_CATEGORIES[0];
    setInFlightCategory(electricalCat);
    setInFlightSubService('Emergency Short Circuit Repair');
    setInFlightUrgency('Emergency');
    setInFlightDescription('Urgent emergency home hazard assistance required immediately.');
    setShowCreateModal(true);
  };

  // Apply from AI Analyzer
  const handleApplyAiAnalysis = (
    catName: string,
    subService: string,
    urgency: 'Normal' | 'Urgent' | 'Emergency',
    description: string
  ) => {
    const cat = categories.find((c) => c.name === catName) || categories[0] || SERVICE_CATEGORIES[0];
    setInFlightCategory(cat);
    setInFlightSubService(subService);
    setInFlightUrgency(urgency);
    setInFlightDescription(description);
    setShowCreateModal(true);
  };

  // Customer submits request form -> Compute ranking -> Show matching
  const handleSubmitRequestForm = (data: {
    category: string;
    subService: string;
    description: string;
    location: string;
    preferredDate: string;
    preferredTime: string;
    urgency: 'Normal' | 'Urgent' | 'Emergency';
    imageUrl?: string;
    contactPhone: string;
  }) => {
    setInFlightRequestData(data);
    setShowCreateModal(false);
    setShowMatchingModal(true);
  };

  // Compute provider matches for in-flight request
  const currentMatches = inFlightRequestData
    ? rankProviders({
        providers,
        category: inFlightRequestData.category,
        subService: inFlightRequestData.subService,
        location: inFlightRequestData.location,
        preferredTime: inFlightRequestData.preferredTime,
        urgency: inFlightRequestData.urgency,
        bookedProviderSlots: bookedSlots,
      })
    : [];

  // Customer selects provider or clicks Auto-Assign -> Open Payment Gateway FIRST!
  // Booking request will ONLY be created if customer payment is successful!
  const handleSelectProvider = (selectedProvider: ServiceProvider, autoAssign: boolean) => {
    if (!inFlightRequestData || !currentUser) return;

    // Check double-booking slot collision
    const existingBooked = bookedSlots[selectedProvider.id] || [];
    if (existingBooked.includes(inFlightRequestData.preferredTime)) {
      alert(
        `Slot Collision: ${selectedProvider.name} is already booked for ${inFlightRequestData.preferredTime}. Please choose another provider or slot.`
      );
      return;
    }

    // Set pending booking - DO NOT submit booking request yet!
    setPendingBooking({
      provider: selectedProvider,
      autoAssign,
    });
    setSettlingPaymentRequest(null);

    // Close provider matching dialog and open Payment Gateway Checkout
    setShowMatchingModal(false);
    setShowPaymentModal(true);
  };

  // Customer directly hires provider from Home search results (no request form wizard)
  const handleDirectHireProvider = (
    provider: ServiceProvider,
    work: string,
    categoryName: string,
    preferredDate?: string,
    preferredTime?: string,
    location?: string,
    contactPhone?: string
  ) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    const loc = location || currentUser.location || 'Dhanmondi';
    const date = preferredDate || new Date().toISOString().split('T')[0];
    const time = preferredTime || provider.availableTimeSlots[0] || '02:00 PM - 04:00 PM';
    const phone = contactPhone || currentUser.phone || '+880 1700-000000';

    // Check double-booking slot collision
    const existingBooked = bookedSlots[provider.id] || [];
    if (existingBooked.includes(time)) {
      alert(
        `Slot Collision: ${provider.name} is already booked for ${time}. Please choose another time slot.`
      );
      return;
    }

    setInFlightRequestData({
      category: categoryName,
      subService: work,
      description: `Direct booking for ${work} with ${provider.name}.`,
      location: loc,
      preferredDate: date,
      preferredTime: time,
      urgency: 'Normal',
      contactPhone: phone,
    });

    setPendingBooking({
      provider,
      autoAssign: false,
    });
    setSettlingPaymentRequest(null);
    setShowPaymentModal(true);
  };

  // Customer completes payment in Payment Gateway -> NOW create the booking!
  const handlePaymentComplete = (paymentDetails: PaymentDetails) => {
    // Scenario 1: Settling remaining balance for an existing request
    if (settlingPaymentRequest) {
      const updatedReq: ServiceRequest = {
        ...settlingPaymentRequest,
        payment: {
          ...settlingPaymentRequest.payment,
          ...paymentDetails,
          status: 'paid',
          paidAmount: (settlingPaymentRequest.payment?.paidAmount || 0) + paymentDetails.paidAmount,
          remainingDue: 0,
        },
        timeline: [
          ...settlingPaymentRequest.timeline,
          {
            status: settlingPaymentRequest.status,
            timestamp: 'Just now',
            note: `Remaining balance settled via ${paymentDetails.method.toUpperCase()} (TrxID: ${paymentDetails.transactionId || 'PAID'}).`,
          },
        ],
      };

      setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
      if (activeTrackingRequest?.id === updatedReq.id) {
        setActiveTrackingRequest(updatedReq);
      }
      setSettlingPaymentRequest(null);
      setShowPaymentModal(false);

      const settleNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Balance Payment Received',
        message: `Settlement for order #${updatedReq.id} confirmed via ${paymentDetails.method.toUpperCase()}.`,
        timestamp: 'Just now',
        type: 'success',
        read: false,
        requestId: updatedReq.id,
      };
      setNotifications((prev) => [settleNotif, ...prev]);

      // Trigger celebratory popup message: Payment Successful & Request Updated
      setSuccessModalData({
        request: updatedReq,
        provider: providers.find((p) => p.id === updatedReq.assignedProviderId) || null,
        payment: paymentDetails,
      });
      return;
    }

    // Scenario 2: Finalizing NEW booking request ONLY AFTER payment is successful!
    if (!pendingBooking || !inFlightRequestData || !currentUser) return;

    const selectedProvider = pendingBooking.provider;
    const autoAssign = pendingBooking.autoAssign;
    const newRequestId = `req_${Date.now().toString().slice(-4)}`;

    const newRequest: ServiceRequest = {
      id: newRequestId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: inFlightRequestData.contactPhone,
      serviceCategory: inFlightRequestData.category,
      serviceType: inFlightRequestData.subService,
      description: inFlightRequestData.description,
      location: inFlightRequestData.location,
      preferredDate: inFlightRequestData.preferredDate,
      preferredTime: inFlightRequestData.preferredTime,
      urgency: inFlightRequestData.urgency,
      imageUrl: inFlightRequestData.imageUrl,
      assignedProviderId: selectedProvider.id,
      assignedProviderName: selectedProvider.name,
      status: 'Assigned',
      estimatedPrice: selectedProvider.basePrice,
      createdAt: 'Just now',
      autoAssign,
      payment: paymentDetails,
      timeline: [
        {
          status: 'Requested',
          timestamp: 'Just now',
          note: paymentDetails.method === 'cash'
            ? 'Booking request submitted with Cash on Delivery guarantee.'
            : `Booking payment authorized via ${paymentDetails.method.toUpperCase()} (TrxID: ${paymentDetails.transactionId || 'N/A'}) - Secured in Escrow.`,
        },
        {
          status: 'Assigned',
          timestamp: 'Just now',
          note: autoAssign
            ? `System auto-assigned top match: ${selectedProvider.name}`
            : `Selected technician: ${selectedProvider.name}`,
        },
      ],
    };

    // Lock the time slot
    setBookedSlots((prev) => ({
      ...prev,
      [selectedProvider.id]: [
        ...(prev[selectedProvider.id] || []),
        inFlightRequestData.preferredTime,
      ],
    }));

    // Update provider workload
    setProviders((prev) =>
      prev.map((p) =>
        p.id === selectedProvider.id
          ? { ...p, currentWorkload: p.currentWorkload + 1 }
          : p
      )
    );

    // Save request to state
    setRequests((prev) => [newRequest, ...prev]);

    // Send in-app notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Booking Confirmed & Escrow Secured',
      message: `${selectedProvider.name} booked for ${inFlightRequestData.subService} (${inFlightRequestData.preferredTime}). Payment: ${paymentDetails.method.toUpperCase()} (TrxID: ${paymentDetails.transactionId || 'COD'}).`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
      requestId: newRequestId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Clear pending states
    setPendingBooking(null);
    setShowPaymentModal(false);

    // Direct navigation to active job tracker
    setActiveTrackingRequest(newRequest);
    setActiveCustomerTab('my-jobs');

    // Display dedicated "Payment Successful & Request Sent" popup dialog!
    setSuccessModalData({
      request: newRequest,
      provider: selectedProvider,
      payment: paymentDetails,
    });
  };

  // Close payment modal handler
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSettlingPaymentRequest(null);
    // If user was creating a new booking and cancels before paying, reopen matching modal
    if (pendingBooking) {
      setShowMatchingModal(true);
    }
  };

  // Provider Accepts Request
  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            status: 'Accepted',
            timeline: [
              ...r.timeline,
              {
                status: 'Accepted',
                timestamp: 'Just now',
                note: 'Provider confirmed appointment and is preparing tools',
              },
            ],
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Job Accepted',
      message: `Appointment #${requestId} has been confirmed.`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
      requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Provider Rejects Request -> Automatic Reassignment to 2nd rank provider
  const handleRejectRequest = (requestId: string, reason: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Release slot from rejected provider
    if (targetReq.assignedProviderId) {
      setBookedSlots((prev) => {
        const provSlots = prev[targetReq.assignedProviderId!] || [];
        return {
          ...prev,
          [targetReq.assignedProviderId!]: provSlots.filter(
            (slot) => slot !== targetReq.preferredTime
          ),
        };
      });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === targetReq.assignedProviderId
            ? { ...p, currentWorkload: Math.max(0, p.currentWorkload - 1) }
            : p
        )
      );
    }

    // Find next eligible provider excluding rejected provider
    const nextMatches = rankProviders({
      providers: providers.filter((p) => p.id !== targetReq.assignedProviderId),
      category: targetReq.serviceCategory,
      subService: targetReq.serviceType,
      location: targetReq.location,
      preferredTime: targetReq.preferredTime,
      urgency: targetReq.urgency,
      bookedProviderSlots: bookedSlots,
    });

    const fallback = nextMatches[0]?.provider;

    if (fallback) {
      // Reassign to fallback
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            const updated: ServiceRequest = {
              ...r,
              assignedProviderId: fallback.id,
              assignedProviderName: fallback.name,
              status: 'Assigned',
              timeline: [
                ...r.timeline,
                {
                  status: 'Rejected',
                  timestamp: 'Just now',
                  note: `Original technician was unavailable: ${reason}`,
                },
                {
                  status: 'Assigned',
                  timestamp: 'Just now',
                  note: `Smart Dispatch auto-reassigned to next best technician: ${fallback.name}`,
                },
              ],
            };
            if (activeTrackingRequest?.id === requestId) {
              setActiveTrackingRequest(updated);
            }
            return updated;
          }
          return r;
        })
      );

      // Lock slot for fallback
      setBookedSlots((prev) => ({
        ...prev,
        [fallback.id]: [...(prev[fallback.id] || []), targetReq.preferredTime],
      }));

      // Update fallback provider workload
      setProviders((prev) =>
        prev.map((p) =>
          p.id === fallback.id
            ? { ...p, currentWorkload: p.currentWorkload + 1 }
            : p
        )
      );

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: 'Smart Reassignment Triggered',
        message: `Job #${requestId} auto-assigned to ${fallback.name} after rejection.`,
        timestamp: 'Just now',
        type: 'warning',
        read: false,
        requestId,
      };
      setNotifications((prev) => [notif, ...prev]);
    } else {
      // No fallback available -> set to Requested
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            return {
              ...r,
              assignedProviderId: undefined,
              assignedProviderName: undefined,
              status: 'Requested',
              timeline: [
                ...r.timeline,
                {
                  status: 'Rejected',
                  timestamp: 'Just now',
                  note: `Provider rejected (${reason}). Pending manual redispatch.`,
                },
              ],
            };
          }
          return r;
        })
      );
    }
  };

  // Universal Status Update (Accepted -> On The Way -> In Progress -> Completed)
  const handleUpdateJobStatus = (
    requestId: string,
    newStatus: ServiceStatus,
    customNote?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            status: newStatus,
            timeline: [
              ...r.timeline,
              {
                status: newStatus,
                timestamp: 'Just now',
                note:
                  customNote ||
                  (newStatus === 'On The Way'
                    ? 'Technician is en route with toolkit and materials'
                    : newStatus === 'In Progress'
                    ? 'Work has commenced at customer premises'
                    : newStatus === 'Completed'
                    ? 'Job successfully completed and verified'
                    : `Status updated to ${newStatus}`),
              },
            ],
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    // If completed, release slot and decrement workload
    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
      const target = requests.find((r) => r.id === requestId);
      if (target?.assignedProviderId) {
        setBookedSlots((prev) => {
          const slots = prev[target.assignedProviderId!] || [];
          return {
            ...prev,
            [target.assignedProviderId!]: slots.filter(
              (s) => s !== target.preferredTime
            ),
          };
        });

        setProviders((prev) =>
          prev.map((p) =>
            p.id === target.assignedProviderId
              ? {
                  ...p,
                  currentWorkload: Math.max(0, p.currentWorkload - 1),
                  completedJobs:
                    newStatus === 'Completed'
                      ? p.completedJobs + 1
                      : p.completedJobs,
                }
              : p
          )
        );
      }
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: `Status: ${newStatus}`,
      message: `Request #${requestId} transitioned to ${newStatus}.`,
      timestamp: 'Just now',
      type: newStatus === 'Completed' ? 'success' : 'info',
      read: false,
      requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // ADMIN ACTION: Force Reassign Provider
  const handleAdminReassign = (requestId: string, newProviderId: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    const newProv = providers.find((p) => p.id === newProviderId);
    if (!targetReq || !newProv) return;

    // Release slot from old provider if exists
    if (targetReq.assignedProviderId) {
      setBookedSlots((prev) => ({
        ...prev,
        [targetReq.assignedProviderId!]: (
          prev[targetReq.assignedProviderId!] || []
        ).filter((s) => s !== targetReq.preferredTime),
      }));
      setProviders((prev) =>
        prev.map((p) =>
          p.id === targetReq.assignedProviderId
            ? { ...p, currentWorkload: Math.max(0, p.currentWorkload - 1) }
            : p
        )
      );
    }

    // Assign to new provider
    setBookedSlots((prev) => ({
      ...prev,
      [newProviderId]: [
        ...(prev[newProviderId] || []),
        targetReq.preferredTime,
      ],
    }));

    setProviders((prev) =>
      prev.map((p) =>
        p.id === newProviderId
          ? { ...p, currentWorkload: p.currentWorkload + 1 }
          : p
      )
    );

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            assignedProviderId: newProv.id,
            assignedProviderName: newProv.name,
            status: 'Assigned',
            timeline: [
              ...r.timeline,
              {
                status: 'Assigned',
                timestamp: 'Just now',
                note: `HQ Admin reassigned order to ${newProv.name}`,
              },
            ],
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Admin Force Reassigned',
      message: `Request #${requestId} manually assigned to ${newProv.name}.`,
      timestamp: 'Just now',
      type: 'warning',
      read: false,
      requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // ADMIN ACTION: Toggle Provider Verification
  const handleToggleProviderVerification = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, isVerified: !p.isVerified } : p
      )
    );
  };

  // ADMIN ACTION: Toggle Provider Suspension
  const handleToggleProviderSuspension = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          const nextStatus = p.status === 'suspended' ? 'active' : 'suspended';
          return { ...p, status: nextStatus, isAvailable: nextStatus === 'active' };
        }
        return p;
      })
    );
  };

  // ADMIN ACTION: Add New Provider
  const handleAddNewProvider = (newProv: ServiceProvider) => {
    setProviders((prev) => [newProv, ...prev]);
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Provider Onboarded',
      message: `${newProv.name} registered and active in ${newProv.location}.`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // ADMIN ACTION: Toggle Category Active
  const handleToggleCategoryActive = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId ? { ...c, isActive: !c.isActive } : c
      )
    );
  };

  // CUSTOMER ACTION: Rate & Review Completed Service
  const handleRateService = (requestId: string, rating: number, feedback: string) => {
    const formattedTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            rating,
            feedback,
            ratedAt: `Today at ${formattedTimestamp}`,
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    const targetReq = requests.find((r) => r.id === requestId);
    const providerName = targetReq?.assignedProviderName || 'Technician';

    // Recalculate provider overall rating if provider is found
    if (targetReq?.assignedProviderId) {
      setProviders((prev) =>
        prev.map((p) => {
          if (p.id === targetReq.assignedProviderId) {
            const isFirstReview = !targetReq.rating;
            const newCount = p.reviewCount + (isFirstReview ? 1 : 0);
            const totalScore = (p.rating * p.reviewCount) + rating;
            const nextAvg = Number((totalScore / newCount).toFixed(1));
            return {
              ...p,
              rating: Math.min(5, Math.max(1, nextAvg)),
              reviewCount: newCount,
            };
          }
          return p;
        })
      );
    }

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'Review Submitted',
      message: `Thank you for reviewing ${providerName} (${rating}★) for ${targetReq?.serviceType || 'completed service'}.`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
      requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Feature Handlers: In-App Chat, Work Proof, Digital Warranty, Map Navigation
  const handleOpenChat = (request: ServiceRequest) => {
    setActiveChatRequest(request);
  };

  const handleOpenWorkProof = (request: ServiceRequest) => {
    setActiveProofRequest(request);
  };

  const handleOpenWarranty = (request: ServiceRequest) => {
    setActiveWarrantyRequest(request);
  };

  const handleOpenMapNavigation = (request: ServiceRequest) => {
    setActiveMapNavRequest(request);
  };

  const handleSaveProofPhotos = (
    requestId: string,
    proof: {
      before?: { url: string; note: string; timestamp: string };
      after?: { url: string; note: string; timestamp: string };
    }
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            proofPhotos: {
              ...(r.proofPhotos || {}),
              ...proof,
            },
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'কাজের ফটো প্রুফ সংরক্ষিত',
      message: `অর্ডার #${requestId}-এর কাজের নষ্ট পার্টস/ফ্রেশ কাজের ছবি ইনভয়েস ও জব হিস্ট্রিতে সেভ করা হয়েছে।`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
      requestId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleClaimWarrantyRework = (
    originalRequest: ServiceRequest,
    claimDetails: {
      issueType: string;
      description: string;
      preferredDate: string;
      preferredTime: string;
    }
  ) => {
    const requestId = originalRequest.id;
    const issueDetails = `${claimDetails.issueType ? `[${claimDetails.issueType}] ` : ''}${claimDetails.description}`;
    const requestedDate = claimDetails.preferredDate;
    const requestedTime = claimDetails.preferredTime;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated: ServiceRequest = {
            ...r,
            status: 'Accepted',
            isWarrantyClaim: true,
            description: `[ফ্রি রি-ওয়ার্ক / FREE REWORK]: ${issueDetails} (পূর্ববর্তী কাজ: ${r.serviceType})`,
            preferredDate: requestedDate || r.preferredDate,
            preferredTime: requestedTime || r.preferredTime,
            timeline: [
              ...r.timeline,
              {
                status: 'Accepted',
                timestamp: 'Just now',
                note: `Free Rework Claim Approved under Warranty. Issue: ${issueDetails}`,
              },
            ],
            warranty: {
              durationDays: r.warranty?.durationDays || 14,
              startDate: r.warranty?.startDate || r.preferredDate,
              endDate: r.warranty?.endDate || '2026-09-30',
              status: 'claimed',
              warrantyCode: r.warranty?.warrantyCode || `WAR-${r.id}-14D`,
              claimCount: (r.warranty?.claimCount || 0) + 1,
              claimDetails: issueDetails,
            },
          };
          if (activeTrackingRequest?.id === requestId) {
            setActiveTrackingRequest(updated);
          }
          return updated;
        }
        return r;
      })
    );

    const reworkNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: 'ফ্রি রি-ওয়ার্ক ক্লেইম জমা হয়েছে ✓',
      message: `অর্ডার #${requestId}-এর জন্য ফ্রি ওয়ারেন্টি সার্ভিস সফলভাবে কনফার্ম হয়েছে। টেকনিশিয়ান সম্পূর্ণ বিনা খরচে নির্ধারিত সময়ে সেবা প্রদান করবেন।`,
      timestamp: 'Just now',
      type: 'success',
      read: false,
      requestId,
    };
    setNotifications((prev) => [reworkNotif, ...prev]);
    setActiveWarrantyRequest(null);
  };

  const handleSendMessage = (
    text: string,
    attachmentType?: 'text' | 'image' | 'location',
    attachmentUrl?: string,
    locationData?: {
      address: string;
      lat: number;
      lng: number;
      mapsUrl: string;
    }
  ) => {
    if (!activeChatRequest) return;
    const reqId = activeChatRequest.id;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      requestId: reqId,
      senderId: currentUser?.id || 'cust_fahim',
      senderName: currentUser?.name || 'User',
      senderRole: (currentUser?.role as 'customer' | 'provider' | 'admin') || 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: attachmentType || 'text',
      imageUrl: attachmentUrl,
      location: locationData
        ? {
            address: locationData.address,
            lat: locationData.lat,
            lng: locationData.lng,
            mapUrl: locationData.mapsUrl,
          }
        : undefined,
    };

    setChatMessages((prev) => ({
      ...prev,
      [reqId]: [...(prev[reqId] || []), newMsg],
    }));
  };

  // Derive counts for current provider
  const activeProvId = currentUser?.role === 'provider' ? currentUser.id : 'prov_1';
  const providerIncoming = requests.filter(
    (r) => r.assignedProviderId === activeProvId && r.status === 'Assigned'
  );
  const providerActive = requests.filter(
    (r) =>
      r.assignedProviderId === activeProvId &&
      ['Accepted', 'On The Way', 'In Progress'].includes(r.status)
  );

  // Derive counts for current customer
  const customerRequests = currentUser
    ? requests.filter((r) => r.customerId === currentUser.id)
    : [];
  const activeCustomerOrdersCount = customerRequests.filter(
    (r) => !['Completed', 'Cancelled'].includes(r.status)
  ).length;

  // Active provider entity
  const currentProviderEntity =
    providers.find((p) => p.id === activeProvId) || providers[0];

  // If NOT LOGGED IN, show full-screen AuthView!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8">
        <AuthView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeCustomerTab={activeCustomerTab}
        onSelectCustomerTab={handleSelectCustomerTab}
        activeProviderTab={activeProviderTab}
        onSelectProviderTab={handleSelectProviderTab}
        activeAdminTab={activeAdminTab}
        onSelectAdminTab={handleSelectAdminTab}
        notifications={notifications}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenDocs={() => setShowDocsModal(true)}
        activeRequestsCount={
          currentUser.role === 'customer'
            ? activeCustomerOrdersCount
            : currentUser.role === 'provider'
            ? providerActive.length
            : requests.filter((r) => ['Requested', 'Assigned', 'Accepted', 'On The Way', 'In Progress'].includes(r.status)).length
        }
        incomingRequestsCount={providerIncoming.length}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Role-Specific Body */}
      <main className="flex-1 flex flex-col transition-opacity duration-200 pb-20 md:pb-0">
        {/* ======================================================== */}
        {/* ROLE: CUSTOMER                                          */}
        {/* ======================================================== */}
        {currentUser.role === 'customer' ? (
          activeTrackingRequest ? (
            <RequestTrackingView
              request={activeTrackingRequest}
              provider={
                providers.find(
                  (p) => p.id === activeTrackingRequest.assignedProviderId
                ) || providers[0]
              }
              userRole="customer"
              onBack={() => setActiveTrackingRequest(null)}
              onCancelRequest={(reqId) =>
                handleUpdateJobStatus(reqId, 'Cancelled', 'Cancelled by customer')
              }
              onOpenPaymentModal={(req) => {
                setSettlingPaymentRequest(req);
                setShowPaymentModal(true);
              }}
              onOpenInvoiceModal={(req) => {
                setSelectedInvoiceRequest(req);
              }}
              onRateService={handleRateService}
              onOpenChat={handleOpenChat}
              onOpenWorkProof={handleOpenWorkProof}
              onOpenWarranty={handleOpenWarranty}
              onOpenMapNavigation={handleOpenMapNavigation}
            />
          ) : activeCustomerTab === 'home' ? (
            <CustomerHome
              user={currentUser}
              currentUser={currentUser}
              categories={categories}
              onSelectCategory={handleSelectCategory}
              onBookDirectService={handleBookDirectService}
              onOpenEmergency={handleOpenEmergency}
              onOpenAiAnalyzer={() => setShowAiModal(true)}
              onTrackRequest={(req) => setActiveTrackingRequest(req)}
              onViewRequest={(req) => setActiveTrackingRequest(req)}
              recentRequests={customerRequests}
              providers={providers}
              allRequests={requests}
              onDirectHireProvider={handleDirectHireProvider}
            />
          ) : activeCustomerTab === 'explore' ? (
            <CustomerExploreView
              categories={categories}
              onSelectService={(category, subService, prefill) => {
                setInFlightCategory(category);
                setInFlightSubService(subService);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                if (prefill) {
                  setInFlightLocation(prefill.location || '');
                  setInFlightDate(prefill.date || '');
                  setInFlightTime(prefill.time || '');
                } else {
                  setInFlightLocation('');
                  setInFlightDate('');
                  setInFlightTime('');
                }
                setShowCreateModal(true);
              }}
              onRequestWizard={(prefill) => {
                const defaultCat = categories[0] || SERVICE_CATEGORIES[0];
                setInFlightCategory(defaultCat);
                setInFlightSubService(defaultCat.subServices[0]);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                if (prefill) {
                  setInFlightLocation(prefill.location || '');
                  setInFlightDate(prefill.date || '');
                  setInFlightTime(prefill.time || '');
                } else {
                  setInFlightLocation('');
                  setInFlightDate('');
                  setInFlightTime('');
                }
                setShowCreateModal(true);
              }}
              onOpenAiAnalyzer={() => setShowAiModal(true)}
            />
          ) : activeCustomerTab === 'my-jobs' ? (
            <CustomerJobsView
              requests={customerRequests}
              onOpenTracking={(req) => setActiveTrackingRequest(req)}
              onTrackRequest={(req) => setActiveTrackingRequest(req)}
              onRequestNewService={() => {
                const defaultCat = categories[0] || SERVICE_CATEGORIES[0];
                setInFlightCategory(defaultCat);
                setInFlightSubService(defaultCat.subServices[0]);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                setInFlightLocation('');
                setInFlightDate('');
                setInFlightTime('');
                setShowCreateModal(true);
              }}
              onNewRequest={() => {
                const defaultCat = categories[0] || SERVICE_CATEGORIES[0];
                setInFlightCategory(defaultCat);
                setInFlightSubService(defaultCat.subServices[0]);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                setInFlightLocation('');
                setInFlightDate('');
                setInFlightTime('');
                setShowCreateModal(true);
              }}
              onCancelRequest={(reqId) =>
                handleUpdateJobStatus(reqId, 'Cancelled', 'Cancelled by customer')
              }
              onOpenPaymentModal={(req) => {
                setSettlingPaymentRequest(req);
                setShowPaymentModal(true);
              }}
              onOpenInvoiceModal={(req) => {
                setSelectedInvoiceRequest(req);
              }}
              onRateService={handleRateService}
              onOpenChat={handleOpenChat}
              onOpenWorkProof={handleOpenWorkProof}
              onOpenWarranty={handleOpenWarranty}
              onOpenMapNavigation={handleOpenMapNavigation}
              onSimulateAdvance={(reqId) => {
                const req = requests.find((r) => r.id === reqId);
                if (!req) return;
                const nextStates: Record<ServiceStatus, ServiceStatus | null> = {
                  Requested: 'Assigned',
                  Assigned: 'Accepted',
                  Accepted: 'On The Way',
                  'On The Way': 'In Progress',
                  'In Progress': 'Completed',
                  Completed: null,
                  Cancelled: null,
                  Rejected: null,
                };
                const next = nextStates[req.status];
                if (next) {
                  handleUpdateJobStatus(reqId, next);
                }
              }}
            />
          ) : activeCustomerTab === 'profile' ? (
            <CustomerProfileView
              currentUser={currentUser}
              onSwitchToProvider={() => handleSwitchRole('provider')}
              activeRequestsCount={activeCustomerOrdersCount}
              onUpdateProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
                updateStoredUser(updatedUser);
              }}
            />
          ) : (
            /* Fallback for 'request' button */
            <CustomerExploreView
              categories={categories}
              onSelectService={(category, subService) => {
                setInFlightCategory(category);
                setInFlightSubService(subService);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                setShowCreateModal(true);
              }}
              onRequestWizard={() => {
                const defaultCat = categories[0] || SERVICE_CATEGORIES[0];
                setInFlightCategory(defaultCat);
                setInFlightSubService(defaultCat.subServices[0]);
                setInFlightUrgency('Normal');
                setInFlightDescription('');
                setShowCreateModal(true);
              }}
              onOpenAiAnalyzer={() => setShowAiModal(true)}
            />
          )
        ) : currentUser.role === 'provider' ? (
          /* ======================================================== */
          /* ROLE: PROVIDER                                          */
          /* ======================================================== */
          activeTrackingRequest ? (
            <RequestTrackingView
              request={activeTrackingRequest}
              provider={currentProviderEntity}
              userRole="provider"
              onBack={() => setActiveTrackingRequest(null)}
              onSimulateStatusUpdate={(reqId, newStatus, note) =>
                handleUpdateJobStatus(reqId, newStatus, note)
              }
              onCancelRequest={(reqId) =>
                handleUpdateJobStatus(reqId, 'Cancelled', 'Cancelled / Released by provider')
              }
              onOpenInvoiceModal={(req) => {
                setSelectedInvoiceRequest(req);
              }}
              onOpenChat={handleOpenChat}
              onOpenWorkProof={handleOpenWorkProof}
              onOpenWarranty={handleOpenWarranty}
              onOpenMapNavigation={handleOpenMapNavigation}
            />
          ) : activeProviderTab === 'profile' ? (
            <ProviderProfileView
              provider={currentProviderEntity}
              onSwitchToCustomer={() => handleSwitchRole('customer')}
              onToggleAvailability={() =>
                setProviders((prev) =>
                  prev.map((p) =>
                    p.id === currentProviderEntity.id
                      ? { ...p, isAvailable: !p.isAvailable }
                      : p
                  )
                )
              }
              onUpdateProvider={(updatedProvider) => {
                setProviders((prev) =>
                  prev.map((p) => (p.id === updatedProvider.id ? updatedProvider : p))
                );
                if (currentUser && currentUser.id === updatedProvider.id) {
                  const updatedUser: AppUser = {
                    ...currentUser,
                    name: updatedProvider.name,
                    phone: updatedProvider.phone,
                    email: updatedProvider.email,
                    location: updatedProvider.location,
                    avatarUrl: updatedProvider.avatar,
                    experienceYears: updatedProvider.experienceYears,
                    basePrice: updatedProvider.basePrice,
                    tradeLicense: updatedProvider.tradeLicense,
                    specialties: updatedProvider.specialties,
                    bio: updatedProvider.bio,
                    detailedAddress: updatedProvider.detailedAddress,
                    emergencyContactName: updatedProvider.emergencyContactName,
                    emergencyContactPhone: updatedProvider.emergencyContactPhone,
                  };
                  setCurrentUser(updatedUser);
                  updateStoredUser(updatedUser);
                }
              }}
            />
          ) : (
            <ProviderDashboardView
              provider={currentProviderEntity}
              incomingRequests={providerIncoming}
              activeJobs={providerActive}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onUpdateJobStatus={(reqId, st) => handleUpdateJobStatus(reqId, st)}
              onTrackJob={(job) => setActiveTrackingRequest(job)}
              onOpenChat={handleOpenChat}
              onOpenWorkProof={handleOpenWorkProof}
              onOpenMapNavigation={handleOpenMapNavigation}
              onToggleAvailability={(avail) =>
                setProviders((prev) =>
                  prev.map((p) =>
                    p.id === currentProviderEntity.id
                      ? { ...p, isAvailable: avail }
                      : p
                  )
                )
              }
              activeTab={
                activeProviderTab as 'home' | 'requests' | 'jobs' | 'schedule'
              }
              onTabChange={(tab) => setActiveProviderTab(tab)}
            />
          )
        ) : (
          /* ======================================================== */
          /* ROLE: ADMIN                                             */
          /* ======================================================== */
          <AdminDashboardView
            adminUser={currentUser}
            requests={requests}
            providers={providers}
            categories={categories}
            onUpdateJobStatus={handleUpdateJobStatus}
            onReassignProvider={handleAdminReassign}
            onToggleProviderVerification={handleToggleProviderVerification}
            onToggleProviderSuspension={handleToggleProviderSuspension}
            onAddNewProvider={handleAddNewProvider}
            onToggleCategoryActive={handleToggleCategoryActive}
            onUpdateAdminProfile={(updatedAdmin) => {
              setCurrentUser(updatedAdmin);
              updateStoredUser(updatedAdmin);
            }}
            activeSubTab={activeAdminTab}
            onSubTabChange={(tab) => setActiveAdminTab(tab)}
          />
        )}
      </main>

      {/* Global Modals */}
      {/* 1. Auth Modal (When user clicks "Switch Account / Login" while logged in) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700"
            >
              ✕ Close Dialog
            </button>
            <AuthView
              onLoginSuccess={handleLoginSuccess}
              initialRole={currentUser?.role}
            />
          </div>
        </div>
      )}

      {/* 2. AI Analyzer Modal */}
      <AiAnalyzerModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyAnalysis={handleApplyAiAnalysis}
      />

      {/* 3. Create Request Modal */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setInFlightLocation('');
          setInFlightDate('');
          setInFlightTime('');
        }}
        initialCategory={inFlightCategory}
        initialSubService={inFlightSubService}
        initialUrgency={inFlightUrgency}
        initialDescription={inFlightDescription}
        initialLocation={inFlightLocation}
        initialDate={inFlightDate}
        initialTime={inFlightTime}
        userLocation={inFlightLocation || currentUser?.location || 'Dhanmondi'}
        userPhone={currentUser?.phone || '+880 1712-998877'}
        onSubmit={handleSubmitRequestForm}
      />

      {/* 4. Provider Matching Modal */}
      <ProviderMatchingModal
        isOpen={showMatchingModal}
        onClose={() => setShowMatchingModal(false)}
        matches={currentMatches}
        category={inFlightRequestData?.category || ''}
        subService={inFlightRequestData?.subService || ''}
        location={inFlightRequestData?.location || ''}
        preferredTime={inFlightRequestData?.preferredTime || ''}
        urgency={inFlightRequestData?.urgency || 'Normal'}
        onSelectProvider={handleSelectProvider}
        allRequests={requests}
        currentUserId={currentUser?.id}
      />

      {/* 5. Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
      />

      {/* 6. Flutter Hackathon Architecture Docs Modal */}
      <FlutterDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />

      {/* 7. Payment Gateway Checkout Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        serviceName={
          settlingPaymentRequest
            ? settlingPaymentRequest.serviceType
            : inFlightRequestData?.subService || 'Home Service'
        }
        categoryName={
          settlingPaymentRequest
            ? settlingPaymentRequest.serviceCategory
            : inFlightRequestData?.category || 'Service'
        }
        provider={
          settlingPaymentRequest
            ? providers.find((p) => p.id === settlingPaymentRequest.assignedProviderId) || null
            : pendingBooking?.provider || null
        }
        baseAmount={
          settlingPaymentRequest
            ? (settlingPaymentRequest.payment?.remainingDue || settlingPaymentRequest.estimatedPrice)
            : (pendingBooking?.provider.basePrice || 1000)
        }
        scheduledTime={
          settlingPaymentRequest
            ? settlingPaymentRequest.preferredTime
            : inFlightRequestData?.preferredTime || 'Immediate'
        }
        scheduledDate={
          settlingPaymentRequest
            ? settlingPaymentRequest.preferredDate
            : inFlightRequestData?.preferredDate || 'Today'
        }
        location={
          settlingPaymentRequest
            ? settlingPaymentRequest.location
            : inFlightRequestData?.location || 'Dhaka'
        }
        onPaymentComplete={handlePaymentComplete}
        existingRequestId={settlingPaymentRequest?.id}
        isSettlingRemaining={!!settlingPaymentRequest}
      />

      {/* 8. Digital Tax Invoice / Receipt Modal */}
      {selectedInvoiceRequest && (
        <InvoiceReceiptModal
          isOpen={!!selectedInvoiceRequest}
          onClose={() => setSelectedInvoiceRequest(null)}
          request={selectedInvoiceRequest}
          provider={providers.find((p) => p.id === selectedInvoiceRequest.assignedProviderId)}
        />
      )}

      {/* 9. Payment Successful & Request Sent Pop-up Modal */}
      {successModalData && (
        <PaymentSuccessModal
          isOpen={!!successModalData}
          onClose={() => setSuccessModalData(null)}
          request={successModalData.request}
          provider={successModalData.provider}
          payment={successModalData.payment}
          onTrackOrder={(req) => {
            setActiveTrackingRequest(req);
            setActiveCustomerTab('my-jobs');
            setSuccessModalData(null);
          }}
          onViewInvoice={(req) => {
            setSelectedInvoiceRequest(req);
            setSuccessModalData(null);
          }}
        />
      )}

      {/* 10. In-App Direct Chat & Direct Call Modal */}
      {activeChatRequest && (
        <InAppChatModal
          isOpen={!!activeChatRequest}
          onClose={() => setActiveChatRequest(null)}
          request={activeChatRequest}
          provider={providers.find((p) => p.id === activeChatRequest.assignedProviderId)}
          currentUserRole={(currentUser?.role as 'customer' | 'provider' | 'admin') || 'customer'}
          messages={chatMessages[activeChatRequest.id] || []}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* 11. Work Proof (Before & After Photo Upload) Modal */}
      {activeProofRequest && (
        <WorkProofUploadModal
          isOpen={!!activeProofRequest}
          onClose={() => setActiveProofRequest(null)}
          request={activeProofRequest}
          onSaveProof={handleSaveProofPhotos}
          userRole={(currentUser?.role as 'customer' | 'provider' | 'admin') || 'customer'}
        />
      )}

      {/* 12. Digital Warranty & Free Rework Claim Modal */}
      {activeWarrantyRequest && (
        <DigitalWarrantyModal
          isOpen={!!activeWarrantyRequest}
          onClose={() => setActiveWarrantyRequest(null)}
          request={activeWarrantyRequest}
          provider={providers.find((p) => p.id === activeWarrantyRequest.assignedProviderId)}
          onClaimFreeRework={handleClaimWarrantyRework}
        />
      )}

      {/* 13. Service Provider Google Map Live Navigation Modal */}
      {activeMapNavRequest && (
        <ProviderMapNavigationModal
          isOpen={!!activeMapNavRequest}
          onClose={() => setActiveMapNavRequest(null)}
          request={activeMapNavRequest}
          provider={providers.find((p) => p.id === activeMapNavRequest.assignedProviderId)}
          onOpenChat={(req) => {
            setActiveMapNavRequest(null);
            setActiveChatRequest(req);
          }}
        />
      )}
    </div>
  );
}
