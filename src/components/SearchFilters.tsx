import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterBySkills: (skills: string[]) => void;
  onFilterByDate: (days: number | null) => void;
  availableSkills: string[];
}

export function SearchFilters({ onSearch, onFilterBySkills, onFilterByDate, availableSkills }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<number | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    
    setSelectedSkills(newSkills);
    onFilterBySkills(newSkills);
  };

  const handleDateFilter = (days: number | null) => {
    setSelectedDateRange(days);
    onFilterByDate(days);
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSelectedDateRange(null);
    onFilterBySkills([]);
    onFilterByDate(null);
  };

  const hasActiveFilters = selectedSkills.length > 0 || selectedDateRange !== null;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search jobs by title or skills..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Skills
              {selectedSkills.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  {selectedSkills.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Filter by Skills</h4>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {availableSkills.map((skill) => (
                  <label
                    key={skill}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Date
              {selectedDateRange && (
                <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Filter by Date</h4>
              <div className="space-y-2">
                {[
                  { label: "Today", value: 1 },
                  { label: "Last 3 days", value: 3 },
                  { label: "Last week", value: 7 },
                  { label: "Last month", value: 30 },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="dateRange"
                      checked={selectedDateRange === option.value}
                      onChange={() => handleDateFilter(option.value)}
                      className="border-border"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded">
                  <input
                    type="radio"
                    name="dateRange"
                    checked={selectedDateRange === null}
                    onChange={() => handleDateFilter(null)}
                    className="border-border"
                  />
                  <span className="text-sm">All time</span>
                </label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}