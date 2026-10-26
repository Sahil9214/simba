'use client';

import React from 'react';
import type { ProductData } from './index';
import { bottle_icon } from '@/assets/icons';
import Image from 'next/image';

interface Props {
  product: string;
  volume: string;
  data: ProductData;
  onFieldClick: (field: string) => void;
  onNoteClick: () => void;
  showNoteInput: boolean;
  onNoteChange: (value: string) => void;
  onInputChange: (value: string, field: keyof ProductData) => void;
  currentField: string | null;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}

export const ProductInputSection: React.FC<Props> = ({
  product,
  volume,
  data,
  onFieldClick,
  onNoteClick,
  showNoteInput,
  onNoteChange,
  onInputChange,
  currentField,
  inputRefs
}) => {
  const fields = [
    { key: 'sales', label: 'Sales' },
    { key: 'closing', label: 'Closing' },
    { key: 'availability', label: 'Availability' },
    { key: 'demand', label: 'Demand' },
    { key: 'breakage', label: 'Breakage' }
  ] as const;

  return (
    <div className="space-y-3 bg-white rounded-md p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium font-inter">
          <span className="text-purple font-medium font-inter">{product}</span>
          <span className="text-gray-500 mx-2">•</span>
          <span className="text-black font-medium font-inter">{volume}</span>
        </h2>
        <div className="w-7 h-9 flex items-center justify-center">
          <Image
            src={bottle_icon as string}
            alt="Bottle Icon"
            className="w-full h-full object-contain"
            width={30}
            height={30}
          />
        </div>
      </div>

      {/* Input grid inside gray box */}
      <div className="bg-[#F7F7F7] rounded-md p-3">
        <div className="grid grid-cols-3 gap-3">
          {fields.map((f) => (
            <div key={f.key} className="relative">
              {/* Clickable wrapper for entire input area */}
              <div
                className="relative h-12 cursor-text"
                onClick={() => {
                  const inputElement = inputRefs.current[`${volume}-${f.key}`];
                  if (inputElement) {
                    inputElement.focus();
                    onFieldClick(f.key);
                  }
                }}
              >
                <input
                  ref={(el) => {
                    inputRefs.current[`${volume}-${f.key}`] = el;
                  }}
                  type="number"
                  value={data[f.key]}
                  onChange={(e) => onInputChange(e.target.value, f.key)}
                  onFocus={() => onFieldClick(f.key)}

                  className={`absolute inset-0 w-full h-full bg-white rounded-md px-3 text-md font-medium font-inter text-primary focus:outline-primary focus:ring-1 focus:ring-primary transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
                    currentField === f.key 
                      ? 'border-red-500' 
                      : 'border border-transparent'
                  }`}
                  style={{
                    textShadow: 'none',
                    backgroundClip: 'padding-box'
                  }}
                />

                {/* Floating label */}
                <label
                  className={`absolute pointer-events-none transition-all duration-300 text-sm font-inter text-gray-500 ${
                    data[f.key] || currentField === f.key
                      ? 'top-1/2 right-3 transform -translate-y-1/2 text-gray-500'
                      : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500'
                  }`}
                >
                  {f.label}
                </label>
              </div>
            </div>
          ))}

          {/* Add note button */}
          <button
            onClick={onNoteClick}
            className="h-12 rounded-md flex items-center justify-center text-sm font-medium text-blue-500 font-inter hover:bg-blue-50 transition-colors"
          >
            + add note
          </button>
        </div>
      </div>

      {/* Note textarea instead of input */}
      {showNoteInput && (
        <div>
          <textarea
            placeholder="Add your note here..."
            value={data.note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full h-20 px-3 py-2 rounded-md border border-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
            autoFocus
            rows={3}
          />
        </div>
      )}
    </div>
  );
};