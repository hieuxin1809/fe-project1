import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../apis";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState();
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSend = async () => {
    try {
      console.log(1);
      const result = await resetPassword(token, { password });
      toast.success("Thay đổi mật khẩu thành công");
      navigate("/login", { replace: true });
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
          Nhập mật khẩu mới
        </Typography>
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
          onClick={handleSend}
        >
          Gửi
        </Button>
      </Box>
    </Container>
  );
}
