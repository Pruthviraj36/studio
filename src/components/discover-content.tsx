'use client';

import { useState, useMemo, useCallback } from 'react';
import { UserCard } from '@/components/user-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { User } from '@/lib/types';

type DiscoverContentProps = {
  initialUsers: User[];
};

export function DiscoverContent({ initialUsers }: DiscoverContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');

  // Get unique skills and experience levels
  const allSkills = useMemo(
    () => [...new Set(initialUsers.flatMap((user) => user.skills))],
    [initialUsers]
  );

  const experienceLevels = useMemo(
    () => [...new Set(initialUsers.map((user) => user.experience))],
    [initialUsers]
  );

  // Filter users based on all criteria
  const filteredUsers = useMemo(() => {
    return initialUsers.filter((user) => {
      // Search query filter
      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        const matchesSearch =
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.bio.toLowerCase().includes(lowercaseQuery) ||
          user.location.toLowerCase().includes(lowercaseQuery);

        if (!matchesSearch) return false;
      }

      // Skill filter
      if (skillFilter && skillFilter !== 'all') {
        if (!user.skills.some((skill) =>
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )) {
          return false;
        }
      }

      // Experience filter
      if (experienceFilter && experienceFilter !== 'all') {
        if (user.experience !== experienceFilter) {
          return false;
        }
      }

      return true;
    });
  }, [initialUsers, searchQuery, skillFilter, experienceFilter]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleSkillFilterChange = useCallback((value: string) => {
    setSkillFilter(value);
  }, []);

  const handleExperienceFilterChange = useCallback((value: string) => {
    setExperienceFilter(value);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSkillFilter('all');
    setExperienceFilter('all');
  }, []);

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or keyword..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-4">
          <Select value={skillFilter} onValueChange={handleSkillFilterChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map((skill: string) => (
                <SelectItem key={skill} value={skill.toLowerCase()}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={experienceFilter}
            onValueChange={handleExperienceFilterChange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {experienceLevels.map((level: string) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results summary and reset button */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {initialUsers.length} developers
        </p>
        {(searchQuery || skillFilter !== 'all' || experienceFilter !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* User grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user: User) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed p-12 text-center">
          <p className="text-lg font-semibold text-foreground">
            No developers found
          </p>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters to find more results
          </p>
        </div>
      )}
    </div>
  );
}
