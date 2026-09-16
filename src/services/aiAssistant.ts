import { ServiceUrgency } from '../types';

export interface AiAnalysisResult {
  detectedCategory: string;
  detectedSubService: string;
  urgency: ServiceUrgency;
  confidence: number;
  riskAssessment: string;
  recommendedAction: string;
  keyKeywords: string[];
}

interface RulePattern {
  keywords: string[];
  category: string;
  subService: string;
  defaultUrgency: ServiceUrgency;
  riskNotes: string;
  action: string;
}

const KNOWLEDGE_BASE_RULES: RulePattern[] = [
  // Emergency Electrical
  {
    keywords: ['spark', 'sparks', 'sparking', 'smoke', 'fire', 'shock', 'short circuit', 'burning smell', 'blast', 'blast sound'],
    category: 'Electrical',
    subService: 'Emergency Short Circuit Repair',
    defaultUrgency: 'Emergency',
    riskNotes: 'High fire & electrocution hazard detected. Turn off main circuit breaker immediately.',
    action: 'Immediate dispatch technician with insulated gear recommended.',
  },
  // Plumbing leak emergencies
  {
    keywords: ['pipe burst', 'flooding', 'burst pipe', 'water gushing', 'water flooding', 'submerged'],
    category: 'Plumbing',
    subService: 'Pipe Leak Repair',
    defaultUrgency: 'Emergency',
    riskNotes: 'Severe water damage risk to flooring and electrical points.',
    action: 'Shut off main water inlet valve. Emergency plumber prioritized.',
  },
  // AC cooling / noise
  {
    keywords: ['ac', 'air conditioner', 'cooling', 'not cooling', 'rattling', 'compressor', 'gas refill', 'ac noise', 'split ac'],
    category: 'Appliance and Gadget Repair',
    subService: 'AC Repair & Servicing',
    defaultUrgency: 'Normal',
    riskNotes: 'Possible refrigerant leak, dirty condenser coils, or blower motor bearing wear.',
    action: 'Book professional technician with pressure gauge & replacement capacitors.',
  },
  // Refrigerator
  {
    keywords: ['fridge', 'refrigerator', 'deep freezer', 'ice maker', 'food spoiling', 'compressor humming'],
    category: 'Appliance and Gadget Repair',
    subService: 'Refrigerator Repair',
    defaultUrgency: 'Urgent',
    riskNotes: 'Food spoilage hazard within 4 to 6 hours if temperature rises.',
    action: 'Certified refrigerator technician recommended today.',
  },
  // Water pump / motor
  {
    keywords: ['water motor', 'water pump', 'tank empty', 'no water', 'submersible pump', 'overheating motor'],
    category: 'Plumbing',
    subService: 'Water Motor / Pump Fixing',
    defaultUrgency: 'Urgent',
    riskNotes: 'Water supply disruption for the entire apartment/house.',
    action: 'Motor rewinding or capacitor replacement technician assigned.',
  },
  // Pest Control
  {
    keywords: ['bed bug', 'bedbug', 'cockroach', 'cockroaches', 'termite', 'termites', 'pest', 'insects', 'rats'],
    category: 'Cleaning & Pest Control',
    subService: 'Bed Bug & Cockroach Control',
    defaultUrgency: 'Normal',
    riskNotes: 'Infestation spread across mattresses, wooden cabinetry, and kitchen storage.',
    action: 'Odorless herbal or chemical fumigation scheduled at convenience.',
  },
  // Moving
  {
    keywords: ['shift', 'shifting', 'house shift', 'moving', 'relocate', 'relocation', 'pickup van', 'carton', 'truck'],
    category: 'Moving & Shifting',
    subService: 'Full House Shifting',
    defaultUrgency: 'Normal',
    riskNotes: 'Heavy furniture handling and transit protection required.',
    action: 'Crew with packaging blankets and loading van recommended.',
  },
  // Car repair
  {
    keywords: ['car', 'battery', 'jumpstart', 'flat tire', 'puncture', 'engine oil', 'car wash', 'brake'],
    category: 'Car Care & Repair',
    subService: 'Battery Jumpstart & Replacement',
    defaultUrgency: 'Urgent',
    riskNotes: 'Vehicle stranded or immobilized.',
    action: 'Mobile mechanic with jumper kit and diagnostic tools dispatched.',
  },
  // Personal care
  {
    keywords: ['haircut', 'salon', 'facial', 'massage', 'manicure', 'grooming', 'pedicure', 'spa'],
    category: 'Personal Care',
    subService: 'Women Salon & Facial',
    defaultUrgency: 'Normal',
    riskNotes: 'Routine personal care and wellness request.',
    action: 'Hygienic at-home beautician/groomer reserved for preferred slot.',
  },
];

export function analyzeServiceDescription(text: string): AiAnalysisResult {
  const lower = text.toLowerCase().trim();

  if (!lower) {
    return {
      detectedCategory: 'Appliance and Gadget Repair',
      detectedSubService: 'AC Repair & Servicing',
      urgency: 'Normal',
      confidence: 0.5,
      riskAssessment: 'Standard service request',
      recommendedAction: 'Choose preferred technician and time slot',
      keyKeywords: [],
    };
  }

  // Emergency safety keywords override
  const emergencyWords = ['danger', 'fire', 'smoke', 'spark', 'shock', 'blast', 'burst', 'flood', 'gas leak'];
  const hasEmergencyWord = emergencyWords.some((w) => lower.includes(w));

  let bestMatchRule: RulePattern | null = null;
  let maxKeywordMatches = 0;
  const matchedKeywords: string[] = [];

  for (const rule of KNOWLEDGE_BASE_RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matchCount++;
        matchedKeywords.push(kw);
      }
    }
    if (matchCount > maxKeywordMatches) {
      maxKeywordMatches = matchCount;
      bestMatchRule = rule;
    }
  }

  if (bestMatchRule) {
    const urgency = hasEmergencyWord ? 'Emergency' : bestMatchRule.defaultUrgency;
    const confidence = Math.min(0.96, 0.70 + maxKeywordMatches * 0.08);

    return {
      detectedCategory: bestMatchRule.category,
      detectedSubService: bestMatchRule.subService,
      urgency,
      confidence,
      riskAssessment: bestMatchRule.riskNotes,
      recommendedAction: bestMatchRule.action,
      keyKeywords: Array.from(new Set(matchedKeywords)),
    };
  }

  // Fallback heuristic based on generic words
  let urgency: ServiceUrgency = hasEmergencyWord ? 'Emergency' : 'Normal';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('quick')) {
    urgency = 'Urgent';
  }

  return {
    detectedCategory: 'Appliance and Gadget Repair',
    detectedSubService: 'AC Repair & Servicing',
    urgency,
    confidence: 0.65,
    riskAssessment: 'General diagnosis required on-site by certified technician.',
    recommendedAction: 'Schedule a diagnostic inspection with a top-rated technician.',
    keyKeywords: matchedKeywords,
  };
}
