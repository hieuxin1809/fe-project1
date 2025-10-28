import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Stack,
  Typography,
  IconButton,
  Box,
  Modal,
  TextField,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { toast } from "react-toastify";
import { ChevronRight } from "@mui/icons-material";
import {
  createBoardTitleAPI,
  getUserById,
  deleteBoard,
  invite,
  updateBoardData,
  deleteUserBoard,
} from "../../apis";
import "react-toastify/dist/ReactToastify.css";

function Header({ setBoardId, setBoard, board }) {
  const [boardTitle, setBoardTitle] = useState("");
  const [email, setEmail] = useState("");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [userData, setUserData] = useState();
  const [currentBoardData, setCurrentBoardData] = useState();
  const [deleteUserData, setDeleteUserData] = useState();
  const [deleteBoardId, setDeleteBoardId] = useState();
  const [boardList, setBoardList] = useState([]);
  const [openCreateBoardModal, setOpenCreateBoardModal] = React.useState(false);
  const [openDeleteUserModal, setOpenDeleteUserModal] = React.useState(false);
  const [openInviteModal, setOpenInviteModal] = React.useState(false);
  const [openDeleteBoardModal, setOpenDeleteBoardModal] = React.useState(false);
  const [openDraw, setOpenDraw] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [listAnchorEl, setListAnchorEl] = useState(null);
  const [openNewBoardTitle, setOpenNewBoardTitle] = useState(false);
  const [emailError, setEmailError] = useState("");
  const userId = localStorage.getItem("userId");
  const open = Boolean(listAnchorEl);
  const navigate = useNavigate();
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  useEffect(() => {
    if (localStorage.getItem("login") === "false") {
      navigate("/login", { replace: true });
    }
  }, []);

  useEffect(() => {
    const lam = async () => {
      await getBoardList();
    };
    lam();
  }, []);
  useEffect(() => {
    setNewBoardTitle(board?.title);
  }, [board]);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClick = (event) => {
    setListAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setListAnchorEl(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  const toggleOpenNewBoardTitle = () =>
    setOpenNewBoardTitle(!openNewBoardTitle);
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

  const handleOpenModal = () => {
    setOpenCreateBoardModal(true);
  };
  const handleCloseModal = () => setOpenCreateBoardModal(false);
  const handleConfirm = async () => {
    try {
      const result = await createBoardTitleAPI({ title: boardTitle, userId });
      const user = await getUserById(userId);
      setBoardId(result._id);
      setCurrentBoardData({ title: result.title, boardId: result._id });
      setBoardList(user.ownedBoards);
      setOpenCreateBoardModal(false);
      setOpenDraw(false);
      toast.success("Tạo bảng thành công");
    } catch (e) {
      console.log(e);
    }
  };
  const handleConfirmDeleteBoard = async () => {
    try {
      const result = await deleteBoard(deleteBoardId, userId);
      const user = await getUserById(userId);
      if (currentBoardData.boardId == deleteBoardId) {
        if (user.ownedBoards.length != 0) {
          setCurrentBoardData(user.ownedBoards[0]);
          setBoardId(user.ownedBoards[0].boardId);
        } else {
          setBoard(null);
          setCurrentBoardData({});
        }
      }
      if (user.ownedBoards.length == 0) {
        setBoard(null);
        setCurrentBoardData({});
      }
      setBoardList(user.ownedBoards);
      setOpenDeleteBoardModal(false);
      toast.success("Xóa bảng thành công");
    } catch (e) {
      console.log(e);
    }
  };

  const getBoardList = async () => {
    try {
      const result = await getUserById(userId);
      setUserData(result);
      setBoardList(result.ownedBoards);
      setBoardId(result.ownedBoards[0].boardId);
      setCurrentBoardData(result.ownedBoards[0]);
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateBoardTitle = async () => {
    try {
      const result = await updateBoardData(currentBoardData.boardId, {
        title: newBoardTitle.trim(),
      });
      const boardList = await getUserById(userId);
      setBoardList(boardList.ownedBoards);
      setCurrentBoardData({ title: result.title, boardId: result._id });
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.log(error);
    }
  };
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        backgroundColor: "#1d2125",
        position: "fixed",
        top: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
        padding: "4px 20px",
      }}
    >
      <Stack direction="row" alignItems="center">
        {boardList.length != 0 && !openNewBoardTitle ? (
          <Typography
            mr={5}
            sx={{
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "17px",
              minWidth: "100px",
            }}
            onClick={() => toggleOpenNewBoardTitle()}
          >
            {currentBoardData.title}
          </Typography>
        ) : (
          <>
            {boardList.length != 0 && (
              <>
                <Stack flexDirection="row" alignItems="center">
                  <TextField
                    placeholder="Nhập tiêu đề"
                    fullWidth
                    autoFocus
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        background: "#22272b",
                        color: "white",
                      },
                      "& .MuiOutlinedInput-input": {
                        padding: "4px",
                      },
                    }}
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                  />
                  <Stack flexDirection="row">
                    <IconButton
                      onClick={() => {
                        toggleOpenNewBoardTitle();
                      }}
                      sx={{ color: "white" }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        handleUpdateBoardTitle();
                        toggleOpenNewBoardTitle();
                      }}
                      sx={{ color: "white" }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </>
            )}
          </>
        )}
        {boardList.length != 0 && (
          <Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                cursor: "pointer",
                background: "#1d2125",
                p: 1,
                borderRadius: 1,
                width: "fit-content",
                color: "white",
              }}
              onClick={handleClick}
            >
              <Typography>Danh sách thành viên</Typography>
              <KeyboardArrowDownIcon sx={{ ml: 1 }} />
            </Box>

            <Menu
              anchorEl={listAnchorEl}
              open={open}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: "#282e33",
                  minWidth: "240px",
                },
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
                  >
                    <Stack direction="row" alignItems="center">
                      <IconButton onClick={handleOpenMenu}>
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
                          color: "#a3aeb9",
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
                    <RemoveIcon
                      sx={{ color: "#a3aeb9" }}
                      onClick={() => {
                        setOpenDeleteUserModal(true);
                        setDeleteUserData({
                          currentMemberId: userId,
                          boardId: currentBoardData.boardId,
                          deletedMemberId: member._id,
                        });
                      }}
                    />
                  </Stack>
                </MenuItem>
              ))}
              <MenuItem
                onClick={() => {
                  setOpenInviteModal(true);
                }}
                sx={{ padding: "4px 4px" }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                >
                  <Typography
                    sx={{
                      color: "#a3aeb9",
                      marginLeft: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Thêm người dùng
                  </Typography>
                  <AddIcon sx={{ color: "#a3aeb9" }} />
                </Stack>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Stack>
      <Stack direction="row" alignItems="center">
        <Typography
          sx={{
            color: "white",
            fontWeight: 600,
            marginRight: "4px",
            fontSize: "17px",
          }}
        >
          {userData?.username}
        </Typography>
        <IconButton onClick={handleOpenMenu}>
          <Avatar
            src=""
            alt=""
            sx={{ fontSize: "14px", width: "35px", height: "35px" }}
          />
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => navigate("/profile")}>
          Chỉnh sửa thông tin
        </MenuItem>
        <MenuItem
          onClick={() => {
            localStorage.setItem("login", "false");
            navigate("/login", { replace: true });
          }}
        >
          Đăng xuất
        </MenuItem>
      </Menu>

      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
        }}
      >
        {!openDraw && (
          <IconButton
            onClick={() => setOpenDraw(true)}
            sx={{
              backgroundColor: "gray",
              color: "white",
              borderRadius: "0 8px 8px 0",
              p: 1,
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        <Drawer
          anchor="left"
          open={openDraw}
          onClose={() => setOpenDraw(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: "250px",

              backgroundColor: "#221d24",
            },
          }}
          disableEnforceFocus
        >
          <Stack alignItems="flex-end" p={2} color="#9ba8b6">
            <ArrowBackIosNewIcon
              sx={{ fontSize: "18px", cursor: "pointer" }}
              onClick={() => setOpenDraw(false)}
            />
          </Stack>

          <Box sx={{ backgroundColor: "#221d24" }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography sx={{ color: "#9ba8b6", fontWeight: 600 }} ml={2}>
                Các bảng của bạn
              </Typography>

              <AddIcon
                sx={{
                  color: "#9ba8b6",
                  cursor: "pointer",
                  marginRight: "16px",
                }}
                onClick={handleOpenModal}
              />
            </Stack>
            {boardList.map((item) => {
              return (
                <Stack
                  key={item._id}
                  flexDirection="row"
                  justifyContent="space-between"
                  sx={{
                    width: "100%",
                    cursor: "pointer",
                    color: "#9ba8b6",
                    paddingTop: 1,
                    paddingBottom: 1,
                    transition: "color 0.3s, background-color 0.3s",
                    "&:hover": {
                      backgroundColor: "#656166",
                    },
                  }}
                  onClick={() => {
                    setBoardId(item.boardId);
                    setCurrentBoardData(item);
                    setOpenDraw(false);
                    setNewBoardTitle(item.title);
                    setOpenNewBoardTitle(false);
                  }}
                >
                  <Typography ml={2}>{item.title}</Typography>

                  <Box
                    onClick={() => {
                      setOpenDeleteBoardModal(true);
                      setDeleteBoardId(item.boardId);
                    }}
                    mr={2}
                  >
                    <RemoveIcon />
                  </Box>
                </Stack>
              );
            })}
          </Box>
        </Drawer>
      </Box>
      <Modal
        open={openDeleteUserModal}
        onClose={() => setOpenDeleteUserModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Xác nhận xóa
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa người dùng này không?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={() => setOpenDeleteUserModal(false)}
              sx={{ mr: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  await deleteUserBoard(deleteUserData);
                  const user = await getUserById(userId);
                  if (
                    deleteUserData.currentMemberId ==
                    deleteUserData.deletedMemberId
                  ) {
                    if (user.ownedBoards.length != 0) {
                      setCurrentBoardData(user.ownedBoards[0]);
                      setBoardId(user.ownedBoards[0].boardId);
                      setBoardList(user.ownedBoards);
                    } else {
                      setBoard(null);
                      setCurrentBoardData({});
                      setBoardList(user.ownedBoards);
                    }
                  }
                  setOpenDeleteUserModal(false);
                  setBoardId(null);
                  setTimeout(() => {
                    setBoardId(board._id);
                  }, 10);
                } catch (error) {
                  toast.error(error.response.data.message);
                }
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openCreateBoardModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Tạo bảng mới
          </Typography>
          <TextField
            fullWidth
            label="Nhập tiêu đề"
            margin="dense"
            variant="outlined"
            sx={{
              "& .MuiInputBase-root": { height: 45 },
              "& .MuiInputBase-input": {
                fontSize: 14,
                padding: "6px 10px",
              },
              "& .MuiInputLabel-root": { fontSize: 14, top: -5 },
              "& .MuiInputLabel-shrink": { top: 0 },
            }}
            onChange={(e) => setBoardTitle(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button onClick={handleCloseModal} sx={{ mr: 2 }}>
              Hủy
            </Button>
            <Button variant="contained" color="error" onClick={handleConfirm}>
              Tạo
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openInviteModal}
        onClose={() => {
          setOpenInviteModal(false);
          setListAnchorEl(null);
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Thêm người dùng
          </Typography>
          <TextField
            fullWidth
            label="Nhập email người dùng cần mời"
            margin="dense"
            variant="outlined"
            error={!!emailError}
            helperText={emailError}
            sx={{
              "& .MuiInputBase-root": { height: 45 },
              "& .MuiInputBase-input": {
                fontSize: 14,
                padding: "6px 10px",
              },
              "& .MuiInputLabel-root": { fontSize: 14, top: -5 },
              "& .MuiInputLabel-shrink": { top: 0 },
            }}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(""); // xóa lỗi khi người dùng đang nhập lại
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={() => {
                setOpenInviteModal(false), setListAnchorEl(null);
              }}
              sx={{ mr: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={async () => {
                if (!validateEmail(email)) {
                  setEmailError("Email không hợp lệ");
                  return;
                }
                try {
                  await invite({
                    email,
                    userId,
                    boardId: currentBoardData.boardId,
                  });
                  setOpenInviteModal(false);
                  setListAnchorEl(null);
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              Mời
            </Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={openDeleteBoardModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Xoá bảng
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Bạn có chắc chắn muốn xóa bảng này không?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              onClick={() => {
                setOpenDeleteBoardModal(false);
              }}
              sx={{ mr: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDeleteBoard}
            >
              Xóa
            </Button>
          </Box>
        </Box>
      </Modal>
    </Stack>
  );
}

export default Header;
