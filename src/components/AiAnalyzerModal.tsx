import React, { useState } from 'react';
import { X, Bot, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react';
import { analyzeServiceDescription, AiAnalysisResult } from '../services/aiAssistant';

interface AiAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAnalysis: (categoryName: string, subService: string, urgency: 'Normal' | 'Urgent' | 'Emergency', description: string) => void;
}

const SAMPLE_PROBLEMS = [
  {
    label: 'AC Cooling & Rattling',
    text: 'My AC is making a loud rattling noise and is not cooling the room properly.',
  },
  {
    label: 'Switchboard Sparks (Emergency)',
    text: 'Main electrical switchboard is sparking with burning plastic smell and smoke!',
  },
  {
    label: 'Burst Water Pipe (Emergency)',
    text: 'Kitchen water pipe burst suddenly, flooding the floor and bathroom.',
  },
  {
    label: 'Bed Bug & Cockroach Infestation',
    text: 'Bed bugs in bedroom mattress and cockroaches in kitchen cabinets.',
  },
  {
    label: 'House Shifting',
    text: 'Need to shift 2BHK furniture with packaging and pickup truck to Dhanmondi.',
  },
];

export const AiAnalyzerModal: React.FC<AiAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onApplyAnalysis,
}) => {
  const [problemText, setProblemText] = useState('My AC is making a loud noise and is not cooling properly');
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(() =>
    analyzeServiceDescription('My AC is making a loud noise and is not cooling properly')
  );

  if (!isOpen) return null;

  const handleAnalyze = () => {
    const result = analyzeServiceDescription(problemText);
    setAnalysis(result);
  };

  const handleSelectSample = (sample: string) => {
    setProblemText(sample);
    const result = analyzeServiceDescription(sample);
    setAnalysis(result);
  };

  const handleConfirm = () => {
    if (!analysis) return;
    onApplyAnalysis(
      analysis.detectedCategory,
      analysis.detectedSubService,
      analysis.urgency,
      problemText
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-4 md:p-6 py-6 sm:py-8">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-auto flex flex-col max-h-[92vh] overflow-hidden">
          {/* Modal Header - Pinned at top */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">AI Service Analyzer</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Hackathon Automation
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Rule-based NLP classifier mapping symptoms to categories & urgency levels
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

          {/* Scrollable Modal Body */}
          <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 flex-1">
            {/* Quick Sample Chips */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Quick Test Scenarios:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROBLEMS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.text)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      problemText === sample.text
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Text Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Describe the home issue in natural words:
              </label>
              <textarea
                rows={3}
                value={problemText}
                onChange={(e) => {
                  setProblemText(e.target.value);
                  setAnalysis(analyzeServiceDescription(e.target.value));
                }}
                placeholder="e.g. My AC is making a loud noise and is not cooling properly..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Real-time Analysis Card */}
            {analysis && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-cyan-50/40 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Automated Diagnosis
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence: {(analysis.confidence * 100).toFixed(0)}%</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        analysis.urgency === 'Emergency'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : analysis.urgency === 'Urgent'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {analysis.urgency} Urgency
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">Detected Category</span>
                    <span className="text-slate-900 font-bold text-sm block mt-0.5">{analysis.detectedCategory}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">Suggested Service Type</span>
                    <span className="text-indigo-700 font-bold text-sm block mt-0.5">{analysis.detectedSubService}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs bg-white/80 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-slate-700 font-medium">
                    <strong className="text-slate-900">Safety & Risk Assessment:</strong> {analysis.riskAssessment}
                  </p>
                  <p className="text-indigo-700 mt-1 font-medium">
                    <strong className="text-slate-900">Recommended Action:</strong> {analysis.recommendedAction}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions - Pinned at bottom */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-slate-100 shrink-0 bg-slate-50/90">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              id="apply-ai-diagnosis-btn"
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Proceed to Request with This Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
