import { Box, Typography, Chip, Stack } from "@mui/material";

export default function Slots({ slots, onTimeSelect, selectedTime }) {
  if (!slots || slots.length === 0) {
    return (
      <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
        На выбранную дату нет свободных слотов
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
        {slots.map((time) => (
          <Chip
            key={time}
            label={time}
            clickable
            // Если время выбрано — красим в зеленый (success), иначе — стандартный
            color={selectedTime === time ? "success" : "default"}
            variant={selectedTime === time ? "contained" : "outlined"}
            onClick={() => onTimeSelect(time)}
            sx={{
              borderRadius: "8px",
              px: 1,
              // Фиксируем ширину, чтобы все чипсы были одинаковыми
              minWidth: "70px",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
