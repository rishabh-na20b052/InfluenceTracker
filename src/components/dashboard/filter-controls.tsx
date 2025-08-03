'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';
import type { Post, Platform } from '@/lib/types';

type Filters = {
  platform: 'all' | Platform;
  influencer: string;
  sortBy: keyof Post['engagement'] | 'date';
  sortOrder: 'asc' | 'desc';
};

type FilterControlsProps = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export default function FilterControls({ filters, setFilters }: FilterControlsProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Filters) => (value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      platform: 'all',
      influencer: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="mb-4 p-4 bg-card rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="influencer">Influencer</Label>
          <Input
            id="influencer"
            name="influencer"
            placeholder="Search by name..."
            value={filters.influencer}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select name="platform" value={filters.platform} onValueChange={handleSelectChange('platform')}>
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sortBy">Sort By</Label>
          <Select name="sortBy" value={filters.sortBy} onValueChange={handleSelectChange('sortBy')}>
            <SelectTrigger id="sortBy">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Post Date</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Select name="sortOrder" value={filters.sortOrder} onValueChange={handleSelectChange('sortOrder')}>
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset} className="w-full">Reset</Button>
        </div>
      </div>
    </div>
  );
}
