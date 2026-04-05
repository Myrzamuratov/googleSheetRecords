import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Calendar from "./components/Calendar";
import Slots from "./components/Slots";

function App() {
  // Для того чтобы разделить форму на два
  const [step, setStep] = useState(1);
  // Собираем тут данные для записи
  const [booking, setBooking] = useState({
    date: "",
    time: "",
    name: "",
    phone: "",
    service: "",
    price: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]); // Для хранения свободных слотов времени
  const [services, setServices] = useState([]); // Для хранения услуг
  const [loading, setLoading] = useState(false); // Для включения/выключения лоадера
  const [finished, setIsFinished] = useState(false); // Для включения/выключения модального окна
  const [serverMessage, setServerMessage] = useState(""); // Состояние для текста из ответа

  // Функция получения свободных слотов и услуг по дате
  const loadSlots = async (formattedDate) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://googlesheetrecords.onrender.com/bookings/slots?date=${formattedDate}`,
      );
      const data = await res.json();
      setAvailableSlots(data.slots || []);
      setServices(data.services || []);
    } catch (error) {
      console.error("Ошибка сети при загрузке слотов", error);
    } finally {
      setLoading(false);
    }
  };
  // Получаем слоты каждый раз когда меняется дата
  useEffect(() => {
    if (booking.date) {
      loadSlots(booking.date);
    }
  }, [booking.date]);
  // Функция добавления записи
  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://googlesheetrecords.onrender.com/bookings/add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking),
        },
      );

      const data = await response.json();

      if (response.status === 409) {
        alert(data.error);
        setStep(1);
        return;
      }

      if (response.ok) {
        setServerMessage(data.message);
        setIsFinished(true);
      }
    } catch (error) {
      console.error(error);
      alert("Произошла ошибка при отправке");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsFinished(false);
    setStep(1);
    setBooking({
      date: "",
      time: "",
      name: "",
      phone: "",
      service: "",
      price: "",
    });
    window.location.reload();
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        py: 4,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {" "}
      {step === 1 ? (
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            sx={{ fontWeight: 700 }}
          >
            Бронирование
          </Typography>

          <Calendar
            selectedDate={booking.date}
            onDataSelect={(date) => setBooking({ ...booking, date, time: "" })}
          />

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Slots
              slots={availableSlots}
              selectedTime={booking.time}
              onTimeSelect={(time) => setBooking({ ...booking, time })}
            />
          )}

          {booking.date && booking.time && (
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                borderRadius: 3,
                py: 1.5,
                bgcolor: "#1e7e34",
                "&:hover": { bgcolor: "#155d25" },
              }}
              onClick={() => setStep(2)}
            >
              Далее
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Button onClick={() => setStep(1)} sx={{ alignSelf: "flex-start" }}>
            ← Назад
          </Button>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Контактные данные
          </Typography>

          <TextField
            fullWidth
            label="Ваше имя"
            value={booking.name}
            onChange={(e) => setBooking({ ...booking, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Номер телефона"
            placeholder="0700 123 456"
            value={booking.phone}
            onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Выберите услугу</InputLabel>
            <Select
              label="Выберите услугу"
              value={booking.service}
              onChange={(e) => {
                const selectedName = e.target.value;
                const serviceObject = services.find(
                  (s) => s.Название === selectedName,
                );
                setBooking({
                  ...booking,
                  service: selectedName,
                  price: serviceObject ? serviceObject.Стоимость : "",
                });
              }}
              MenuProps={{ disableScrollLock: true }}
            >
              {services.map((s, idx) => (
                <MenuItem key={idx} value={s.Название}>
                  {s.Название} — {s.Стоимость} сом
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={
              !booking.name || !booking.phone || !booking.service || loading
            }
            sx={{ mt: 2, borderRadius: 3, py: 1.5 }}
            onClick={handleFinalSubmit}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Подтвердить запись"
            )}
          </Button>
        </Box>
      )}
      {/* --- МОДАЛЬНОЕ ОКНО (DIALOG) --- */}
      <Dialog
        open={finished}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
          Успешно!
        </DialogTitle>
        <DialogContent>
          <Typography align="center">
            {serverMessage || "Ваша запись принята."}
          </Typography>
          <Typography align="center" sx={{ mt: 2, fontWeight: 500 }}>
            Ждем вас: {booking.date} в {booking.time}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            color="success"
            sx={{ borderRadius: 2 }}
          >
            Отлично
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;
