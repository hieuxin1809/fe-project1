import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  Modal,
  Avatar,
  Button,
  TextField,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  deleteCard,
  updateCard,
  addUserIntoCard,
  deleteUserCard,
} from "../../../../../../../apis";
import { toast } from "react-toastify";
import { useState } from "react";

export const Card = ({ card, handleDeleteCard, board }) => {
  const [openNewCardTitle, setOpenNewCardTitle] = useState(false);
  const [openNewCardDescription, setOpenNewCardDescription] = useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [openCardDetailModal, setOpenCardDetailModal] = React.useState(false);
  const [description, setDescription] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleOpenNewCardTitle = () => setOpenNewCardTitle(!openNewCardTitle);
  const toggleOpenNewCardDescription = () =>
    setOpenNewCardDescription(!openNewCardDescription);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: card._id, data: { ...card } });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    maxWidth: 600,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 3.5,
    borderRadius: "8px",
  };
  React.useEffect(() => {
    setCardTitle(card.title);
    setDescription(card.description);
  }, []);
  const handleConfirm = async () => {
    try {
      await deleteCard(card.columnId, card._id);
      handleDeleteCard();
      toast.success("Xóa thẻ thành công");
      setOpenModal(false);
    } catch (error) {
      toast.success("Xóa thẻ thất bại");
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await updateCard({ cardId: card._id, title: cardTitle.trim() });
      handleDeleteCard();
    } catch (error) {
      console.log(error);
      toast.success("Cập nhật thất bại thất bại");
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await updateCard({ cardId: card._id, description: description.trim() });
      toggleOpenNewCardDescription();
      handleDeleteCard();
    } catch (error) {
      console.log(error);
      toast.success("Cập nhật thất bại thất bại");
    }
  };

  return (
    <>
      <Box
        sx={{
          background: card?.FE_placeholderCard ? "#101204" : "#22272b",
          color: "#b2beca",
          minHeight: card?.FE_placeholderCard ? 0 : "40px",
          margin: "8px 10px",
          padding: card?.FE_placeholderCard ? 0 : "7px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "7px",
          cursor: "pointer",
        }}
        ref={setNodeRef}
        style={style}
        {...attributes}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            width: "100%",
            marginLeft: "8px",
          }}
        >
          <Typography
            ml={0.5}
            fontSize={14}
            sx={{
              maxWidth: "100px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onClick={() => setOpenCardDetailModal(true)}
          >
            {cardTitle}
          </Typography>
          {!card._id.includes("placeholder-card") && (
            <Box {...listeners} sx={{ color: "#22272b", flex: 1 }}>
              l
            </Box>
          )}
          {!card._id.includes("placeholder-card") && (
            <DeleteIcon
              sx={{ fontSize: "16px", marginRight: "6px" }}
              onClick={() => setOpenModal(true)}
            />
          )}
        </Stack>
        {card && card.members && (
          <Stack
            sx={{
              flexDirection: "row",
              justifyContent: "flex-end",
              width: "100%",
            }}
            mt={1}
          >
            {card.members.slice(0, 4).map((item, index) => (
              <Tooltip key={index} title={item.username}>
                <Avatar
                  src={item.avatar || ""}
                  alt={item.username || ""}
                  sx={{
                    fontSize: "14px",
                    width: "23px",
                    height: "23px",
                    margin: "0 2px",
                  }}
                >
                  {item.username?.[0] || "?"}
                </Avatar>
              </Tooltip>
            ))}

            {card.members.length > 4 && (
              <Avatar
                sx={{
                  fontSize: "12px",
                  width: "23px",
                  height: "23px",
                  backgroundColor: "#555",
                  margin: "0 2px",
                }}
              >
                +{card.members.length - 4}
              </Avatar>
            )}
          </Stack>
        )}
      </Box>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Xác nhận xóa
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa thẻ này không?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={() => {
                setOpenModal(false);
              }}
              sx={{ mr: 2 }}
            >
              Hủy
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirm}>
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openCardDetailModal}
        // open={true}
        onClose={() => setOpenCardDetailModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          {!openNewCardTitle ? (
            <Typography
              id="modal-title"
              variant="h6"
              fontWeight="bold"
              onClick={() => {
                toggleOpenNewCardTitle();
              }}
            >
              {cardTitle}
            </Typography>
          ) : (
            <Stack flexDirection="row">
              <TextField
                placeholder="Nhập tiêu đề"
                fullWidth
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    padding: "4px", // Giảm padding tổng thể
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "4px", // Giảm padding của input bên trong
                  },
                }}
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
              />
              <Stack flexDirection="row">
                <IconButton
                  onClick={() => {
                    toggleOpenNewCardTitle();
                    // setNewColumnTitle(""); // Reset tiêu đề khi đóng
                  }}
                  sx={{ color: "black" }} // Tùy chỉnh màu và kích thước
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => {
                    handleUpdateTitle();
                    toggleOpenNewCardTitle();
                  }}
                  sx={{ color: "black" }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          )}
          {card && card.members ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Stack direction="row" spacing={1}>
                {card?.members.slice(0, 4).map((item, index) => (
                  // <Tooltip key={index} title={item.username}>
                  //   <Avatar
                  //     src={item.avatar || ""}
                  //     alt={item.username || ""}
                  //     sx={{
                  //       fontSize: "14px",
                  //       width: "35px",
                  //       height: "35px",
                  //       margin: "0 2px",
                  //     }}
                  //   >
                  //     {item.username?.[0] || "?"}
                  //   </Avatar>
                  // </Tooltip>
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      mr: 1,
                    }}
                  >
                    <Avatar
                      src={item.avatar || ""}
                      alt={item.username || ""}
                      sx={{ fontSize: "14px", width: "35px", height: "35px" }}
                    >
                      {item.username?.[0] || "?"}
                    </Avatar>

                    <IconButton
                      size="small"
                      onClick={async () => {
                        await deleteUserCard({
                          cardId: card._id,
                          userId: item._id,
                        });
                        handleDeleteCard();
                      }}
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "white",
                        padding: "2px",
                        zIndex: 1,
                        "&:hover": {
                          backgroundColor: "grey.200",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}

                {card?.members.length > 4 && (
                  <Avatar
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      width: "35px",
                      height: "35px",
                      backgroundColor: "#555",
                      margin: "0 2px",
                    }}
                  >
                    +{card?.members.length - 4}
                  </Avatar>
                )}
                {/* {card?.members.map((item, index) => (
                  <Tooltip key={index} title={item.username}>
                    <Box
                      sx={{
                        position: "relative",
                        display: "inline-block",
                        mr: 1,
                      }}
                    >
                      <Avatar
                        src={item.avatar || ""}
                        alt={item.username || ""}
                        sx={{ fontSize: "14px", width: "35px", height: "35px" }}
                      >
                        {item.username?.[0] || "?"}
                      </Avatar>

                      <IconButton
                        size="small"
                        onClick={async () => {
                          await deleteUserCard({
                            cardId: card._id,
                            userId: item._id,
                          });
                          handleDeleteCard();
                        }}
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "white",
                          padding: "2px",
                          zIndex: 1,
                          "&:hover": {
                            backgroundColor: "grey.200",
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                ))} */}

                <Box
                  sx={{
                    width: 35,
                    height: 35,
                    borderRadius: "50%",
                    backgroundColor: "#101518",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 1,
                  }}
                >
                  <IconButton sx={{ color: "#CBD5E0" }}>
                    <AddIcon fontSize="small" onClick={handleClick} />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Box
              sx={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                backgroundColor: "#101518",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 1,
              }}
            >
              <IconButton sx={{ color: "#CBD5E0" }}>
                <AddIcon fontSize="small" onClick={handleClick} />
              </IconButton>
            </Box>
          )}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            sx={{
              mt: 1,
            }}
          >
            {board?.matchedUsers?.map((member, index) => (
              <MenuItem
                key={index}
                onClick={handleClose}
                sx={{
                  padding: "4px 4px",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                  onClick={async () => {
                    try {
                      await addUserIntoCard({
                        cardId: card._id,
                        userId: member._id,
                      });
                      handleDeleteCard();
                    } catch (error) {
                      console.log(error);
                      toast.error("Đã xảy ra lỗi");
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center">
                    <IconButton>
                      <Avatar
                        src=""
                        alt=""
                        sx={{
                          fontSize: "14px",
                          width: "25px",
                          height: "25px",
                        }}
                      />
                    </IconButton>
                    <Typography
                      sx={{
                        // color: "#a3aeb9",
                        fontWeight: 600,
                        marginRight: "4px",
                        fontSize: "15px",
                        maxWidth: "150px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                      }}
                    >
                      {member?.username}
                    </Typography>
                  </Stack>
                </Stack>
              </MenuItem>
            ))}
          </Menu>
          <Typography variant="body2" fontWeight="bold" sx={{ mt: 2 }}>
            Mô tả
          </Typography>
          {!openNewCardDescription ? (
            <>
              <Typography
                sx={{ whiteSpace: "pre-line" }}
                onClick={() => toggleOpenNewCardDescription()}
              >
                {description}
              </Typography>
              {!description && (
                <Typography
                  sx={{
                    fontSize: "13px",
                    mt: 1,
                    color: "#2196f3",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleOpenNewCardDescription()}
                >
                  Thêm mô tả
                </Typography>
              )}
            </>
          ) : (
            <>
              <TextField
                placeholder="Thêm mô tả chi tiết hơn..."
                fullWidth
                multiline
                minRows={3}
                sx={{ mt: 1 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  onClick={() => setOpenNewCardDescription(false)}
                  sx={{ mr: 2 }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleUpdateDescription}
                >
                  Lưu
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};
