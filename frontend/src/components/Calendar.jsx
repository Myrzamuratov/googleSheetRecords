import { useEffect, useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Button,
} from "@mui/material";

export default function Calendar({ onDataSelect, selectedDate }) {
  const today = new Date();
  // Состояние для отображения месяца и года в календаре
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear] = useState(2026);

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  // При первой загрузке устанавливаем сегодняшнюю дату как выбранную
  useEffect(() => {
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    if (onDataSelect) {
      onDataSelect(`${d}.${m}.26`);
    }
  }, []);

  // Логика расчета сетки
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const emptySlots = Array.from({ length: shift });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      {/* Селект выбора месяца */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="month-select-label">Месяц</InputLabel>
        <Select
          labelId="month-select-label"
          value={viewMonth}
          label="Месяц"
          onChange={(e) => setViewMonth(Number(e.target.value))}
          sx={{ borderRadius: 2 }}
        >
          {monthNames.map((name, index) => (
            <MenuItem key={index} value={index}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Сетка календаря через чистый CSS Grid для стабильности */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          width: "100%",
          userSelect: "none",
        }}
      >
        {/* Заголовки дней недели */}
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
          <Typography
            key={day}
            variant="caption"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "text.secondary",
              py: 1,
              fontSize: "0.7rem",
              textTransform: "uppercase",
            }}
          >
            {day}
          </Typography>
        ))}

        {/* Пустые ячейки (отступы начала месяца) */}
        {emptySlots.map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {/* Числа месяца */}
        {days.map((day) => {
          const formattedDay = String(day).padStart(2, "0");
          const formattedMonth = String(viewMonth + 1).padStart(2, "0");
          const fullDate = `${formattedDay}.${formattedMonth}.26`;
          const isActive = selectedDate === fullDate;

          return (
            <Button
              key={day}
              variant={isActive ? "contained" : "text"}
              color={isActive ? "success" : "inherit"}
              onClick={() => onDataSelect(fullDate)}
              disableElevation
              sx={{
                minWidth: 0,
                aspectRatio: "1/1",
                p: 0,
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: isActive ? "bold" : "500",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: isActive ? "success.dark" : "rgba(0,0,0,0.06)",
                },
              }}
            >
              {day}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
