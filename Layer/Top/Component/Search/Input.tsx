import { useState } from "react";
import { Search, X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/Middle/Library/utils";
import { Button } from "@/Top/Component/UI/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Top/Component/UI/Dropdown-Menu";
import { CATEGORIES } from "./Utility";
import type { SearchInputProps } from "./Types";

export interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  category: SearchCategory;
  setCategory: (category: SearchCategory) => void;
  onSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onDropdownOpenChange?: (open: boolean) => void;
}

export function SearchInput({
  query,
  setQuery,
  category,
  setCategory,
  onSearch,
  inputRef,
  onDropdownOpenChange,
}: SearchInputProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentCategory = CATEGORIES.find(c => c.id === category)!;

  const handleClear = () => {
    setQuery("");
    inputRef?.current?.focus();
  };

  const handleDropdownOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    onDropdownOpenChange?.(open);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Fixed padding: left 16px (pl-4), right 12px (pr-3) */}
      <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={currentCategory.placeholder}
          className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground text-foreground py-1"
          aria-label="Search"
        />
        
        {/* Category Dropdown - Only show when input is empty */}
        {!query && (
          <div className="ml-auto">
            <DropdownMenu open={dropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentCategory.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", dropdownOpen && "rotate-180")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                sideOffset={12}
                alignOffset={-13}
                className={cn(
                  "min-w-[var(--radix-dropdown-menu-trigger-width)]",
                  "rounded-t-none border-t-0",
                  "bg-white dark:bg-black border-2 border-black dark:border-white"
                )}
              >
                {CATEGORIES.map((cat) => {
                  const IconComponent = cat.icon;
                  return (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setDropdownOpen(false);
                        onDropdownOpenChange?.(false);
                        inputRef?.current?.focus();
                      }}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        category === cat.id && "bg-primary/10 text-primary"
                      )}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="flex-1">{cat.label}</span>
                      {category === cat.id && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Clear button when typing */}
        {query && (
          <Button 
            size="sm"
            className="w-8 h-8 p-0 rounded-full flex-shrink-0"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}