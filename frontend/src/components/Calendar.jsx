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
  const todayNoTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

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

  useEffect(() => {
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    if (onDataSelect) {
      onDataSelect(`${d}.${m}.26`);
    }
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const emptySlots = Array.from({ length: shift });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Box sx={{ width: "100%", mt: 1 }}>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="month-select-label">Месяц</InputLabel>
        <Select
          labelId="month-select-label"
          value={viewMonth}
          label="Месяц"
          onChange={(e) => setViewMonth(Number(e.target.value))}
          sx={{ borderRadius: 2 }}
        >
          {monthNames.map((name, index) => {
            if (index < today.getMonth()) {
              return;
            } else {
              return (
                <MenuItem key={index} value={index}>
                  {name}
                </MenuItem>
              );
            }
          })}
        </Select>
      </FormControl>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
          width: "100%",
        }}
      >
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

        {emptySlots.map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const formattedDay = String(day).padStart(2, "0");
          const formattedMonth = String(viewMonth + 1).padStart(2, "0");
          const fullDate = `${formattedDay}.${formattedMonth}.26`;
          const isActive = selectedDate === fullDate;

          // --- ЛОГИКА ПРОВЕРКИ ПРОШЕДШЕЙ ДАТЫ ---
          const dateToCheck = new Date(viewYear, viewMonth, day);
          const isPast = dateToCheck < todayNoTime;
          // --------------------------------------

          return (
            <Button
              key={day}
              variant={isActive ? "contained" : "text"}
              color={isActive ? "success" : "inherit"}
              onClick={() => !isPast && onDataSelect(fullDate)} // Защита от клика
              disabled={isPast} // Сама кнопка станет серой
              disableElevation
              sx={{
                minWidth: 0,
                aspectRatio: "1/1",
                p: 0,
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: isActive ? "bold" : "500",
                // Стиль для прошедших дат (по желанию можно добавить прозрачность)
                opacity: isPast ? 0.4 : 1,
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
