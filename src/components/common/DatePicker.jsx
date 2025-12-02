import { useState, useRef, useEffect } from 'react';

/**
 * DatePicker - Componente de selección de fecha personalizado
 * Optimizado para fechas de nacimiento con restricciones configurables
 */
const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Selecciona fecha',
  minAge = 0, // Edad mínima requerida
  maxAge = 120, // Edad máxima permitida
  disabled = false,
  className = '',
  mode = 'birthdate' // 'birthdate' para fechas de nacimiento, 'future' para fechas de viaje
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState('days'); // 'days', 'months', 'years'
  
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  // Calcular años permitidos basados en edad mínima y máxima
  const today = new Date();
  const maxYear = today.getFullYear() - minAge;
  const minYear = today.getFullYear() - maxAge;

  // Inicializar calendario con la fecha seleccionada o una fecha por defecto
  useEffect(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      setCurrentYear(year);
      setCurrentMonth(month - 1);
    } else {
      // Si no hay valor, mostrar hace 25 años por defecto
      setCurrentYear(today.getFullYear() - 25);
      setCurrentMonth(today.getMonth());
    }
  }, [value]);

  // Cerrar calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current && 
        !calendarRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthNamesShort = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const selectDate = (day) => {
    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${dayStr}`;
    
    onChange(dateString);
    setShowCalendar(false);
    setSelectedView('days');
  };

  const selectMonth = (monthIndex) => {
    setCurrentMonth(monthIndex);
    setSelectedView('days');
  };

  const selectYear = (year) => {
    setCurrentYear(year);
    setSelectedView('months');
  };

  const isDateDisabled = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    if (mode === 'birthdate') {
      // Modo fecha de nacimiento: deshabilitar fechas futuras
      if (selectedDate > todayDate) return true;
      
      // Verificar edad mínima (la persona debe tener AL MENOS minAge años)
      // Si minAge = 2, deshabilitar fechas más recientes que hace 2 años
      if (minAge > 0) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - minAge);
        minDate.setHours(0, 0, 0, 0);
        // Deshabilitar si la fecha es MÁS RECIENTE que la fecha mínima
        if (selectedDate > minDate) return true;
      }
      
      // Verificar edad máxima (la persona NO puede tener más de maxAge años)
      // Si maxAge = 120, deshabilitar fechas más antiguas que hace 120 años
      if (maxAge > 0) {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - maxAge);
        maxDate.setHours(0, 0, 0, 0);
        // Deshabilitar si la fecha es MÁS ANTIGUA que la fecha máxima
        if (selectedDate < maxDate) return true;
      }
    } else if (mode === 'future') {
      // Modo fechas futuras (viajes): deshabilitar fechas pasadas
      if (selectedDate < todayDate) return true;
    }
    
    return false;
  };

  const isDateSelected = (day) => {
    if (!value) return false;
    const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return value === dateString;
  };

  const renderDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2"></div>
      );
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !disabled && selectDate(day)}
          disabled={disabled}
          className={`
            p-2 text-sm rounded-lg font-medium transition-all duration-200
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : selected
                ? 'bg-[#f0251f] text-white font-bold shadow-md'
                : 'text-gray-700 hover:bg-gray-100 hover:text-[#f0251f]'
            }
          `}
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const renderMonths = () => {
    return monthNamesShort.map((month, index) => {
      const isCurrentMonth = index === currentMonth;
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => selectMonth(index)}
          className={`
            p-3 text-sm rounded-lg font-medium transition-all duration-200
            ${isCurrentMonth
              ? 'bg-[#f0251f] text-white font-bold shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-[#f0251f]'
            }
          `}
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {month}
        </button>
      );
    });
  };

  const renderYears = () => {
    const years = [];
    // Calcular el rango base centrado en el año actual seleccionado
    const baseYear = Math.floor(currentYear / 12) * 12;
    
    // Generar 12 años centrados
    for (let i = 0; i < 12; i++) {
      const year = baseYear + i;
      
      // Saltar años fuera del rango permitido
      if (year < minYear || year > maxYear) {
        years.push(<div key={`empty-${i}`} className="p-3"></div>);
        continue;
      }
      
      const isCurrentYear = year === currentYear;
      
      years.push(
        <button
          key={year}
          type="button"
          onClick={() => selectYear(year)}
          className={`
            p-3 text-sm rounded-lg font-medium transition-all duration-200
            ${isCurrentYear
              ? 'bg-[#f0251f] text-white font-bold shadow-md'
              : 'text-gray-700 hover:bg-gray-100 hover:text-[#f0251f]'
            }
          `}
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {year}
        </button>
      );
    }
    
    return years;
  };

  const navigateYearRange = (direction) => {
    if (direction === 'prev') {
      // Ir a 12 años antes
      const newYear = currentYear - 12;
      setCurrentYear(Math.max(minYear, newYear));
    } else {
      // Ir a 12 años después
      const newYear = currentYear + 12;
      setCurrentYear(Math.min(maxYear, newYear));
    }
  };

  // Calcular el rango de años visible actual
  const getYearRangeLabel = () => {
    const baseYear = Math.floor(currentYear / 12) * 12;
    const endYear = Math.min(baseYear + 11, maxYear);
    const startYear = Math.max(baseYear, minYear);
    return `${startYear} - ${endYear}`;
  };

  return (
    <div className="relative">
      {/* Input de fecha */}
      <div
        ref={inputRef}
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
        className={`
          w-full h-10 sm:h-12 px-2 sm:px-3 border border-gray-300 rounded-lg 
          flex items-center justify-between cursor-pointer
          transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:border-[#f0251f]'}
          ${showCalendar ? 'border-[#f0251f] ring-2 ring-[#f0251f]/20' : ''}
          ${className}
        `}
        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
      >
        <span className={`text-xs sm:text-sm ${value ? 'text-gray-700' : 'text-gray-400'}`}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showCalendar ? 'text-[#f0251f]' : 'text-gray-400'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Calendario desplegable */}
      {showCalendar && (
        <div 
          ref={calendarRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 z-50 w-full min-w-[280px] sm:min-w-[320px]"
          style={{ fontFamily: 'MusticaPro, sans-serif' }}
        >
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => selectedView === 'years' ? navigateYearRange('prev') : navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedView(selectedView === 'months' ? 'days' : 'months')}
                className="px-3 py-1 text-sm sm:text-base font-bold text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {selectedView === 'years' ? 'Selecciona el año' : monthNames[currentMonth]}
              </button>
              {selectedView !== 'years' && (
                <button
                  type="button"
                  onClick={() => setSelectedView('years')}
                  className="px-3 py-1 text-sm sm:text-base font-bold text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {currentYear}
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => selectedView === 'years' ? navigateYearRange('next') : navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Vista de días */}
          {selectedView === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderDays()}
              </div>
            </>
          )}

          {/* Vista de meses */}
          {selectedView === 'months' && (
            <>
              <p className="text-center text-sm text-gray-600 mb-3" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                Selecciona el mes
              </p>
              <div className="grid grid-cols-3 gap-2">
                {renderMonths()}
              </div>
            </>
          )}

          {/* Vista de años */}
          {selectedView === 'years' && (
            <>
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600 mb-1" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                  Rango actual
                </p>
                <p className="text-lg font-bold text-[#f0251f]" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                  {getYearRangeLabel()}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {renderYears()}
              </div>
            </>
          )}

          {/* Footer con botones */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowCalendar(false);
                setSelectedView('days');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Cancelar
            </button>
            
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setShowCalendar(false);
                  setSelectedView('days');
                }}
                className="px-4 py-2 text-sm text-[#f0251f] hover:text-[#d01f1b] font-medium transition-colors duration-200"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
