"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Note: The 'Filter' icon is imported but not used. You can remove it or use it if you wish.
// import { Filter } from 'lucide-react';
import type { Post, Platform } from "@/lib/types";

// CHANGE 1: Remove 'influencer' from the Filters type
type Filters = {
  platform: "all" | Platform;
  sortBy: keyof Post["engagement"] | "date";
  sortOrder: "asc" | "desc";
};

type FilterControlsProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  disabled?: boolean;
};

export default function FilterControls({
  filters,
  setFilters,
  disabled = false,
}: FilterControlsProps) {
  // CHANGE 2: Remove the specific handler for input change as it's no longer needed

  const handleSelectChange = (name: keyof Filters) => (value: string) => {
    if (disabled) return;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (disabled) return;
    // CHANGE 3: Remove 'influencer' from the reset state
    setFilters({
      platform: "all",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  return (
    <div className="mb-4 p-4 bg-card rounded-lg shadow-sm border">
      {/* CHANGE 4: Adjust grid layout for fewer items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* The 'Influencer' Input block has been completely removed */}

        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select
            name="platform"
            value={filters.platform}
            onValueChange={handleSelectChange("platform")}
            disabled={disabled}
          >
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {/* CHANGE 5: Correct the values to match the database schema (lowercase) */}
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="x">X / Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            name="sortBy"
            value={filters.sortBy}
            onValueChange={handleSelectChange("sortBy")}
            disabled={disabled}
          >
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Post Date</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              {/* Note: Ensure your `Post` type's `engagement` object has these keys */}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Select
            name="sortOrder"
            value={filters.sortOrder}
            onValueChange={handleSelectChange("sortOrder")}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
            disabled={disabled}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
