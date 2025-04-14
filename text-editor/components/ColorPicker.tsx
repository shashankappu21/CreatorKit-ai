"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ban, ChevronDown, Plus } from "lucide-react";
import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor | null;
};

const colors = [
  "black", "#8B5CF6", "#FACC15", "#F59E0B", "#10B981",
  "#EF4444", "#6366F1", "#22C55E", "#EC4899"
];

const highlights = [
  "#E0E7FF", "#DDD6FE", "#FEF3C7", "#FDE68A", "#D1FAE5",
  "#FECACA", "#BFDBFE", "#A7F3D0"
];

const ColorPicker = ({ editor }: Props) => {
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [selectedHighlight, setSelectedHighlight] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!editor) return;

    const updateColor = () => {
      const color = editor.getAttributes('textStyle').color;
      if (color) setSelectedColor(color);
    };

    const updateHighlight = () => {
      const highlight = editor.getAttributes('highlight').color;
      if (highlight) setSelectedHighlight(highlight);
    };

    editor.on('selectionUpdate', updateColor);
    editor.on('selectionUpdate', updateHighlight);
    editor.on('update', updateColor);
    editor.on('update', updateHighlight);

    return () => {
      editor.off('selectionUpdate', updateColor);
      editor.off('selectionUpdate', updateHighlight);
      editor.off('update', updateColor);
      editor.off('update', updateHighlight);
    };
  }, [editor]);

  const handleColorSelect = (color: string) => {
    if (!editor) return;
    setSelectedColor(color);
    editor.chain().focus().setMark('textStyle', { color }).run();
    setIsOpen(false);
  };

  const handleHighlightSelect = (color: string) => {
    if (!editor) return;
    setSelectedHighlight(color);
    editor.chain().focus().toggleHighlight({ color }).run();
    setIsOpen(false);
  };

  const handleRemoveHighlight = () => {
    if (!editor) return;
    setSelectedHighlight("");
    editor.chain().focus().unsetHighlight().run();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Color Selector Button */}
      <button
        className="p-1 mr-3 flex items-center gap-1.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-5 h-5 rounded-md border-none"
          style={{ backgroundColor: selectedColor }}
        />
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <ChevronDown className="w-5" />
        </motion.div>
      </button>

      {/* Dropdown (appears below without pushing content) */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute left-0 top-[calc(100%+8px)] overflow-hidden w-56 bg-white border-2 rounded-lg border-gray-200 shadow-md z-10"
      >
        <div className="p-3">
          <p className="text-sm text-gray-500 mb-2">Color</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {colors.map((color) => (
              <div
                key={color}
                className={`w-7 h-7 rounded-md cursor-pointer hover:scale-110 transition relative ${
                  selectedColor === color ? 'ring-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
            <Plus className="w-6 h-6 ml-0.5 mt-0.5 cursor-pointer hover:scale-110 transition"/>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          <p className="text-sm text-gray-500 mb-2">Highlight</p>
          <div className="grid grid-cols-5 gap-2">
            <div 
              className={`w-7 h-7 rounded-md cursor-pointer hover:scale-110 transition flex items-center justify-center ${
                selectedHighlight === "" ? 'ring-2 ring-gray-400' : ''
              }`}
              onClick={handleRemoveHighlight}
            >
              <Ban className="w-5 h-5" />
            </div>
            {highlights.map((color) => (
              <div
                key={color}
                className={`w-7 h-7 rounded-md cursor-pointer hover:scale-110 transition relative ${
                  selectedHighlight === color ? 'ring-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleHighlightSelect(color)}
              />
            ))}
            <Plus className="w-6 h-6 ml-0.5 mt-0.5 cursor-pointer hover:scale-110 transition"/>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ColorPicker;
