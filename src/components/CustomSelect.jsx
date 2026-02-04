import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomSelect = ({ 
    options = [], 
    value, 
    onChange, 
    placeholder = "Select...", 
    label,
    name,
    icon: Icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Find selected option label
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        // Mimic standard event object for compatibility with existing handlers
        const fakeEvent = {
            target: {
                name: name,
                value: optionValue
            }
        };
        onChange(fakeEvent);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-2 bg-white dark:bg-slate-800 
                    border border-slate-200 dark:border-slate-700 
                    rounded-lg flex items-center justify-between 
                    text-slate-700 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    transition-all duration-200
                    ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
                `}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon size={18} className="text-slate-400" />}
                    <span className={!selectedOption ? "text-slate-400" : ""}>
                        {displayValue}
                    </span>
                </div>
                <ChevronDown 
                    size={18} 
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden max-h-60 overflow-y-auto"
                    >
                        <div className="p-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between
                                        transition-colors
                                        ${value === option.value 
                                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-medium' 
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        {option.icon && <option.icon size={16} className="opacity-70" />}
                                        <span>{option.label}</span>
                                    </div>
                                    {value === option.value && <Check size={16} />}
                                </button>
                            ))}
                            {options.length === 0 && (
                                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                                    No options
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
