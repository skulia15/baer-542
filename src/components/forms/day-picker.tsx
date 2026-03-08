'use client'

import { formatDay } from '@/lib/dates'

interface DayPickerProps {
  days: string[]
  disabledDays?: string[]
  onChange: (selected: string[]) => void
  value: string[]
}

export function DayPicker({ days, disabledDays = [], onChange, value }: DayPickerProps) {
  const allEnabled = days.filter((d) => !disabledDays.includes(d))
  const allSelected = allEnabled.length > 0 && allEnabled.every((d) => value.includes(d))

  const toggle = (day: string) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day))
    } else {
      onChange([...value, day])
    }
  }

  const toggleAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(allEnabled)
    }
  }

  return (
    <div>
      <div className="divide-y divide-stone-100">
        {days.map((day) => {
          const disabled = disabledDays.includes(day)
          const checked = value.includes(day)
          return (
            <label
              key={day}
              className={`flex items-center gap-3 py-3 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => !disabled && toggle(day)}
                className="h-4 w-4 rounded border-stone-300 accent-green-700"
              />
              <span className="text-sm text-stone-800">{formatDay(new Date(day))}</span>
            </label>
          )
        })}
      </div>
      <button
        type="button"
        onClick={toggleAll}
        className="mt-3 text-sm font-medium text-green-700 underline underline-offset-2"
      >
        {allSelected ? 'Afvelja alla' : 'Velja alla'}
      </button>
    </div>
  )
}
