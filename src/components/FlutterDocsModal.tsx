import React, { useState } from 'react';
import { X, Code, Copy, Check, FileText, Layers, Database, Sparkles, Terminal } from 'lucide-react';

interface FlutterDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FLUTTER_CODE_SNIPPETS: { title: string; filename: string; code: string; desc: string }[] = [
  {
    title: 'Provider Matching Service (Dart)',
    filename: 'lib/services/provider_matching_service.dart',
    desc: 'Intelligent multi-factor scoring (Expertise 30%, Availability 25%, Rating 20%, Distance 15%, Price 10%) & Emergency prioritization.',
    code: `import 'dart:math';
import '../models/provider_model.dart';

class ProviderMatchResult {
  final ServiceProviderModel provider;
  final int matchScore;
  final double distanceKm;
  final bool isSlotAvailable;
  final String explanation;
  final List<String> badges;

  ProviderMatchResult({
    required this.provider,
    required this.matchScore,
    required this.distanceKm,
    required this.isSlotAvailable,
    required this.explanation,
    required this.badges,
  });
}

class ProviderMatchingService {
  static const Map<String, Map<String, double>> dhakaDistances = {
    'Dhanmondi': {'Dhanmondi': 1.0, 'Mohammadpur': 2.2, 'Mirpur': 6.5, 'Banani': 7.8, 'Gulshan': 8.5},
    'Mirpur': {'Mirpur': 1.2, 'Mohammadpur': 4.5, 'Dhanmondi': 6.5, 'Banani': 7.0, 'Uttara': 8.0},
    'Uttara': {'Uttara': 1.5, 'Banani': 8.2, 'Gulshan': 9.5, 'Mirpur': 8.0, 'Dhanmondi': 14.0},
  };

  static double getDistance(String userLoc, String providerLoc) {
    if (dhakaDistances.containsKey(userLoc) && dhakaDistances[userLoc]!.containsKey(providerLoc)) {
      return dhakaDistances[userLoc]![providerLoc]!;
    }
    return 6.0; // average fallback distance across Dhaka
  }

  static List<ProviderMatchResult> rankProviders({
    required List<ServiceProviderModel> providers,
    required String category,
    required String subService,
    required String location,
    required String preferredTime,
    required String urgency, // Normal, Urgent, Emergency
    required Map<String, List<String>> bookedSlots,
  }) {
    List<ProviderMatchResult> results = [];

    for (var provider in providers) {
      // 1. Service Expertise (0 - 100)
      double expertiseScore = 60.0;
      bool hasCat = provider.serviceCategories.map((c) => c.toLowerCase()).contains(category.toLowerCase());
      bool hasSpec = provider.specialties.map((s) => s.toLowerCase()).contains(subService.toLowerCase());
      if (hasSpec) expertiseScore = 100.0;
      else if (hasCat) expertiseScore = 85.0;
      expertiseScore = min(100.0, expertiseScore + min(15.0, provider.experienceYears * 1.5));

      // 2. Distance Score (0 - 100)
      double distanceKm = getDistance(location, provider.location);
      double distanceScore = max(10.0, min(100.0, 100.0 - (distanceKm / 15.0) * 80.0));

      // 3. Availability & Double-Booking Prevention (0 - 100)
      List<String> lockedSlots = bookedSlots[provider.id] ?? [];
      bool isSlotAvailable = provider.isAvailable &&
          provider.availableTimeSlots.contains(preferredTime) &&
          !lockedSlots.contains(preferredTime);

      double availabilityScore = isSlotAvailable ? 100.0 : (provider.isAvailable ? 60.0 : 20.0);

      // 4. Rating Score (0 - 100)
      double ratingScore = min(100.0, (provider.rating / 5.0) * 100.0);

      // 5. Price Score (0 - 100)
      double priceScore = max(20.0, min(100.0, (1.0 - (provider.basePrice - 700) / 1500.0) * 100.0));

      // 6. Workload Penalty (prevent overloading single provider)
      double workloadPenalty = provider.currentWorkload * 8.0;

      // Urgency Weighting
      double totalScore = 0.0;
      if (urgency == 'Emergency') {
        totalScore = (availabilityScore * 0.35) +
            (distanceScore * 0.30) +
            (expertiseScore * 0.20) +
            (ratingScore * 0.10) +
            (priceScore * 0.05) -
            workloadPenalty;
      } else {
        totalScore = (expertiseScore * 0.30) +
            (availabilityScore * 0.25) +
            (ratingScore * 0.20) +
            (distanceScore * 0.15) +
            (priceScore * 0.10) -
            workloadPenalty;
      }

      int finalScore = max(40, min(99, totalScore.round()));

      List<String> badges = [];
      String explanation = 'Recommended because \${provider.name} has \${provider.experienceYears}y experience in \${provider.location}.';
      if (hasSpec && isSlotAvailable) {
        explanation = 'Recommended because this provider specializes in \$subService, is highly rated (\${provider.rating}★), \${distanceKm.toStringAsFixed(1)} km away, and available at your preferred time.';
      }

      results.add(ProviderMatchResult(
        provider: provider,
        matchScore: finalScore,
        distanceKm: distanceKm,
        isSlotAvailable: isSlotAvailable,
        explanation: explanation,
        badges: badges,
      ));
    }

    results.sort((a, b) => b.matchScore.compareTo(a.matchScore));
    if (results.isNotEmpty) results.first.badges.add('Best Match');
    return results.take(5).toList();
  }
}`,
  },
  {
    title: 'AI Service Assistant (Dart)',
    filename: 'lib/services/ai_service_assistant.dart',
    desc: 'Lightweight rule-based NLP diagnostic engine mapping descriptions to category, sub-service, risk, and urgency.',
    code: `class AiAnalysisResult {
  final String detectedCategory;
  final String detectedSubService;
  final String urgency; // Normal, Urgent, Emergency
  final double confidence;
  final String riskAssessment;
  final String recommendedAction;

  AiAnalysisResult({
    required this.detectedCategory,
    required this.detectedSubService,
    required this.urgency,
    required this.confidence,
    required this.riskAssessment,
    required this.recommendedAction,
  });
}

class AiServiceAssistant {
  static AiAnalysisResult analyze(String text) {
    final lower = text.toLowerCase();

    // Emergency checks (Sparks, smoke, flood, gas)
    if (lower.contains('spark') || lower.contains('smoke') || lower.contains('short circuit') || lower.contains('fire')) {
      return AiAnalysisResult(
        detectedCategory: 'Electrical',
        detectedSubService: 'Emergency Short Circuit Repair',
        urgency: 'Emergency',
        confidence: 0.95,
        riskAssessment: 'High electrocution and fire hazard detected. Switch off main MCB breaker immediately.',
        recommendedAction: 'Immediate dispatch technician with insulated gear prioritized.',
      );
    }

    if (lower.contains('pipe burst') || lower.contains('flooding') || lower.contains('burst pipe')) {
      return AiAnalysisResult(
        detectedCategory: 'Plumbing',
        detectedSubService: 'Pipe Leak Repair',
        urgency: 'Emergency',
        confidence: 0.92,
        riskAssessment: 'Severe water flooding hazard to electrical wiring and property.',
        recommendedAction: 'Shut off main water valve. Nearest emergency plumber assigned.',
      );
    }

    if (lower.contains('ac') || lower.contains('cooling') || lower.contains('rattling')) {
      return AiAnalysisResult(
        detectedCategory: 'Appliance and Gadget Repair',
        detectedSubService: 'AC Repair & Servicing',
        urgency: 'Normal',
        confidence: 0.90,
        riskAssessment: 'Refrigerant pressure drop or condenser fan vibration.',
        recommendedAction: 'Book certified HVAC technician with refrigerant manifold gauge.',
      );
    }

    // Default fallback
    return AiAnalysisResult(
      detectedCategory: 'Appliance and Gadget Repair',
      detectedSubService: 'General Repair',
      urgency: 'Normal',
      confidence: 0.70,
      riskAssessment: 'General diagnosis required on-site.',
      recommendedAction: 'Select technician and choose available time slot.',
    );
  }
}`,
  },
  {
    title: 'Scheduling & Double-Booking Service (Dart)',
    filename: 'lib/services/scheduling_service.dart',
    desc: 'Firestore transactional reservation ensuring no provider is double-booked for the same time slot.',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/booking_model.dart';

class SchedulingService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<bool> bookSlotWithLock({
    required String providerId,
    required String customerId,
    required String requestId,
    required String date,
    required String timeSlot,
  }) async {
    final lockRef = _firestore
        .collection('providers')
        .doc(providerId)
        .collection('locked_slots')
        .doc('\${date}_\$timeSlot');

    return await _firestore.runTransaction((transaction) async {
      final snapshot = await transaction.get(lockRef);
      if (snapshot.exists) {
        // Double-booking collision prevented!
        return false;
      }

      transaction.set(lockRef, {
        'requestId': requestId,
        'customerId': customerId,
        'providerId': providerId,
        'date': date,
        'timeSlot': timeSlot,
        'createdAt': FieldValue.serverTimestamp(),
      });

      // Update provider active workload
      final providerRef = _firestore.collection('providers').doc(providerId);
      transaction.update(providerRef, {
        'currentWorkload': FieldValue.increment(1),
      });

      return true;
    });
  }
}`,
  },
  {
    title: 'pubspec.yaml Dependencies',
    filename: 'pubspec.yaml',
    desc: 'Clean Flutter dependencies with Material 3, Firebase, Provider, and UI utilities.',
    code: `name: smart_home_service_automation
description: BAUST CSE FEST 2026 Hackathon - Smart Home Service Automation Flutter App.
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  firebase_core: ^3.1.0
  firebase_auth: ^5.1.0
  cloud_firestore: ^5.0.1
  firebase_storage: ^12.0.1
  provider: ^6.1.2
  google_fonts: ^6.2.1
  intl: ^0.19.0
  uuid: ^4.4.0
  cached_network_image: ^3.3.1
  flutter_spinkit: ^5.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true`,
  },
];

export const FlutterDocsModal: React.FC<FlutterDocsModalProps> = ({ isOpen, onClose }) => {
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const current = FLUTTER_CODE_SNIPPETS[selectedSnippetIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6 py-6 sm:py-8">
        <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header - Pinned at top */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Flutter & Dart Code Architecture</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Hackathon Blueprint
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  BAUST CSE FEST 2026: Material 3, Clean Architecture, Provider & Cloud Firestore
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Snippet Selector Tabs - Pinned under header */}
          <div className="flex items-center gap-2 px-5 sm:px-6 py-3 overflow-x-auto border-b border-slate-100 shrink-0 bg-white">
            {FLUTTER_CODE_SNIPPETS.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSnippetIdx(idx)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedSnippetIdx === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {snip.title}
              </button>
            ))}
          </div>

          {/* Active Snippet Info & Copy Bar - Pinned under tabs */}
          <div className="px-5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/70 shrink-0 bg-slate-50/50">
            <div>
              <span className="font-mono text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {current.filename}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">{current.desc}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 shadow-xs self-start sm:self-auto"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Content Box - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed shadow-inner">
            <pre className="overflow-x-auto">
              <code>{current.code}</code>
            </pre>
          </div>

          {/* Footer - Pinned at bottom */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0 bg-slate-50/90">
            <span>Complete Flutter code generated with full models, screens & services.</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
            >
              Back to App Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
