"use client";

import { useState } from "react";

interface ImageToggleProps {
  onToggle: () => void;
  label: string;
}

export default function ImageToggle({ onToggle, label }: ImageToggleProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center cursor-pointer"
      title={label}
    >
      {clicked ? '✓' : '🔄'}
    </button>
  );
}
