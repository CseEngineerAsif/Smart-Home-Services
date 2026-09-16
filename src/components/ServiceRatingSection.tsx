import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Edit3,
  ThumbsUp,
  Sparkles,
  Send,
  X,
} from 'lucide-react';

interface ServiceRatingSectionProps {
  requestId: string;
  serviceType: string;
  providerName?: string;
  existingRating?: number;
  existingFeedback?: string;
  ratedAt?: string;
  onSubmitRating: (requestId: string, rating: number, feedback: string) => void;
  compact?: boolean;
}

const QUICK_TAGS = [
  'Punctual & On-Time',
  'Polite & Professional',
  'Clean & Tidy Work',
  'Expert Diagnosis',
  'Fair & Transparent',
  'Quick Resolution',
];

const RATING_LABELS: { [key: number]: string } = {
  1: 'Poor - Did not resolve issue',
  2: 'Fair - Below expectations',
  3: 'Good - Satisfactory work',
  4: 'Very Good - Thorough and clean',
  5: 'Excellent - Highly recommended!',
};

export const ServiceRatingSection: React.FC<ServiceRatingSectionProps> = ({
  requestId,
  serviceType,
  providerName = 'the technician',
  existingRating,
  existingFeedback,
  ratedAt,
  onSubmitRating,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!existingRating);
  const [rating, setRating] = useState<number>(existingRating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(existingFeedback || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      // Optionally remove from feedback if it was added
    } else {
      setSelectedTags([...selectedTags, tag]);
      // Append to feedback if not already included
      if (!feedback.includes(tag)) {
        setFeedback((prev) => (prev ? `${prev}. ${tag}` : tag));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;

    onSubmitRating(requestId, rating, feedback.trim());
    setIsEditing(false);
    setIsSubmittedSuccess(true);
    setTimeout(() => setIsSubmittedSuccess(false), 3000);
  };

  const displayRating = hoverRating || rating;

  // View Mode (When already rated and not actively editing)
  if (!isEditing && existingRating) {
    return (
      <div className="mt-4 pt-3.5 border-t border-slate-100 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center text-amber-500 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= existingRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </span>
            <span className="text-xs font-extrabold text-slate-800">
              {existingRating}.0 / 5.0
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Review
            </span>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
            title="Edit your rating and feedback"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Review</span>
          </button>
        </div>

        {existingFeedback && (
          <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200/80">
            &ldquo;{existingFeedback}&rdquo;
          </p>
        )}

        {ratedAt && (
          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Reviewed for: <strong className="text-slate-600 font-semibold">{providerName}</strong></span>
            <span>{ratedAt}</span>
          </p>
        )}
      </div>
    );
  }

  // Edit / Input Mode
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 bg-gradient-to-b from-amber-50/40 via-white to-slate-50/50 rounded-2xl p-4 border border-amber-200/60 shadow-2xs">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header Prompt */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Rate & Review This Service
              </h4>
              <p className="text-[11px] text-slate-500">
                How was your experience with <span className="font-semibold text-slate-700">{providerName}</span>?
              </p>
            </div>
          </div>

          {existingRating && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interactive Star Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-hidden transition-transform hover:scale-110"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= displayRating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-3">
            <span className="text-xs font-bold text-amber-800">
              {RATING_LABELS[displayRating] || `${displayRating} Stars`}
            </span>
          </div>
        </div>

        {/* Quick Compliment Tags */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Feedback Highlights:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div className="relative">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Share any specific details about the work done, punctuality, and overall satisfaction for ${serviceType}...`}
            rows={2}
            maxLength={400}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400 shadow-2xs resize-none"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Honest reviews help our Dhaka community choose top-rated technicians.</span>
            <span>{feedback.length} / 400</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
          {existingRating && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{existingRating ? 'Update Review' : 'Submit Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
