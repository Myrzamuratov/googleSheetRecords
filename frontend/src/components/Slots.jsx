import { Box, Typography, Chip, Stack } from "@mui/material";

export default function Slots({
  slots,
  onTimeSelect,
  selectedTime,
  selectedDate,
}) {
  const now = new Date();

  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const todayStr = `${d}.${m}.26`;

  if (!slots || slots.length === 0) {
    return (
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        На выбранную дату нет свободных слотов
      </Typography>
    );
  }

  const visibleSlots = slots.filter((time) => {
    if (selectedDate !== todayStr) return true;

    const [hours, minutes] = time.split(":").map(Number);

    // Создаем объект времени для слота
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime > now;
  });

  if (visibleSlots.length === 0) {
    return (
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        На сегодня свободного времени больше нет
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 3, width: "100%" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontSize: "1rem", fontWeight: 600 }}
      >
        Доступное время
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {visibleSlots.map((time) => (
          <Chip
            key={time}
            label={time}
            clickable
            color={selectedTime === time ? "success" : "default"}
            variant={selectedTime === time ? "contained" : "outlined"}
            onClick={() => onTimeSelect(time)}
            sx={{
              borderRadius: "8px",
              px: 1,
              minWidth: "70px",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
