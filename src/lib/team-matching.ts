/**
 * Advanced Team Matching Algorithm
 * Matches users with teams based on multiple factors
 */

import { User, Team } from './types';

interface MatchScore {
  userId: string;
  teamId: string;
  score: number;
  reasons: string[];
  skillMatch: number;
  experienceMatch: number;
  locationMatch: number;
  availabilityMatch: number;
}

/**
 * Calculate skill match between user and team
 * Higher score = better match
 */
function calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 100;

  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const normalizedRequired = requiredSkills.map(s => s.toLowerCase());

  const matchedSkills = normalizedRequired.filter(skill =>
    normalizedUserSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );

  return (matchedSkills.length / requiredSkills.length) * 100;
}

/**
 * Calculate experience match
 */
function calculateExperienceMatch(userExp: string, requiredExp?: string): number {
  const experienceLevels: { [key: string]: number } = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };

  const userLevel = experienceLevels[userExp] || 0;
  const requiredLevel = experienceLevels[requiredExp || 'Beginner'] || 0;

  // Perfect match
  if (userLevel === requiredLevel) return 100;

  // User is more experienced (good!)
  if (userLevel > requiredLevel) return 90;

  // User is less experienced but can learn
  if (userLevel === requiredLevel - 1) return 70;

  // User significantly less experienced
  return 40;
}

/**
 * Calculate location/timezone match
 */
function calculateLocationMatch(userLocation: string, teamLocation: string): number {
  if (!userLocation || !teamLocation) return 50; // Neutral if unknown

  const userCity = userLocation.toLowerCase().split(',')[0].trim();
  const teamCity = teamLocation.toLowerCase().split(',')[0].trim();

  // Exact match
  if (userCity === teamCity) return 100;

  // Same country (rough check)
  if (userLocation.toLowerCase().includes('remote') || teamLocation.toLowerCase().includes('remote')) {
    return 80; // Remote-friendly
  }

  // Different location but workable
  return 60;
}

/**
 * Calculate availability match based on team size and user count
 */
function calculateAvailabilityMatch(teamMembers: number, maxTeamSize: number): number {
  const spotsAvailable = maxTeamSize - teamMembers;
  const utilizationRatio = teamMembers / maxTeamSize;

  // Team is full
  if (spotsAvailable <= 0) return 0;

  // Team has spots available
  if (utilizationRatio < 0.5) return 100; // Plenty of spots
  if (utilizationRatio < 0.8) return 80; // Some spots
  if (utilizationRatio < 0.95) return 60; // Few spots left

  return 40; // Almost full
}

/**
 * Main matching function
 * Returns top matches for a user
 */
export function findBestTeamMatches(
  user: User,
  teams: Team[],
  limit: number = 5
): MatchScore[] {
  const matches: MatchScore[] = teams
    .filter(team => !team.members?.some(m => m.id === user.id)) // Exclude teams user is already in
    .map(team => {
      const skillMatch = calculateSkillMatch(
        user.skills || [],
        team.requiredSkills || []
      );

      const experienceMatch = calculateExperienceMatch(
        user.experience || 'Beginner',
        team.experience
      );

      const locationMatch = calculateLocationMatch(
        user.location || '',
        team.location || ''
      );

      const availabilityMatch = calculateAvailabilityMatch(
        team.members?.length || 0,
        team.maxMembers || 5
      );

      // Weighted scoring
      const score =
        (skillMatch * 0.4) +
        (experienceMatch * 0.25) +
        (locationMatch * 0.15) +
        (availabilityMatch * 0.2);

      const reasons: string[] = [];

      if (skillMatch >= 80) {
        reasons.push(`✓ Strong skill match (${skillMatch.toFixed(0)}%)`);
      } else if (skillMatch >= 50) {
        reasons.push(`△ Partial skill match (${skillMatch.toFixed(0)}%)`);
      }

      if (experienceMatch >= 80) {
        reasons.push(`✓ Experience level aligned`);
      }

      if (locationMatch >= 80) {
        reasons.push(`✓ Location compatible`);
      }

      if (availabilityMatch >= 80) {
        reasons.push(`✓ Team has available spots`);
      }

      return {
        userId: user.id,
        teamId: team.id!,
        score: Math.round(score),
        reasons,
        skillMatch: Math.round(skillMatch),
        experienceMatch: Math.round(experienceMatch),
        locationMatch: Math.round(locationMatch),
        availabilityMatch: Math.round(availabilityMatch),
      };
    })
    .filter(match => match.score >= 40) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}

/**
 * Find best team members for a specific team
 */
export function findBestTeamMembers(
  team: Team,
  allUsers: User[],
  limit: number = 10
): MatchScore[] {
  const matches: MatchScore[] = allUsers
    .filter(user => !team.members?.some(m => m.id === user.id)) // Exclude existing members
    .map(user => {
      const skillMatch = calculateSkillMatch(
        user.skills || [],
        team.requiredSkills || []
      );

      const experienceMatch = calculateExperienceMatch(
        user.experience || 'Beginner',
        team.experience
      );

      const locationMatch = calculateLocationMatch(
        user.location || '',
        team.location || ''
      );

      const availabilityMatch = calculateAvailabilityMatch(
        team.members?.length || 0,
        team.maxMembers || 5
      );

      const score =
        (skillMatch * 0.4) +
        (experienceMatch * 0.25) +
        (locationMatch * 0.15) +
        (availabilityMatch * 0.2);

      const reasons: string[] = [];
      if (skillMatch >= 80) reasons.push('Strong skills');
      if (experienceMatch >= 80) reasons.push('Right experience level');
      if (locationMatch >= 80) reasons.push('Compatible location');

      return {
        userId: user.id,
        teamId: team.id!,
        score: Math.round(score),
        reasons,
        skillMatch: Math.round(skillMatch),
        experienceMatch: Math.round(experienceMatch),
        locationMatch: Math.round(locationMatch),
        availabilityMatch: Math.round(availabilityMatch),
      };
    })
    .filter(match => match.score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return matches;
}

/**
 * Calculate match compatibility percentage
 */
export function getMatchPercentage(matchScore: MatchScore): number {
  return Math.min(100, matchScore.score);
}

/**
 * Get color coding for match quality
 */
export function getMatchColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 40) return '#ef4444'; // red
  return '#6b7280'; // gray
}
