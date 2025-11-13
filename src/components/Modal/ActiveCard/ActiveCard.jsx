import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Chip, Menu, MenuItem, ListItemIcon, Avatar, ListItemText } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

import TextField from '@mui/material/TextField';
import { v4 as uuidv4 } from 'uuid';

import CheckIcon from '@mui/icons-material/Check';
import Checklist from './Checklist';

import Box from '@mui/material/Box'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CancelIcon from '@mui/icons-material/Cancel'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import AspectRatioOutlinedIcon from '@mui/icons-material/AspectRatioOutlined'
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'

import ToggleFocusInput from '~/components/Form/ToggleFocusInput'
import VisuallyHiddenInput from '~/components/Form/VisuallyHiddenInput'
import { singleFileValidator } from '~/utils/validators'
import { toast } from 'react-toastify'
import CardUserGroup from './CardUserGroup'
import CardDescriptionMdEditor from './CardDescriptionMdEditor'
import CardActivitySection from './CardActivitySection'
import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard,
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI } from '~/apis'
import { updateCardInBoard, selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice';
import { selectCurrentUser } from '~/redux/user/userSlice'
import { setCardDueDate } from '~/redux/activeCard/activeCardSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useEffect, useState } from 'react'
import { socketIoInstance } from '~/socketClient'
import CardAttachmentList from './CardAttachmentList'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: theme.palette.mode === 'dark' ? '#90caf9' : '#172b4d',
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  padding: '10px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    '&.active': {
      color: theme.palette.mode === 'dark' ? '#000000de' : '#0c66e4',
      backgroundColor: theme.palette.mode === 'dark' ? '#90caf9' : '#e9f2ff'
    }
  }
}))

/**
 * Note: Modal là một low-component mà bọn MUI sử dụng bên trong những thứ như Dialog, Drawer, Menu, Popover. Ở đây dĩ nhiên chúng ta có thể sử dụng Dialog cũng không thành vấn đề gì, nhưng sẽ sử dụng Modal để dễ linh hoạt tùy biến giao diện từ con số 0 cho phù hợp với mọi nhu cầu nhé.
 */
