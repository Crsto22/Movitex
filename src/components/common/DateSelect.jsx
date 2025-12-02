import React, { useState, useEffect } from 'react';

const DateSelect = ({ value, onChange, disabled = false }) => {
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    // Parse initial value
    useEffect(() => {
        if (value) {
            const [y, m, d] = value.split('-');
            setYear(y || '');
            setMonth(m || '');
            setDay(d || '');
        } else {
            // Si el value está vacío, limpiar los selects
            setDay('');
            setMonth('');
            setYear('');
        }
    }, [value]);

    // Generate options
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleChange = (type, val) => {
        let newDay = day;
        let newMonth = month;
        let newYear = year;

        if (type === 'day') newDay = val;
        if (type === 'month') newMonth = val;
        if (type === 'year') newYear = val;

        // Update local state
        if (type === 'day') setDay(val);
        if (type === 'month') setMonth(val);
        if (type === 'year') setYear(val);

        // Validate and propagate changes
        if (newDay && newMonth && newYear) {
            // Basic validation for days in month
            const daysInMonth = new Date(newYear, newMonth, 0).getDate();
            if (parseInt(newDay) > daysInMonth) {
                newDay = daysInMonth.toString();
                setDay(newDay);
            }

            // Format: YYYY-MM-DD
            const formattedDay = newDay.toString().padStart(2, '0');
            const formattedDate = `${newYear}-${newMonth}-${formattedDay}`;
            onChange(formattedDate);
        } else {
            // If incomplete, send empty string or handle as needed
            // Currently sending empty string if not fully selected
            onChange('');
        }
    };

    return (
        <div className="grid grid-cols-3 gap-2">
            {/* Day Select */}
            <div className="relative">
                <select
                    value={day}
                    onChange={(e) => handleChange('day', e.target.value)}
                    disabled={disabled}
                    className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm appearance-none bg-white"
                    style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                >
                    <option value="">Día</option>
                    {days.map((d) => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>

            {/* Month Select */}
            <div className="relative">
                <select
                    value={month}
                    onChange={(e) => handleChange('month', e.target.value)}
                    disabled={disabled}
                    className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm appearance-none bg-white"
                    style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                >
                    <option value="">Mes</option>
                    {months.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>

            {/* Year Select */}
            <div className="relative">
                <select
                    value={year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    disabled={disabled}
                    className="w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#f0251f] text-xs sm:text-sm appearance-none bg-white"
                    style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                >
                    <option value="">Año</option>
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default DateSelect;
