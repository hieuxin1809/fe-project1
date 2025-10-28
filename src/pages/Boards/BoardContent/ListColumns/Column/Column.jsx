import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Menu,
  MenuItem,
  Button,
  Modal,
  IconButton,
} from "@mui/material";
import { ListCards } from "./ListCards/ListCards";
import AddIcon from "@mui/icons-material/Add";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { toast } from "react-toastify";
import CheckIcon from "@mui/icons-material/Check";
import { updateTitleAPI } from "../../../../../apis";

export const Column = ({
  board,
  column,
  createNewCard,
  handleDeleteColumn,
  handleDeleteCard,
}) => {
  const [openNewTitle, setOpenNewTitle] = useState(false);
  const [openNewCard, setOpenNewCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const toggleOpenNewTitle = () => setOpenNewTitle(!openNewTitle);

  const open = Boolean(anchorEl);
  const handleOpenModal = () => {
    setOpenModal(true);
    setAnchorEl(null);
  };
  useEffect(() => {
    setNewColumnTitle(column.title);
  }, []);
  const handleCloseModal = () => setOpenModal(false);
  const handleConfirm = async () => {
    await handleDeleteColumn(column._id);
    setOpenModal(false);
    toast.success("Xoá cột thành công");
  };

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column._id, data: { ...column } });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: "100%",
  };
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 3.5,
    borderRadius: "8px",
  };
  const toggleOpenNewCard = () => setOpenNewCard((prev) => !prev);

  const addNewCard = async () => {
    if (newCardTitle) {
      const newCardData = {
        title: newCardTitle.trim(),
        columnId: column._id,
      };
      await createNewCard(newCardData);

      setOpenNewCard();
      setNewCardTitle();
      return;
    }
    toast.error("Bạn cần nhập tiêu đề thẻ");
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (anchorEl) {
      setAnchorEl(null);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await updateTitleAPI({ columnId: column._id, title: newColumnTitle });
      toast.success("Cập nhật tiêu đề thành công");
      setNewColumnTitle(newColumnTitle);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setNewColumnTitle(column.title);
  }, []);
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Box
        sx={{
          minWidth: "300px",
          maxWidth: "300px",
          margin: "10px 10px",
          borderRadius: "12px",
          background: "#101204",
          paddingBottom: "1px",
        }}
      >
        <Box
          sx={{
            height: "45px",
            margin: "0px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#b6c2cf",
            cursor: "pointer",
          }}
        >
          {!openNewTitle ? (
            <>
              <Typography
                ml={1}
                fontWeight={600}
                onClick={() => toggleOpenNewTitle()}
                sx={{
                  maxWidth: "150px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {newColumnTitle}
              </Typography>
              <Box {...listeners} sx={{ color: "#101204", flex: 1 }}>
                l
              </Box>
            </>
          ) : (
            // </Stack>
            <Stack
              sx={{
                minWidth: "200px",
                alignItems: "center",
                fontWeight: 600,
                cursor: "pointer",
                background: "#101204",
                color: "#ffffff",
                margin: "10px 0 5px 0",
                flexDirection: "row",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Nhập tiêu đề cột"
                autoFocus
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                // onBlur={() => toggleOpenNewTitle()}
                sx={{
                  backgroundColor: "#22272b",
                  // borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    height: "30px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: "#444c56",
                    },
                    "&:hover fieldset": {
                      borderColor: "#666e76",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#888e96",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#b0b8c0",
                    opacity: 1,
                  },
                }}
              />
              <Stack flexDirection="row">
                <IconButton
                  onClick={() => {
                    toggleOpenNewTitle();
                    // setNewColumnTitle(""); // Reset tiêu đề khi đóng
                  }}
                  sx={{ color: "#b6c2cf", padding: "0", marginLeft: "7px" }} // Tùy chỉnh màu và kích thước
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleUpdateTitle();
                    toggleOpenNewTitle();
                  }}
                  sx={{ color: "#b6c2cf", padding: "0", marginLeft: "5px" }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          )}
          <MoreHorizIcon
            onClick={(event) => {
              event.stopPropagation();
              handleClick(event);
            }}
            sx={{ cursor: "pointer" }}
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            disableAutoFocusItem
          >
            <MenuItem
              onClick={() => {
                setOpenNewCard(true);
                setAnchorEl(null);
              }}
            >
              Thêm thẻ
            </MenuItem>
            <MenuItem onClick={handleOpenModal}>Xóa cột</MenuItem>
          </Menu>
        </Box>

        <ListCards
          cards={column.cards}
          handleDeleteCard={handleDeleteCard}
          board={board}
        />
        <Box>
          {!openNewCard ? (
            <Box
              sx={{
                minHeight: "30px",
                display: "flex",
                alignItems: "center",
                color: "#b6c2cf",
                fontWeight: 600,
                margin: "4px 10px 10px 10px",
                borderRadius: "7px",
                cursor: "pointer",
                ":hover": { background: "#282f27" },
              }}
              onClick={() => toggleOpenNewCard()}
            >
              <Stack flexDirection="row" alignItems="center" ml={0.5}>
                <AddIcon sx={{ fontSize: "17px" }} />
                <Typography
                  sx={{
                    fontSize: "14px",
                    marginLeft: "5px",
                    fontWeight: "600",
                  }}
                >
                  Thêm thẻ
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                minWidth: "260px",
                alignItems: "center",
                fontWeight: 600,
                margin: "0px 3px 7px 3px",
                borderRadius: "12px",
                cursor: "pointer",
                background: "#101204",
                color: "#ffffff",
                padding: "12px",
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Nhập tiêu đề thẻ"
                autoFocus
                onChange={(e) => setNewCardTitle(e.target.value)}
                sx={{
                  backgroundColor: "#22272b",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    height: "36px",
                    fontSize: "14px",
                    "& fieldset": {
                      borderColor: "#444c56",
                    },
                    "&:hover fieldset": {
                      borderColor: "#666e76",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#888e96",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#b0b8c0",
                    opacity: 1,
                  },
                }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={1.5}
              >
                <Button
                  variant="contained"
                  sx={{
                    color: "#1d2125",
                    textTransform: "none",
                    fontSize: "13px",
                  }}
                  onClick={() => addNewCard()}
                >
                  Thêm thẻ
                </Button>
                <CloseIcon
                  onClick={() => {
                    toggleOpenNewCard();
                    setNewCardTitle("");
                  }}
                  sx={{ color: "#b6c2cf" }}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Xác nhận xóa
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa cột này không?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button onClick={handleCloseModal} sx={{ mr: 2 }}>
              Hủy
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirm}>
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};