function ActiveCard() {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectCurrentActiveCard);
  const activeBoard = useSelector(selectCurrentActiveBoard); // <-- Lấy board
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard);
  const currentUser = useSelector(selectCurrentUser);

  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [finalDate, setFinalDate] = useState(activeCard?.dueDate ? dayjs(activeCard.dueDate) : null);
  const [error, setError] = useState('');

  const checklists = activeCard?.checklists || [];
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [openNewChecklistDialog, setOpenNewChecklistDialog] = useState(false);

  const [isItemDatePickerOpen, setIsItemDatePickerOpen] = useState(false);
  const [itemSelectedDate, setItemSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
  const [targetChecklistItem, setTargetChecklistItem] = useState(null);

  // Không dùng biến State để check đóng mở Modal nữa vì chúng ta sẽ check theo cái biến isShowModalActiveCard trong redux
  // const [isOpen, setIsOpen] = useState(true)
  // const handleOpenModal = () => setIsOpen(true)
  const handleCloseModal = () => {
    // setIsOpen(false)
    dispatch(clearAndHideCurrentActiveCard())
  }
  const onUploadCardAttachment = (event) => {
    const files = event.target?.files
    if (!files?.length) return

    let formData = new FormData()
    for (const file of files) {
      const error = singleFileValidator(file)
      if (error) {
        toast.error(error)
        return
      }
      formData.append('attachment', file)
    }

    toast.promise(
      callApiUpdateCard(formData).finally(() => event.target.value = ''),
      { pending: 'Uploading attachments...' }
    )
  }

  // Func gọi API dùng chung cho các trường hợp update card title, description, cover, comment...vv
  const callApiUpdateCard = async (updateData) => {
    if (!activeCard?._id) {
      console.error('ERROR: Missing activeCard._id. Request canceled.');
      // Hiển thị toast lỗi trên giao diện
      toast.error('Cannot update: Card ID is missing. Please refresh.', { theme: 'colored' });
      // Trả về một object rỗng để ngăn chặn lỗi tiếp theo
      return {};
    }
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    // B1: Cập nhật lại cái card đang active trong modal hiện tại
    dispatch(updateCurrentActiveCard(updatedCard))

    // B2: Cập nhật lại cái bản ghi card trong cái activeBoard (nested data)
    dispatch(updateCardInBoard(updatedCard))

    if (updatedCard?.comments?.length > 0 && updateData.commentToAdd) {
      // Lấy bản ghi comment mới nhất (giả định Back-end unshift/đẩy comment mới lên đầu)
      const newComment = updatedCard.comments[0]

      // Gửi sự kiện Socket kèm dữ liệu comment mới
      // Tên sự kiện: FE_NEW_COMMENT_IN_CARD
      socketIoInstance.emit('FE_NEW_COMMENT_IN_CARD', {
        ...newComment,
        userId: newComment.userId?.toString?.(), // 👈 ép userId về string
        cardId: activeCard._id.toString()  // Thêm cardId để các client khác biết comment thuộc card nào
      })
    }
    // ✨ Xử lý Emit cho CÁC TRƯỜNG HỢP CẬP NHẬT CHUNG (Title, Description, Cover, Member, etc.)
    else if (!updateData.commentToAdd) {
      if (!socketIoInstance) {
        console.error('SOCKET ERROR: socketIoInstance is NULL or UNDEFINED!');
        return updatedCard; // Ngăn không cho Emit và thoát
      }
      console.log('SOCKET EMITTING: FE_CARD_DETAILS_UPDATED'); // Log thành công
      socketIoInstance.emit('FE_CARD_DETAILS_UPDATED', updatedCard)
    }
    return updatedCard
  }
  useEffect(() => {
    // Đảm bảo activeCard và isShowModalActiveCard đã sẵn sàng
    if (!activeCard?._id) return

    // 1. Function xử lý khi nhận được comment real-time
    const onReceiveNewComment = (newComment) => {

      // Kiểm tra xem comment này có thuộc Card đang mở hay không
      if (isShowModalActiveCard && newComment.cardId === activeCard._id) {

        // ⚠️ Đảm bảo newComment có đầy đủ thông tin user (userAvatar, userDisplayName)
        // Nếu Back-end không tự động map, bạn cần bổ sung logic mapping user info vào đây.

        // B1: Cập nhật comment mới vào Card đang active (Redux activeCard/activeCardSlice)
        dispatch(updateCurrentActiveCard({
          // Thêm comment mới vào đầu mảng comments hiện tại (unshift)
          comments: [newComment, ...activeCard.comments]
        }))

        // B2: Cập nhật comment mới vào Card trong Board (Redux activeBoard/activeBoardSlice)
        // Tùy thuộc vào slice của bạn, có thể cần dispatch thêm hành động này
        dispatch(updateCardInBoard({
          ...activeCard,
          comments: [newComment, ...activeCard.comments]
        }))
      }
    }
    const onReceiveCardUpdate = (incomingCard) => {
      // ✨ THÊM LOG NÀY
      console.log('CLIENT RECEIVED BE_CARD_DETAILS_UPDATED. Incoming ID:', incomingCard._id);
      console.log('LISTENER FIRED! Incoming Title:', incomingCard.title);

      if (incomingCard._id === activeCard._id) {
        console.log('CLIENT UPDATING MODAL/BOARD:', incomingCard.title); // Log thành công
        dispatch(updateCurrentActiveCard(incomingCard))
        dispatch(updateCardInBoard(incomingCard))
      } else {
        console.warn('Received update for different card:', incomingCard._id);
      }
    }

    // 2. Lắng nghe sự kiện real-time từ server gửi về
    // Tên sự kiện: BE_NEW_COMMENT_IN_CARD
    socketIoInstance.on('BE_NEW_COMMENT_IN_CARD', onReceiveNewComment)
    socketIoInstance.on('BE_CARD_DETAILS_UPDATED', onReceiveCardUpdate)

    // 3. Clean Up event để tránh lỗi
    return () => {
      socketIoInstance.off('BE_NEW_COMMENT_IN_CARD', onReceiveNewComment)
      socketIoInstance.off('BE_CARD_DETAILS_UPDATED', onReceiveCardUpdate)
    }
  }, [dispatch, activeCard, isShowModalActiveCard, activeCard?._id])

  const onUpdateCardTitle = (newTitle) => {
    callApiUpdateCard({ title: newTitle.trim() })
  }

  const onUpdateCardDescription = (newDescription) => {
    callApiUpdateCard({ description: newDescription })
  }

  const onUploadCardCover = (event) => {
    // console.log(event.target?.files[0])
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    // Gọi API...
    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

  // Dùng async await ở đây để component con CardActivitySection chờ và nếu thành công thì mới clear thẻ input comment
  const onAddCardComment = async (commentToAdd) => {
    await callApiUpdateCard({ commentToAdd })
  }

  const onUpdateCardMembers = (incomingMemberInfo) => {
    callApiUpdateCard({ incomingMemberInfo })
  }

  const handleOpenAssignMenu = (anchorEl, item, checklistId) => {
    setTargetChecklistItem({ anchorEl, itemId: item._id, checklistId, currentItem: item });
    setIsAssignMenuOpen(true);
  };

  const handleOpenDatePicker = (item, checklistId) => {
    setTargetChecklistItem({ itemId: item._id, checklistId, currentItem: item });
    setItemSelectedDate(item.dueDate ? dayjs(item.dueDate) : dayjs().add(1, 'hour'));
    setIsItemDatePickerOpen(true);
  };

  // --- HÀM MỚI: Đóng Dialog/Menu ---
  const handleCloseAssignMenu = () => {
    setIsAssignMenuOpen(false);
    setTargetChecklistItem(null);
  };

  const handleCloseDatePicker = () => {
    setIsItemDatePickerOpen(false);
    setTargetChecklistItem(null);
  };

  // --- HÀM MỚI: Xử lý Logic API (Khi xác nhận) ---
  const handleSetItemDueDate = async () => {
    if (!targetChecklistItem) return;

    const { checklistId, itemId } = targetChecklistItem;
    const newDueDate = itemSelectedDate.toDate();

    const newChecklistsArray = checklists.map(c => {
      if (c._id === checklistId) {
        const newItems = c.items.map(i => {
          if (i._id === itemId) {
            return { ...i, dueDate: newDueDate };
          }
          return i;
        });
        return { ...c, items: newItems };
      }
      return c;
    });

    await callApiUpdateCard({ checklists: newChecklistsArray });
    handleCloseDatePicker();
  };

  const handleToggleAssignMember = async (memberId) => {
    if (!targetChecklistItem) return;

    const { checklistId, itemId, currentItem } = targetChecklistItem;
    const currentAssignedIds = currentItem.assignedMemberIds || [];

    const isAssigned = currentAssignedIds.includes(memberId);
    const newAssignedIds = isAssigned
      ? currentAssignedIds.filter(id => id !== memberId)
      : [...currentAssignedIds, memberId];

    const newChecklistsArray = checklists.map(c => {
      if (c._id === checklistId) {
        const newItems = c.items.map(i => {
          if (i._id === itemId) {
            return { ...i, assignedMemberIds: newAssignedIds };
          }
          return i;
        });
        return { ...c, items: newItems };
      }
      return c;
    });

    await callApiUpdateCard({ checklists: newChecklistsArray });

    // Cập nhật state local để menu re-render dấu check
    setTargetChecklistItem({
      ...targetChecklistItem,
      currentItem: { ...currentItem, assignedMemberIds: newAssignedIds }
    });
  };

  // --- Lấy danh sách member của CARD ---
  // const cardMembers = (activeBoard?.members || []).filter(m =>
  //   (activeCard?.memberIds || []).includes(m._id)
  // );
  const allUsersOnBoard = activeBoard?.FE_allUsers || []; // <-- Lấy nguồn đúng

  // Lọc từ nguồn đúng
  const cardMembers = allUsersOnBoard.filter(m =>
    (activeCard?.memberIds || []).includes(m._id)
  );

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal} // Sử dụng onClose trong trường hợp muốn đóng Modal bằng nút ESC hoặc click ra ngoài Modal
      sx={{ overflowY: 'auto' }}>
      <Box sx={{
        position: 'relative',
        width: 900,
        maxWidth: 900,
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '8px',
        border: 'none',
        outline: 0,
        padding: '40px 20px 20px',
        margin: '50px auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#fff'
      }}>
        <Box sx={{
          position: 'absolute',
          top: '12px',
          right: '10px',
          cursor: 'pointer'
        }}>
          <CancelIcon color="error" sx={{ '&:hover': { color: 'error.light' } }} onClick={handleCloseModal} />
        </Box>

        {activeCard?.cover &&
          <Box sx={{ mb: 4 }}>
            <img
              style={{ width: '100%', height: '320px', borderRadius: '6px', objectFit: 'cover' }}
              src={activeCard?.cover}
              alt="card-cover"
            />
          </Box>
        }

        <Box sx={{ mb: 1, mt: -3, pr: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CreditCardIcon />

          {/* Feature 01: Xử lý tiêu đề của Card */}
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Left side */}
          <Grid xs={12} sm={9}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>

              {/* Feature 02: Xử lý các thành viên của Card */}
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

            {/* Hộp thoại chọn ngày giờ */}
            <Dialog open={openDateDialog} onClose={() => setOpenDateDialog(false)}>
              <DialogTitle>Chọn ngày & giờ hết hạn</DialogTitle>
              <DialogContent sx={{ mt: 1, pt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    ampm={false}
                    disablePast
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Thời hạn phải lớn hơn hiện tại ít nhất 1 tiếng',
                      },
                    }}
                  />
                </LocalizationProvider>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDateDialog(false)}>Hủy</Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const now = dayjs()
                    if (selectedDate.isBefore(now.add(1, 'hour'))) {
                      setError('Vui lòng chọn thời gian lớn hơn hiện tại ít nhất 1 tiếng!')
                      return
                    }

                    setFinalDate(selectedDate)
                    setOpenDateDialog(false)

                    // Gọi API cập nhật backend
                    if (activeCard?._id) {
                      try {
                        await updateCardDetailsAPI(activeCard._id, { dueDate: selectedDate.toDate() })
                        // Cập nhật redux
                        dispatch(updateCurrentActiveCard({
                          ...activeCard,
                          dueDate: selectedDate.toDate()
                        }))
                        dispatch(updateCardInBoard({
                          ...activeCard,
                          dueDate: selectedDate.toDate()
                        }))
                      } catch (err) {
                        console.error('Update dueDate failed:', err)
                        setError('Cập nhật thời hạn thất bại!')
                      }
                    }
                  }}
                >
                  Xác nhận
                </Button>

              </DialogActions>
            </Dialog>

            {/* Hộp thoại thêm checklist */}
            <Dialog open={openNewChecklistDialog} onClose={() => setOpenNewChecklistDialog(false)}>
              <DialogTitle>Thêm Checklist</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  fullWidth
                  label="Tên checklist"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenNewChecklistDialog(false)}>Hủy</Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    if (!newChecklistTitle.trim()) return;
                    const newChecklist = {
                      _id: uuidv4(),
                      title: newChecklistTitle.trim(),
                      progress: 0,
                      items: []
                    };

                    const updatedCard = await callApiUpdateCard({
                      checklists: [...checklists, newChecklist]
                    });

                    dispatch(updateCurrentActiveCard(updatedCard));
                    setNewChecklistTitle('');
                    setOpenNewChecklistDialog(false);
                  }}
                >
                  OK
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar báo lỗi */}
            <Snackbar
              open={!!error}
              autoHideDuration={3000}
              onClose={() => setError('')}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </Snackbar>

            {finalDate && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Thời hạn
                </Typography>
                <Chip
                  icon={<WatchLaterOutlinedIcon />}
                  label={dayjs(finalDate).format('HH:mm DD/MM/YYYY')}
                  sx={{
                    bgcolor:
                      dayjs(finalDate).isBefore(dayjs()) ? '#ffdddd'
                        : dayjs(finalDate).diff(dayjs(), 'hour') < 24 ? '#fff0d6'
                          : '#e5f7e5',
                    color:
                      dayjs(finalDate).isBefore(dayjs()) ? '#c62828'
                        : dayjs(finalDate).diff(dayjs(), 'hour') < 24 ? '#ef6c00'
                          : '#2e7d32',
                    fontWeight: 500,
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  (Còn {dayjs(finalDate).fromNow(true)})
                </Typography>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SubjectRoundedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Description</Typography>
              </Box>

              {/* Feature 03: Xử lý mô tả của Card */}
              <CardDescriptionMdEditor
                cardDescriptionProp={activeCard?.description}
                handleUpdateCardDescription={onUpdateCardDescription}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <CardAttachmentList
                cardId={activeCard?._id}
                attachments={activeCard?.attachments}
              />
            </Box>

            {checklists.map((checklist) => (
              <Checklist
                key={checklist._id}
                checklist={checklist}
                callApiUpdateCard={callApiUpdateCard}
                currentChecklists={checklists}

                // Truyền props mới xuống
                onOpenAssignMenu={handleOpenAssignMenu}
                onOpenDatePicker={handleOpenDatePicker}
                cardMembers={cardMembers}
              />
            ))}

            {/* Activity */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              {/* Feature 04: Xử lý các hành động, ví dụ comment vào Card */}
              <CardActivitySection
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          {/* Right side */}
          <Grid xs={12} sm={3}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
            <Stack direction="column" spacing={1}>
              {/* Feature 05: Xử lý hành động bản thân user tự join vào card */}
              {/* Nếu user hiện tại đang đăng nhập chưa thuộc mảng memberIds của card thì mới cho hiện nút Join và ngược lại */}
              {activeCard?.memberIds?.includes(currentUser._id)
                ? <SidebarItem
                  sx={{ color: 'error.light', '&:hover': { color: 'error.light' } }}
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.REMOVE
                  })}
                >
                  <ExitToAppIcon fontSize="small" />
                  Leave
                </SidebarItem>
                : <SidebarItem
                  className="active"
                  onClick={() => onUpdateCardMembers({
                    userId: currentUser._id,
                    action: CARD_MEMBER_ACTIONS.ADD
                  })}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PersonOutlineOutlinedIcon fontSize="small" />
                      <span>Join</span>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                    </Box>
                  </Box>
                </SidebarItem>
              }

              {/* Feature 06: Xử lý hành động cập nhật ảnh Cover của Card */}
              <SidebarItem className="active" component="label">
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageOutlinedIcon fontSize="small" />
                    <span>Cover</span>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#27ae60' }} />
                  </Box>
                </Box>
                <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
              </SidebarItem>

              <SidebarItem className="active" component="label">
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AttachFileOutlinedIcon fontSize="small" />
                    <span>Attachment</span>
                  </Box>
                </Box>
                <VisuallyHiddenInput type="file" multiple onChange={onUploadCardAttachment} />
              </SidebarItem>

              <SidebarItem><LocalOfferOutlinedIcon fontSize="small" />Labels</SidebarItem>
              <SidebarItem onClick={() => setOpenNewChecklistDialog(true)}>
                <TaskAltOutlinedIcon fontSize="small" />Checklist
              </SidebarItem>

              <SidebarItem onClick={() => setOpenDateDialog(true)} sx={{ cursor: 'pointer' }}>
                <WatchLaterOutlinedIcon fontSize="small" />
                <span>Dates</span>
              </SidebarItem>
              <SidebarItem><AutoFixHighOutlinedIcon fontSize="small" />Custom Fields</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Power-Ups</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><AspectRatioOutlinedIcon fontSize="small" />Card Size</SidebarItem>
              <SidebarItem><AddToDriveOutlinedIcon fontSize="small" />Google Drive</SidebarItem>
              <SidebarItem><AddOutlinedIcon fontSize="small" />Add Power-Ups</SidebarItem>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Actions</Typography>
            <Stack direction="column" spacing={1}>
              <SidebarItem><ArrowForwardOutlinedIcon fontSize="small" />Move</SidebarItem>
              <SidebarItem><ContentCopyOutlinedIcon fontSize="small" />Copy</SidebarItem>
              <SidebarItem><AutoAwesomeOutlinedIcon fontSize="small" />Make Template</SidebarItem>
              <SidebarItem><ArchiveOutlinedIcon fontSize="small" />Archive</SidebarItem>
              <SidebarItem><ShareOutlinedIcon fontSize="small" />Share</SidebarItem>
            </Stack>
          </Grid>
        </Grid>

        <Dialog open={isItemDatePickerOpen} onClose={handleCloseDatePicker}>
          <DialogTitle>Chọn ngày & giờ hết hạn (Item)</DialogTitle>
          <DialogContent sx={{ mt: 1, pt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={itemSelectedDate}
                onChange={(newValue) => setItemSelectedDate(newValue)}
                ampm={false}
                disablePast
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDatePicker}>Hủy</Button>
            <Button variant="contained" onClick={handleSetItemDueDate}>
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>

        {/* Menu gán member cho ITEM */}
        <Menu
          open={isAssignMenuOpen}
          anchorEl={targetChecklistItem?.anchorEl}
          onClose={handleCloseAssignMenu}
        >
          <Typography sx={{ fontWeight: 600, px: 2, pb: 1 }}>Gán thành viên</Typography>
          {cardMembers.length === 0 && (
            <MenuItem disabled>Không có thành viên nào trong card này</MenuItem>
          )}
          {cardMembers.map(member => {
            const isAssigned = targetChecklistItem?.currentItem?.assignedMemberIds.includes(member._id);
            return (
              <MenuItem key={member._id} onClick={() => handleToggleAssignMember(member._id)}>
                <ListItemIcon>
                  <Avatar sx={{ width: 28, height: 28 }} src={member.avatar} />
                </ListItemIcon>
                <ListItemText>{member.displayName}</ListItemText>
                {isAssigned && (
                  <ListItemIcon sx={{ justifyContent: 'flex-end' }}>
                    <CheckIcon fontSize="small" />
                  </ListItemIcon>
                )}
              </MenuItem>
            );
          })}
        </Menu>
      </Box>
    </Modal>
  )
}

export default ActiveCard