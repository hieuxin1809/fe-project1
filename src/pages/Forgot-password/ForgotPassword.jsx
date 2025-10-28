import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../apis";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState();

  const navigate = useNavigate();
  //   useEffect(() => {
  //     localStorage.setItem("login", "false");
  //   }, []);
  const handleSend = async () => {
    try {
      const result = await forgotPassword({ email });
      toast.success("Kiểm tra email của bạn ");
    } catch (error) {
      if (error.response.data.message.includes("Email not found"))
        return toast.error("Email không tồn tại");
      toast.error("Đã xảy ra lỗi, hãy kiểm tra lại tài khoản hoặc mật khẩu");
    }
  };
  return (
    <Container
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          textAlign: "center",
          bgcolor: "background.paper",
          width: "100%",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Quên mật khẩu
        </Typography>
        <TextField
          fullWidth
          label="Nhập email"
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiInputBase-root": { height: 45 },
            "& .MuiInputBase-input": { fontSize: 14, padding: "6px 10px" },
            "& .MuiInputLabel-root": { fontSize: 14, top: -5 },
            "& .MuiInputLabel-shrink": { top: 0 },
          }}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSend}
        >
          Gửi
        </Button>
      </Box>
    </Container>
  );
}
