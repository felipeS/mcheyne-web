"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./button";

interface DropdownProps {
  children: [ReactNode, ReactNode];
  className?: string;
  align?: "left" | "right";
  minWidth?: number;
}

export function Dropdown({
  children,
  className = "",
  align = "right",
  minWidth = 100,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [trigger, menu] = children;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute top-full mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg`}
          style={{
            [align === "right" ? "right" : "left"]: 0,
            minWidth: `${minWidth}px`,
          }}
        >
          {menu}
        </div>
      )}
    </div>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
}

export function DropdownTrigger({
  children,
  className = "",
}: DropdownTriggerProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`justify-between ${className}`}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <div className="py-1">{children}</div>;
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
}: DropdownMenuItemProps) {
  return (
    <button
      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
