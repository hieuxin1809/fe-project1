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
import { loginAPI } from "../../apis";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const navigate = useNavigate();
  //   useEffect(() => {
  //     localStorage.setItem("login", "false");
  //   }, []);
  const handleLogin = async () => {
    try {
      const result = await loginAPI({ email, password });
      localStorage.setItem("login", "true");
      localStorage.setItem("userId", result.id);gggg

      navigate("/home");
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
          Đăng Nhập
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
        <TextField
          fullWidth
          label="Mật khẩu"
          type="password"
          margin="normal"
          variant="outlined"
          sx={{
            "& .MuiInputBase-root": { height: 45 },
            "& .MuiInputBase-input": { fontSize: 14, padding: "6px 10px" },
            "& .MuiInputLabel-root": { fontSize: 14, top: -5 },
            "& .MuiInputLabel-shrink": { top: 0 },
          }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Đăng Nhập
        </Button>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
        >
          <Typography variant="body2" sx={{ mt: 1 }}>
            {/* Chưa có tài khoản?{" "} */}
            <Link
              to="/register"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Đăng ký
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <Link
              to="/forgot-password"
              style={{ textDecoration: "none", color: "#1976d2" }}
            >
              Quên mật khẩu
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
