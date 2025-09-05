"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X } from "lucide-react"

interface ModelFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  priceRange: { min: string; max: string }
  onPriceRangeChange: (range: { min: string; max: string }) => void
  onClearFilters: () => void
}

export function ModelFilterBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters
}: ModelFilterBarProps) {
  const hasActiveFilters = searchTerm || priceRange.min || priceRange.max || sortBy !== "name-asc"

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
            Search Models
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name or design..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="w-full lg:w-48">
          <Label className="text-sm font-medium text-gray-700 mb-1 block">
            Sort By
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">
              Min Price
            </Label>
            <Input
              type="number"
              placeholder="₹0"
              value={priceRange.min}
              onChange={(e) => onPriceRangeChange({ ...priceRange, min: e.target.value })}
              className="w-full lg:w-24"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">
              Max Price
            </Label>
            <Input
              type="number"
              placeholder="₹∞"
              value={priceRange.max}
              onChange={(e) => onPriceRangeChange({ ...priceRange, max: e.target.value })}
              className="w-full lg:w-24"
            />
          </div>
        </div>

        {/* Clear Filters */}
        <div className="w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full lg:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  )
}