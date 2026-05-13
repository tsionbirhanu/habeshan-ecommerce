import React from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  onQuantityChange: (quantity: number) => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  minQuantity = 1,
  maxQuantity = 999,
  onQuantityChange,
}) => {
  const handleDecrease = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity;
    if (value >= minQuantity && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center border-2 border-maroon rounded-lg w-fit">
      <button
        onClick={handleDecrease}
        disabled={quantity <= minQuantity}
        className="p-2 hover:bg-maroon/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <Minus size={18} className="text-maroon" />
      </button>

      <input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={minQuantity}
        max={maxQuantity}
        className="w-12 text-center border-0 font-semibold focus:outline-none bg-white"
      />

      <button
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        className="p-2 hover:bg-maroon/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        <Plus size={18} className="text-maroon" />
      </button>
    </div>
  );
};
