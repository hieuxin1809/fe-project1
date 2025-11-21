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

import CardCommentAndActivity from './CardCommentAndActivity'
import LabelPopover from './LabelPopover'

import { useDispatch, useSelector } from 'react-redux'
import {
  clearAndHideCurrentActiveCard,
  selectCurrentActiveCard,
  updateCurrentActiveCard,
  selectIsShowModalActiveCard,
} from '~/redux/activeCard/activeCardSlice'
import { updateCardDetailsAPI, createNewLabelAPI, updateLabelAPI, deleteLabelAPI } from '~/apis' // ✨ Import API Label
import { updateCardInBoard, selectCurrentActiveBoard, addLabelToBoard, updateLabelInBoard, deleteLabelFromBoard } from '~/redux/activeBoard/activeBoardSlice'; // ✨ Import Actions Label
import { selectCurrentUser } from '~/redux/user/userSlice'
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

function ActiveCard() {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectCurrentActiveCard);
  const activeBoard = useSelector(selectCurrentActiveBoard);
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard);
  const currentUser = useSelector(selectCurrentUser);

  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [finalDate, setFinalDate] = useState(null);
  const [error, setError] = useState('');

  const checklists = activeCard?.checklists || [];
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [openNewChecklistDialog, setOpenNewChecklistDialog] = useState(false);

  const [isItemDatePickerOpen, setIsItemDatePickerOpen] = useState(false);
  const [itemSelectedDate, setItemSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
  const [targetChecklistItem, setTargetChecklistItem] = useState(null);

  // State cho Label Popover
  const [anchorLabelEl, setAnchorLabelEl] = useState(null)

  // Lấy danh sách Labels từ ActiveBoard
  const boardLabels = activeBoard?.labels || []

  // --- HANDLERS CHO LABELS ---

  // 1. Update labels của Card (Khi check/uncheck)
  const handleUpdateCardLabels = (newLabelIds) => {
    callApiUpdateCard({ labelIds: newLabelIds })
  }

  // 2. Tạo Label mới
  const handleCreateLabel = async (labelData) => {
    try {

      console.log('Check boardId:', activeBoard?._id)

      if (!activeBoard?._id) {
        toast.error('Lỗi: Không tìm thấy Board ID!')
        return
      }

      const newLabel = await createNewLabelAPI({
        ...labelData,
        boardId: activeBoard._id
      })
      dispatch(addLabelToBoard(newLabel))
    } catch (error) {
      console.error(error)
      toast.error('Create label failed!')
    }
  }

  // 3. Update Label (Sửa tên/màu)
  const handleUpdateLabel = async (labelId, labelData) => {
    try {
      const updatedLabel = await updateLabelAPI(labelId, labelData)
      dispatch(updateLabelInBoard(updatedLabel))
    } catch (error) { toast.error('Update label failed!') }
  }

  // 4. Xóa Label
  const handleDeleteLabel = async (labelId) => {
    try {
      await deleteLabelAPI(labelId)
      dispatch(deleteLabelFromBoard(labelId))
      if (activeCard?.labelIds?.includes(labelId)) {
        const newLabelIds = activeCard.labelIds.filter(id => id !== labelId)
        callApiUpdateCard({ labelIds: newLabelIds })
      }
    } catch (error) { toast.error('Delete label failed!') }
  }

  const handleCloseModal = () => {
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

  // Func gọi API dùng chung
  const callApiUpdateCard = async (updateData) => {
    if (!activeCard?._id) {
      console.error('ERROR: Missing activeCard._id. Request canceled.');
      toast.error('Cannot update: Card ID is missing. Please refresh.', { theme: 'colored' });
      return {};
    }
    const updatedCard = await updateCardDetailsAPI(activeCard._id, updateData)

    dispatch(updateCurrentActiveCard(updatedCard))
    dispatch(updateCardInBoard(updatedCard))

    if (updatedCard?.comments?.length > 0 && updateData.commentToAdd) {
      const newComment = updatedCard.comments[0]
      socketIoInstance.emit('FE_NEW_COMMENT_IN_CARD', {
        ...newComment,
        userId: newComment.userId?.toString?.(),
        cardId: activeCard._id.toString()
      })
    }
    else if (!updateData.commentToAdd) {
      if (!socketIoInstance) {
        console.error('SOCKET ERROR: socketIoInstance is NULL or UNDEFINED!');
        return updatedCard;
      }
      socketIoInstance.emit('FE_CARD_DETAILS_UPDATED', updatedCard)
    }
    return updatedCard
  }

  useEffect(() => {
    if (activeCard?.dueDate) {
      setFinalDate(dayjs(activeCard.dueDate));
    } else {
      setFinalDate(null);
    }
  }, [activeCard?.dueDate]);

  useEffect(() => {
    if (!activeCard?._id) return

    const onReceiveNewComment = (newComment) => {
      if (isShowModalActiveCard && newComment.cardId === activeCard._id) {
        dispatch(updateCurrentActiveCard({
          comments: [newComment, ...activeCard.comments]
        }))
        dispatch(updateCardInBoard({
          ...activeCard,
          comments: [newComment, ...activeCard.comments]
        }))
      }
    }

    const onReceiveCardUpdate = (incomingCard) => {
      if (incomingCard._id === activeCard._id) {
        dispatch(updateCurrentActiveCard(incomingCard))
        dispatch(updateCardInBoard(incomingCard))
      }
    }

    socketIoInstance.on('BE_NEW_COMMENT_IN_CARD', onReceiveNewComment)
    socketIoInstance.on('BE_CARD_DETAILS_UPDATED', onReceiveCardUpdate)

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
    const error = singleFileValidator(event.target?.files[0])
    if (error) {
      toast.error(error)
      return
    }
    let reqData = new FormData()
    reqData.append('cardCover', event.target?.files[0])

    toast.promise(
      callApiUpdateCard(reqData).finally(() => event.target.value = ''),
      { pending: 'Updating...' }
    )
  }

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

  const handleCloseAssignMenu = () => {
    setIsAssignMenuOpen(false);
    setTargetChecklistItem(null);
  };

  const handleCloseDatePicker = () => {
    setIsItemDatePickerOpen(false);
    setTargetChecklistItem(null);
  };

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

    setTargetChecklistItem({
      ...targetChecklistItem,
      currentItem: { ...currentItem, assignedMemberIds: newAssignedIds }
    });
  };

  const allUsersOnBoard = activeBoard?.FE_allUsers || [];
  const cardMembers = allUsersOnBoard.filter(m =>
    (activeCard?.memberIds || []).includes(m._id)
  );

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
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
          <ToggleFocusInput
            inputFontSize='22px'
            value={activeCard?.title}
            onChangedValue={onUpdateCardTitle} />
        </Box>

        {/* ✨ FEATURE: HIỂN THỊ LABELS TRÊN CARD (Dưới Title) */}
        {activeCard?.labelIds?.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {activeCard?.labelIds?.map(labelId => {
              const label = boardLabels.find(l => l._id === labelId)
              if (!label) return null
              return (
                <Box
                  key={label._id}
                  sx={{
                    bgcolor: label.color,
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    // ✨ CSS CĂN GIỮA TEXT CHUẨN:
                    px: 1.5, // Padding ngang
                    height: '32px', // Chiều cao cố định
                    lineHeight: '32px', // Line height bằng height để text căn giữa (fallback)
                    display: 'flex',
                    alignItems: 'center', // Căn giữa dọc Flexbox
                    justifyContent: 'center', // Căn giữa ngang

                    '&:hover': { opacity: 0.8 },
                    minWidth: '40px',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={(e) => setAnchorLabelEl(e.currentTarget)}
                >
                  {label.title}
                </Box>
              )
            })}

            {/* Nút (+) */}
            <Box
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
                borderRadius: '4px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : '#091e4214' }
              }}
              onClick={(e) => setAnchorLabelEl(e.currentTarget)}
            >
              <AddOutlinedIcon fontSize="small" />
            </Box>
          </Box>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid xs={12} sm={9}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Members</Typography>
              <CardUserGroup
                cardMemberIds={activeCard?.memberIds}
                onUpdateCardMembers={onUpdateCardMembers}
              />
            </Box>

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
                    // Gọi hàm chung -> Cập nhật Redux & Socket & Log
                    const updatedCard = await callApiUpdateCard({ dueDate: selectedDate.toDate() })
                    if (updatedCard) {
                      setFinalDate(selectedDate)
                      setOpenDateDialog(false)
                    } else {
                      setError('Cập nhật thời hạn thất bại!')
                    }
                  }}
                >
                  Xác nhận
                </Button>
              </DialogActions>
            </Dialog>

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
                onOpenAssignMenu={handleOpenAssignMenu}
                onOpenDatePicker={handleOpenDatePicker}
                cardMembers={cardMembers}
              />
            ))}

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DvrOutlinedIcon />
                <Typography variant="span" sx={{ fontWeight: '600', fontSize: '20px' }}>Activity</Typography>
              </Box>

              <CardCommentAndActivity
                cardComments={activeCard?.comments}
                onAddCardComment={onAddCardComment}
              />
            </Box>
          </Grid>

          {/* Right side */}
          <Grid xs={12} sm={3}>
            <Typography sx={{ fontWeight: '600', color: 'primary.main', mb: 1 }}>Add To Card</Typography>
            <Stack direction="column" spacing={1}>
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

              {/* ✨ SIDEBAR ITEM CHO LABELS (Đã gắn sự kiện onClick) */}
              <SidebarItem onClick={(e) => setAnchorLabelEl(e.currentTarget)}>
                <LocalOfferOutlinedIcon fontSize="small" />Labels
              </SidebarItem>

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

        {/* ✨ RENDER COMPONENT LABEL POPOVER */}
        <LabelPopover
          anchorEl={anchorLabelEl}
          onClose={() => setAnchorLabelEl(null)}
          activeCard={activeCard}
          boardLabels={boardLabels}
          onUpdateCardLabels={handleUpdateCardLabels}
          onCreateLabel={handleCreateLabel}
          onUpdateLabel={handleUpdateLabel}
          onDeleteLabel={handleDeleteLabel}
        />

      </Box>
    </Modal>
  )
}

export default ActiveCard