import { ServiceProvider, ProviderMatchResult, ServiceUrgency } from '../types';
import { DHAKA_DISTANCES } from '../data/mockData';

export function calculateProviderDistance(userLocation: string, providerLocation: string): number {
  if (DHAKA_DISTANCES[userLocation] && DHAKA_DISTANCES[userLocation][providerLocation] !== undefined) {
    return DHAKA_DISTANCES[userLocation][providerLocation];
  }
  if (DHAKA_DISTANCES[providerLocation] && DHAKA_DISTANCES[providerLocation][userLocation] !== undefined) {
    return DHAKA_DISTANCES[providerLocation][userLocation];
  }
  return 6.0; // fallback average distance in km across Dhaka
}

export function rankProviders(params: {
  providers: ServiceProvider[];
  category: string;
  subService: string;
  location: string;
  preferredTime: string;
  urgency: ServiceUrgency;
  bookedProviderSlots?: Record<string, string[]>; // providerId -> list of booked slot strings
}): ProviderMatchResult[] {
  const { providers, category, subService, location, preferredTime, urgency, bookedProviderSlots = {} } = params;

  // Filter candidates that serve this category and are not suspended
  const candidates = providers.filter((p) =>
    p.status !== 'suspended' &&
    (p.serviceCategories.some((cat) => cat.toLowerCase() === category.toLowerCase()) ||
     p.specialties.some((spec) => spec.toLowerCase().includes(subService.toLowerCase())))
  );

  const pool = candidates.length > 0 ? candidates : providers.filter((p) => p.status !== 'suspended');

  const results: ProviderMatchResult[] = pool.map((provider) => {
    // 1. Service Expertise Score (0 - 100)
    let expertiseScore = 60;
    const hasCategory = provider.serviceCategories.some((c) => c.toLowerCase() === category.toLowerCase());
    const hasSpecialty = provider.specialties.some((s) => s.toLowerCase() === subService.toLowerCase());
    if (hasSpecialty) {
      expertiseScore = 100;
    } else if (hasCategory) {
      expertiseScore = 85;
    }
    // Boost by experience (up to +15 max)
    expertiseScore = Math.min(100, expertiseScore + Math.min(15, provider.experienceYears * 1.5));

    // 2. Distance Score (0 - 100)
    const distanceKm = calculateProviderDistance(location, provider.location);
    // Linear scale: 0km = 100, 15km = 20
    const distanceScore = Math.max(10, Math.min(100, 100 - (distanceKm / 15) * 80));

    // 3. Availability Score (0 - 100)
    const bookedSlotsForProv = bookedProviderSlots[provider.id] || [];
    const isSlotAvailableInSchedule = provider.availableTimeSlots.includes(preferredTime) || preferredTime.includes('Immediate');
    const isNotDoubleBooked = !bookedSlotsForProv.includes(preferredTime);
    const isSlotAvailable = provider.isAvailable && isSlotAvailableInSchedule && isNotDoubleBooked;

    let availabilityScore = 30;
    if (isSlotAvailable) {
      availabilityScore = 100;
    } else if (provider.isAvailable && isNotDoubleBooked) {
      availabilityScore = 60; // Available today, but different slot
    }

    // 4. Rating Score (0 - 100)
    // 5.0 = 100, 4.0 = 80
    const ratingScore = Math.min(100, Math.round((provider.rating / 5.0) * 100));

    // 5. Price Score (0 - 100)
    // Lower price compared to benchmark gets higher score
    const benchmarkPrice = 1500;
    const priceScore = Math.max(20, Math.min(100, Math.round((1 - (provider.basePrice - 700) / benchmarkPrice) * 100)));

    // 6. Workload Penalty
    // 0 jobs = 0 penalty, 1 job = -5, 2 jobs = -15, 3+ jobs = -30
    const workloadPenalty = provider.currentWorkload * 8;

    // Weighting based on urgency
    let totalScore = 0;
    if (urgency === 'Emergency') {
      // Emergency: Availability (35%) & Distance (30%) prioritized heavily
      totalScore =
        availabilityScore * 0.35 +
        distanceScore * 0.30 +
        expertiseScore * 0.20 +
        ratingScore * 0.10 +
        priceScore * 0.05 -
        workloadPenalty;
    } else if (urgency === 'Urgent') {
      // Urgent: balanced speed and quality
      totalScore =
        expertiseScore * 0.25 +
        availabilityScore * 0.30 +
        distanceScore * 0.25 +
        ratingScore * 0.15 +
        priceScore * 0.05 -
        workloadPenalty;
    } else {
      // Normal: Expertise 30%, Availability 25%, Rating 20%, Distance 15%, Price 10%
      totalScore =
        expertiseScore * 0.30 +
        availabilityScore * 0.25 +
        ratingScore * 0.20 +
        distanceScore * 0.15 +
        priceScore * 0.10 -
        workloadPenalty;
    }

    const finalMatchScore = Math.max(40, Math.min(99, Math.round(totalScore)));

    // Generate smart contextual explanation
    const reasonParts: string[] = [];
    if (hasSpecialty) reasonParts.push(`specializes directly in ${subService}`);
    if (provider.rating >= 4.8) reasonParts.push(`is top rated (${provider.rating}★)`);
    if (distanceKm <= 3.0) reasonParts.push(`nearby in ${provider.location} (${distanceKm.toFixed(1)} km)`);
    if (isSlotAvailable) reasonParts.push(`open for ${preferredTime}`);
    if (provider.basePrice <= 1000) reasonParts.push(`competitive rate ৳${provider.basePrice}`);

    const explanation = reasonParts.length > 0
      ? `Recommended because ${provider.name} ${reasonParts.join(', ')}.`
      : `Qualified provider in ${provider.location} with ${provider.experienceYears} years experience.`;

    return {
      provider,
      matchScore: finalMatchScore,
      distanceKm,
      isSlotAvailable,
      explanation,
      badges: [],
      breakdown: {
        expertiseScore: Math.round(expertiseScore),
        availabilityScore: Math.round(availabilityScore),
        ratingScore: Math.round(ratingScore),
        distanceScore: Math.round(distanceScore),
        priceScore: Math.round(priceScore),
        workloadPenalty,
      },
    };
  });

  // Sort by match score descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  // Assign Badges
  if (results.length > 0) {
    results[0].badges.push('Best Match');

    // Find Best Price among candidates
    const lowestPrice = Math.min(...results.map((r) => r.provider.basePrice));
    const priceLeader = results.find((r) => r.provider.basePrice === lowestPrice);
    if (priceLeader && !priceLeader.badges.includes('Best Price')) {
      priceLeader.badges.push('Best Price');
    }

    // Find Best Rated
    const highestRating = Math.max(...results.map((r) => r.provider.rating));
    const ratingLeader = results.find((r) => r.provider.rating === highestRating);
    if (ratingLeader && !ratingLeader.badges.includes('Best Rated') && ratingLeader !== results[0]) {
      ratingLeader.badges.push('Best Rated');
    }
  }

  // Return top 3 to 5 recommendations
  return results.slice(0, 5);
}
