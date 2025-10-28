import { useState } from "react";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { createNewUserAPI } from "../../apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "", // Thêm username vào formData
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "", // Thêm username vào errors
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    let newErrors = {
      username: "", // Thêm username vào newErrors
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Thêm validation cho username
    if (!formData.username) {
      newErrors.username = "Vui lòng nhập tên người dùng";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await createNewUserAPI({
        username: formData.username, // Thêm username vào API call
        email: formData.email,
        password: formData.password,
      });
      toast.success("Tạo tài khoản thành công");
      navigate("/login");
    } catch (error) {
      if (error.response.data.message.includes("Email"))
        return toast.error("Email đã tồn tại");
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
          Đăng Ký
        </Typography>

        {/* Thêm TextField cho username */}
        <TextField
          fullWidth
          label="Tên người dùng"
          name="username"
          margin="normal"
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
          error={Boolean(errors.username)}
          helperText={errors.username}
          sx={{
            "& .MuiInputBase-root": {
              height: 45,
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              padding: "6px 10px",
            },
            "& .MuiInputLabel-root": {
              fontSize: 14,
              top: -5,
              color: "rgba(0, 0, 0, 0.6)",
            },
            "& .MuiInputLabel-shrink": {
              top: 0,
            },
            "& .MuiFormHelperText-root": {
              color: "red",
              marginLeft: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23 ) !important",
            },
          }}
        />

        <TextField
          fullWidth
          label="Email"
          name="email"
          margin="normal"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          error={Boolean(errors.email)}
          helperText={errors.email}
          sx={{
            "& .MuiInputBase-root": {
              height: 45,
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              padding: "6px 10px",
            },
            "& .MuiInputLabel-root": {
              fontSize: 14,
              top: -5,
              color: "rgba(0, 0, 0, 0.6)",
            },
            "& .MuiInputLabel-shrink": {
              top: 0,
            },
            "& .MuiFormHelperText-root": {
              color: "red",
              marginLeft: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23 ) !important",
            },
          }}
        />

        <TextField
          fullWidth
          label="Mật khẩu"
          name="password"
          type="password"
          margin="normal"
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
          error={Boolean(errors.password)}
          helperText={errors.password}
          sx={{
            "& .MuiInputBase-root": {
              height: 45,
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              padding: "6px 10px",
            },
            "& .MuiInputLabel-root": {
              fontSize: 14,
              top: -5,
              color: "rgba(0, 0, 0, 0.6)",
            },
            "& .MuiInputLabel-shrink": {
              top: 0,
            },
            "& .MuiFormHelperText-root": {
              color: "red",
              marginLeft: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23 ) !important",
            },
          }}
        />

        <TextField
          fullWidth
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          type="password"
          margin="normal"
          variant="outlined"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          sx={{
            "& .MuiInputBase-root": {
              height: 45,
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              padding: "6px 10px",
            },
            "& .MuiInputLabel-root": {
              fontSize: 14,
              top: -5,
              color: "rgba(0, 0, 0, 0.6)",
            },
            "& .MuiInputLabel-shrink": {
              top: 0,
            },
            "& .MuiFormHelperText-root": {
              color: "red",
              marginLeft: 0,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23 ) !important",
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Đăng Ký
        </Button>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            Đăng nhập
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
