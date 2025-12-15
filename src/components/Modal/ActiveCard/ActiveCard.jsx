import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { MultiSectionDigitalClock } from '@mui/x-date-pickers/MultiSectionDigitalClock';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert, Chip, Menu, MenuItem, ListItemIcon, Avatar, ListItemText, IconButton, Divider, Popover } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DateField } from '@mui/x-date-pickers/DateField';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import { FormControlLabel, Checkbox } from '@mui/material'

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
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined'
import SubjectRoundedIcon from '@mui/icons-material/SubjectRounded'
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined'
import CloseIcon from '@mui/icons-material/Close';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
import { updateCardDetailsAPI, createNewLabelAPI, updateLabelAPI, deleteLabelAPI } from '~/apis'
import { updateCardInBoard, selectCurrentActiveBoard, addLabelToBoard, updateLabelInBoard, deleteLabelFromBoard } from '~/redux/activeBoard/activeBoardSlice';
import { selectCurrentUser } from '~/redux/user/userSlice'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
import { useEffect, useState, useRef } from 'react'
import { socketIoInstance } from '~/socketClient'
import CardAttachmentList from './CardAttachmentList'

import { styled } from '@mui/material/styles'

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
  textTransform: 'none',
  fontSize: '13px',
  fontWeight: '600',
  padding: '6px 12px',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300],
    color: theme.palette.primary.main
  }
}));

function DayWithRange(props) {
  // 🔥 Destructure các props tùy chỉnh ra khỏi biến 'other'
  // để tránh truyền nhầm xuống DOM element gây warning
  const {
    day,
    selectedDay,
    hoveredDay,
    startDate,
    dueDate,
    isStartDateEnabled,
    isDueDateEnabled,
    ...other
  } = props;

  // Kiểm tra logic hiển thị
  const isSelected = day.isSame(dueDate, 'day');
  const isStart = isStartDateEnabled && startDate && day.isSame(startDate, 'day');
  const isEnd = isDueDateEnabled && dueDate && day.isSame(dueDate, 'day');

  // Kiểm tra ngày có nằm trong khoảng không
  const isBetween = isStartDateEnabled && isDueDateEnabled && startDate && dueDate &&
    day.isAfter(startDate, 'day') && day.isBefore(dueDate, 'day');

  const dayStyle = {
    margin: 0,
    width: 36,
    height: 36,
    borderRadius: '50%',
    ...(isBetween && {
      borderRadius: 0,
      backgroundColor: (theme) => theme.palette.primary.light + '33',
      color: (theme) => theme.palette.mode === 'dark' ? 'white' : 'black',
      '&:hover': { backgroundColor: (theme) => theme.palette.primary.light + '55' }
    }),
    ...(isStart && isDueDateEnabled && {
      borderRadius: '50% 0 0 50%',
      backgroundColor: (theme) => theme.palette.primary.main,
      color: 'white',
      '&:hover': { backgroundColor: (theme) => theme.palette.primary.dark }
    }),
    ...(isEnd && isStartDateEnabled && {
      borderRadius: '0 50% 50% 0',
      backgroundColor: (theme) => theme.palette.primary.main,
      color: 'white',
      '&:hover': { backgroundColor: (theme) => theme.palette.primary.dark }
    }),
    ...((isStart && !isDueDateEnabled || isEnd && !isStartDateEnabled) && {
      borderRadius: '50%',
      backgroundColor: (theme) => theme.palette.primary.main,
      color: 'white'
    })
  };

  return (
    <PickersDay {...other} day={day} sx={dayStyle} selected={false} />
  );
}

function ActiveCard() {
  const dispatch = useDispatch();
  const activeCard = useSelector(selectCurrentActiveCard);
  const activeBoard = useSelector(selectCurrentActiveBoard);
  const isShowModalActiveCard = useSelector(selectIsShowModalActiveCard);
  const currentUser = useSelector(selectCurrentUser);

  // --- State cho Date ---
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [finalDate, setFinalDate] = useState(null);
  const [anchorElDate, setAnchorElDate] = useState(null);

  // State tạm thời trong Popover (chưa lưu vào DB)
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempDueDate, setTempDueDate] = useState(null);
  const [enableStart, setEnableStart] = useState(false);
  const [enableDue, setEnableDue] = useState(true);

  // --- State cho Checklist ---
  const checklists = activeCard?.checklists || [];
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [anchorElChecklist, setAnchorElChecklist] = useState(null);

  // --- State khác ---
  const [error, setError] = useState('');
  const [isItemDatePickerOpen, setIsItemDatePickerOpen] = useState(false);
  const [itemSelectedDate, setItemSelectedDate] = useState(dayjs().add(1, 'hour'));
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);
  const [targetChecklistItem, setTargetChecklistItem] = useState(null);

  // State cho Label Popover
  const [anchorLabelEl, setAnchorLabelEl] = useState(null)

  // --- State cho Sticky Header & Add Menu ---
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [anchorElAddMenu, setAnchorElAddMenu] = useState(null);
  const leftColumnRef = useRef(null);

  const boardLabels = activeBoard?.labels || []

  // --- HANDLERS ---


  // Khi mở Popover, load dữ liệu từ activeCard vào state tạm
  useEffect(() => {
    if (Boolean(anchorElDate)) {
      setTempStartDate(activeCard?.startDate ? dayjs(activeCard.startDate) : null);
      setTempDueDate(activeCard?.dueDate ? dayjs(activeCard.dueDate) : dayjs().add(1, 'day').hour(17).minute(0)); // Default mai 17h

      setEnableStart(!!activeCard?.startDate);
      setEnableDue(!!activeCard?.dueDate);
    }
  }, [anchorElDate, activeCard]);

  // --- HANDLERS DATE ---

  // Khi chọn ngày trên lịch (Ưu tiên update Due Date, nếu disable Due thì update Start)
  const handleCalendarChange = (newDate) => {
    if (enableDue) {
      // Giữ nguyên giờ phút của Due Date cũ, chỉ đổi ngày
      const currentDue = tempDueDate || dayjs().hour(17).minute(0);
      const updated = currentDue.set('year', newDate.year())
        .set('month', newDate.month())
        .set('date', newDate.date());
      setTempDueDate(updated);
      // Logic tự động đẩy start date nếu start > end (Optional)
      if (enableStart && tempStartDate && tempStartDate.isAfter(updated, 'day')) {
        setTempStartDate(updated.subtract(1, 'day'));
      }
    } else if (enableStart) {
      setTempStartDate(newDate);
    }
  };

  const handleSaveDate = async () => {
    // Validate
    if (enableStart && enableDue && tempStartDate && tempDueDate && tempStartDate.isAfter(tempDueDate)) {
      toast.error('Ngày bắt đầu không thể lớn hơn ngày kết thúc!');
      return;
    }

    const dataUpdate = {
      startDate: enableStart && tempStartDate ? tempStartDate.toDate() : null,
      dueDate: enableDue && tempDueDate ? tempDueDate.toDate() : null
    };

    const updatedCard = await callApiUpdateCard(dataUpdate);
    if (updatedCard) setAnchorElDate(null);
  };

  const handleRemoveDate = async () => {
    const updatedCard = await callApiUpdateCard({ startDate: null, dueDate: null });
    if (updatedCard) setAnchorElDate(null);
  };

  const handleUpdateCardLabels = (newLabelIds) => {
    callApiUpdateCard({ labelIds: newLabelIds })
  }

  const handleCreateLabel = async (labelData) => {
    try {
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

  const handleUpdateLabel = async (labelId, labelData) => {
    try {
      const updatedLabel = await updateLabelAPI(labelId, labelData)
      dispatch(updateLabelInBoard(updatedLabel))
    } catch (error) { toast.error('Update label failed!') }
  }

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
      // const error = singleFileValidator(file)
      const LIMIT_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > LIMIT_SIZE) {
        toast.error(`File "${file.name}" quá lớn! Vui lòng chọn file dưới 10MB.`)
        return
      }
      // if (error) {
      //   toast.error(error)
      //   return
      // }
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
      socketIoInstance.emit('FE_CARD_DETAILS_UPDATED', updatedCard)
    }
    return updatedCard
  }

  useEffect(() => {
    if (activeCard?.dueDate) {
      setFinalDate(dayjs(activeCard.dueDate));
      setSelectedDate(dayjs(activeCard.dueDate));
    } else {
      setFinalDate(null);
      setSelectedDate(dayjs().add(1, 'hour'));
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

    const updateData = {
        checklists: newChecklistsArray,
        // Nếu là thêm mới, gửi mảng chứa 1 ID đó
        ...(!isAssigned && { addedChecklistMemberIds: [memberId] }) 
    }

    await callApiUpdateCard(updateData);

    setTargetChecklistItem({
      ...targetChecklistItem,
      currentItem: { ...currentItem, assignedMemberIds: newAssignedIds }
    });
  };

  // --- Scroll Event Handler ---
  const handleLeftColumnScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    if (scrollTop > 60) {
      setShowStickyHeader(true);
    } else {
      setShowStickyHeader(false);
    }
  };

  // --- HANDLER ADD CHECKLIST ---
  const handleAddChecklist = async () => {
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
    setAnchorElChecklist(null);
  }

  // --- HANDLER UPDATE DUE DATE ---
  const handleSaveDueDate = async () => {
    const now = dayjs()
    if (selectedDate.isBefore(now.add(1, 'hour'))) {
      setError('Vui lòng chọn thời gian lớn hơn hiện tại ít nhất 1 tiếng!')
      return
    }
    const updatedCard = await callApiUpdateCard({ dueDate: selectedDate.toDate() })
    if (updatedCard) {
      setFinalDate(selectedDate)
      setAnchorElDate(null);
    } else {
      setError('Cập nhật thời hạn thất bại!')
    }
  }


  const allUsersOnBoard = activeBoard?.FE_allUsers || [];
  const cardMembers = allUsersOnBoard.filter(m =>
    (activeCard?.memberIds || []).includes(m._id)
  );

  const currentColumn = activeBoard?.columns?.find(c => c._id === activeCard?.columnId)

  return (
    <Modal
      disableScrollLock
      open={isShowModalActiveCard}
      onClose={handleCloseModal}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      <Box sx={{
        position: 'relative',
        width: 1000,
        maxWidth: '95vw',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        boxShadow: 24,
        borderRadius: '12px',
        border: 'none',
        outline: 0,
        paddingBottom: '0px',
        overflow: 'hidden',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#f4f5f7'
      }}>

        {/* === PHẦN 1: COVER IMAGE & HEADER CONTROLS === */}
        <Box sx={{
          position: 'relative',
          width: '100%',
          height: activeCard?.cover ? '160px' : '80px',
          flexShrink: 0,
          backgroundColor: activeCard?.cover ? 'transparent' : '#76818f',
          backgroundImage: activeCard?.cover ? `url(${activeCard.cover})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <Chip
              label={currentColumn ? currentColumn.title : 'Unknown Column'}
              sx={{
                bgcolor: 'rgba(0,0,0,0.7)', color: 'white', fontWeight: 'bold', backdropFilter: 'blur(4px)'
              }}
            />
          </Box>

          <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
            <Button
              component="label"
              variant="contained"
              size="small"
              startIcon={<ImageOutlinedIcon />}
              sx={{
                bgcolor: 'rgba(0,0,0,0.7)', color: 'white', boxShadow: 'none',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
              }}
            >
              Cover
              <VisuallyHiddenInput type="file" onChange={onUploadCardCover} />
            </Button>

            <Box
              onClick={handleCloseModal}
              sx={{
                cursor: 'pointer',
                bgcolor: 'rgba(0, 0, 0, 0.7)', color: 'white', borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
              }}>
              <CloseIcon fontSize="small" />
            </Box>
          </Box>
        </Box>

        {/* === PHẦN BODY: CHỨA GRID 8:4 === */}
        <Box sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex'
        }}>
          <Grid container sx={{ height: '100%', width: '100%', m: 0 }}>

            {/* === CỘT TRÁI (7 phần) === */}
            <Grid xs={12} md={7}
              ref={leftColumnRef}
              onScroll={handleLeftColumnScroll}
              sx={{
                height: '100%',
                overflowY: 'auto',
                position: 'relative',
                pt: 3, pl: 3, pr: 2, pb: 3,
                borderRight: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#e0e0e0',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da', borderRadius: '8px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
              }}>

              {/* === STICKY HEADER === */}
              {showStickyHeader && (
                <Box sx={{
                  position: 'sticky',
                  top: -24,
                  zIndex: 100,
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1A2027' : '#f4f5f7',
                  borderBottom: '1px solid',
                  borderColor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#e0e0e0',
                  padding: '10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 2,
                  marginX: -3,
                  paddingX: 3
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                    {activeCard?.title}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    onClick={(e) => setAnchorElAddMenu(e.currentTarget)}
                  >
                    Add
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CreditCardIcon sx={{ color: 'text.secondary' }} />
                <Box sx={{ width: '100%' }}>
                  <ToggleFocusInput
                    inputFontSize='22px'
                    value={activeCard?.title}
                    onChangedValue={onUpdateCardTitle}
                  />
                </Box>
              </Box>

              {/* Action Buttons (Normal View) */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <ActionButton startIcon={<LocalOfferOutlinedIcon />} onClick={(e) => setAnchorLabelEl(e.currentTarget)}>Labels</ActionButton>
                  <ActionButton startIcon={<TaskAltOutlinedIcon />} onClick={(e) => setAnchorElChecklist(e.currentTarget)}>Checklist</ActionButton>
                  <ActionButton startIcon={<WatchLaterOutlinedIcon />} onClick={(e) => setAnchorElDate(e.currentTarget)}>Dates</ActionButton>
                  <ActionButton component="label" startIcon={<AttachFileOutlinedIcon />}>
                    Attach
                    <VisuallyHiddenInput type="file" multiple onChange={onUploadCardAttachment} />
                  </ActionButton>
                  {activeCard?.memberIds?.includes(currentUser._id)
                    ? <ActionButton
                      sx={{ color: 'error.main', '&:hover': { bgcolor: '#ffebee' } }}
                      startIcon={<ExitToAppIcon />}
                      onClick={() => onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTIONS.REMOVE })}
                    >
                      Leave
                    </ActionButton>
                    : <ActionButton
                      startIcon={<PersonOutlineOutlinedIcon />}
                      onClick={() => onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTIONS.ADD })}
                    >
                      Join
                    </ActionButton>
                  }
                </Stack>
              </Box>

              {/* Hiển thị Labels & Members & Date */}
              <Stack direction="row" gap={3} flexWrap="wrap" sx={{ mb: 3 }}>
                {/* Members */}
                {activeCard?.memberIds?.length > 0 && (
                  <Box>
                    <Typography sx={{ fontWeight: '600', fontSize: '12px', color: 'text.secondary', mb: 0.5 }}>Members</Typography>
                    <CardUserGroup cardMemberIds={activeCard?.memberIds} onUpdateCardMembers={onUpdateCardMembers} />
                  </Box>
                )}

                {/* Labels */}
                {activeCard?.labelIds?.length > 0 && (
                  <Box>
                    <Typography sx={{ fontWeight: '600', fontSize: '12px', color: 'text.secondary', mb: 0.5 }}>Labels</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {activeCard?.labelIds?.map(labelId => {
                        const label = boardLabels.find(l => l._id === labelId)
                        if (!label) return null
                        return (
                          <Box
                            key={label._id}
                            sx={{
                              bgcolor: label.color, color: 'white', borderRadius: '4px',
                              fontSize: '12px', fontWeight: 600, px: 1.5, py: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 }
                            }}
                            onClick={(e) => setAnchorLabelEl(e.currentTarget)}
                          >
                            {label.title}
                          </Box>
                        )
                      })}
                      <Box
                        sx={{
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2f3542' : '#091e420f',
                          borderRadius: '4px', width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#33485D' : '#091e4214' }
                        }}
                        onClick={(e) => setAnchorLabelEl(e.currentTarget)}
                      >
                        <AddOutlinedIcon fontSize="small" />
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* LOGIC HIỂN THỊ DATE CHIP THÔNG MINH */}
                {(activeCard?.startDate || activeCard?.dueDate) && (
                  <Box>
                    <Typography sx={{ fontWeight: '600', fontSize: '12px', color: 'text.secondary', mb: 0.5 }}>Dates</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                      <Chip
                        icon={<WatchLaterOutlinedIcon />}
                        label={
                          // Logic label: Start - End hoặc chỉ 1 trong 2
                          activeCard?.startDate && activeCard?.dueDate
                            ? `${dayjs(activeCard.startDate).format('DD/MM')} - ${dayjs(activeCard.dueDate).format('DD/MM/YYYY')} lúc ${dayjs(activeCard.dueDate).format('HH:mm')}`
                            : activeCard?.startDate
                              ? `Bắt đầu: ${dayjs(activeCard.startDate).format('DD/MM/YYYY')}`
                              : `${dayjs(activeCard.dueDate).format('DD/MM/YYYY')} lúc ${dayjs(activeCard.dueDate).format('HH:mm')}`
                        }
                        sx={{
                          bgcolor: (theme) => {
                            if (!activeCard?.dueDate) return theme.palette.action.hover; // Nếu chỉ có start date thì màu xám

                            const now = dayjs()
                            const deadline = dayjs(activeCard.dueDate)
                            const isOverdue = deadline.isBefore(now)
                            const isNear = deadline.diff(now, 'hour') <= 24 && deadline.isAfter(now)

                            if (isOverdue) return theme.palette.mode === 'dark' ? '#ef9a9a' : '#ffebee'
                            if (isNear) return theme.palette.mode === 'dark' ? '#ffe082' : '#fff8e1'
                            return theme.palette.mode === 'dark' ? '#a5d6a7' : '#e8f5e9'
                          },
                          color: (theme) => {
                            if (!activeCard?.dueDate) return theme.palette.text.primary;

                            const now = dayjs()
                            const deadline = dayjs(activeCard.dueDate)
                            const isOverdue = deadline.isBefore(now)
                            const isNear = deadline.diff(now, 'hour') <= 24 && deadline.isAfter(now)

                            if (isOverdue) return theme.palette.mode === 'dark' ? '#b71c1c' : '#c62828'
                            if (isNear) return theme.palette.mode === 'dark' ? '#f57f17' : '#f57c00'
                            return theme.palette.mode === 'dark' ? '#1b5e20' : '#2e7d32'
                          },
                          fontWeight: 500,
                          height: '28px',
                          border: '1px solid transparent',
                          '.MuiChip-icon': { color: 'inherit' }
                        }}
                        onClick={(e) => setAnchorElDate(e.currentTarget)} // Bấm vào chip để mở lại popover
                      />
                    </Box>
                  </Box>
                )}
              </Stack>

              {/* Description */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <SubjectRoundedIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="span" sx={{ fontWeight: '600', fontSize: '18px' }}>Description</Typography>
                </Box>
                <CardDescriptionMdEditor
                  cardDescriptionProp={activeCard?.description}
                  handleUpdateCardDescription={onUpdateCardDescription}
                />
              </Box>

              {/* Attachments */}
              {activeCard?.attachments?.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <CardAttachmentList
                    cardId={activeCard?._id}
                    attachments={activeCard?.attachments}
                  />
                </Box>
              )}

              {/* Checklists */}
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
            </Grid>

            {/* === CỘT PHẢI (5 phần) === */}
            <Grid xs={12} md={5} sx={{
              height: '100%',
              overflowY: 'auto',
              pt: 3, pr: 3, pl: 2, pb: 3,
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ced0da', borderRadius: '8px' },
              '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#bfc2cf' }
            }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <DvrOutlinedIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="span" sx={{ fontWeight: '600', fontSize: '16px' }}>Comments and Activity</Typography>
                </Box>
                <CardCommentAndActivity
                  cardComments={activeCard?.comments}
                  onAddCardComment={onAddCardComment}
                />
              </Box>
            </Grid>

          </Grid>
        </Box>

        {/* === POPUP MENU CHO STICKY HEADER ADD BUTTON === */}
        <Menu
          anchorEl={anchorElAddMenu}
          open={Boolean(anchorElAddMenu)}
          onClose={() => setAnchorElAddMenu(null)}
          MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        >
          <MenuItem onClick={(e) => { setAnchorLabelEl(e.currentTarget); setAnchorElAddMenu(null); }}>
            <ListItemIcon><LocalOfferOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Labels</ListItemText>
          </MenuItem>
          <MenuItem onClick={(e) => { setAnchorElChecklist(e.currentTarget); setAnchorElAddMenu(null); }}>
            <ListItemIcon><TaskAltOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Checklist</ListItemText>
          </MenuItem>
          <MenuItem onClick={(e) => { setAnchorElDate(e.currentTarget); setAnchorElAddMenu(null); }}>
            <ListItemIcon><WatchLaterOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Dates</ListItemText>
          </MenuItem>
          <MenuItem component="label">
            <ListItemIcon><AttachFileOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Attachment</ListItemText>
            <VisuallyHiddenInput type="file" multiple onChange={onUploadCardAttachment} />
          </MenuItem>
          <Divider />
          {activeCard?.memberIds?.includes(currentUser._id) ? (
            <MenuItem onClick={() => { onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTIONS.REMOVE }); setAnchorElAddMenu(null); }}>
              <ListItemIcon><ExitToAppIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Leave</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem onClick={() => { onUpdateCardMembers({ userId: currentUser._id, action: CARD_MEMBER_ACTIONS.ADD }); setAnchorElAddMenu(null); }}>
              <ListItemIcon><PersonOutlineOutlinedIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Join</ListItemText>
            </MenuItem>
          )}
        </Menu>

        {/* === NEW POPOVER: CHECKLIST === */}
        <Popover
          open={Boolean(anchorElChecklist)}
          anchorEl={anchorElChecklist}
          onClose={() => setAnchorElChecklist(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Box sx={{ p: 2, width: 300 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Add checklist</Typography>
            <TextField
              autoFocus
              fullWidth
              size="small"
              placeholder="Checklist title"
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklist() }}
            />
            <Button variant="contained" size="small" sx={{ mt: 1.5 }} onClick={handleAddChecklist}>
              Add
            </Button>
          </Box>
        </Popover>

        {/* === NEW POPOVER: START & DUE DATE === */}
        <Popover
          open={Boolean(anchorElDate)}
          anchorEl={anchorElDate}
          onClose={() => setAnchorElDate(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{ paper: { sx: { borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden' } } }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ width: '320px', display: 'flex', flexDirection: 'column' }}>

              {/* 1. LỊCH (HEADER) */}
              <DateCalendar
                value={enableDue ? tempDueDate : tempStartDate} // Focus vào ngày nào
                onChange={handleCalendarChange}
                slots={{ day: DayWithRange }} // Inject component ngày tùy chỉnh
                slotProps={{
                  day: {
                    startDate: tempStartDate,
                    dueDate: tempDueDate,
                    isStartDateEnabled: enableStart,
                    isDueDateEnabled: enableDue
                  }
                }}
                views={['year', 'month', 'day']}
                sx={{
                  m: 0, width: '100%',
                  '& .MuiPickersCalendarHeader-root': { pl: 2, pr: 2 },
                  '& .MuiDayCalendar-header': { fontWeight: 'bold' }
                }}
              />

              <Divider sx={{ my: 0 }} />

              {/* 2. OPTIONS (FORM) */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Option 1: Start Date */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableStart}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setEnableStart(isChecked);
                          // 🔥 Logic mới: Nếu tick vào mà chưa có ngày thì set là Hôm nay
                          if (isChecked && !tempStartDate) {
                            setTempStartDate(dayjs());
                          }
                        }}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" fontWeight="600">Start date</Typography>}
                    sx={{ mb: 0.5 }}
                  />
                  <DateField
                    disabled={!enableStart}
                    value={tempStartDate}
                    onChange={(newValue) => setTempStartDate(newValue)}
                    format="DD/MM/YYYY"
                    fullWidth
                    size="small"
                    density="compact" // Làm nhỏ input
                    sx={{ '& .MuiInputBase-input': { fontSize: '14px', py: 1 } }}
                  />
                </Box>

                {/* Option 2: Due Date (Date + Time) */}
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={enableDue}
                        onChange={(e) => setEnableDue(e.target.checked)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" fontWeight="600">Due date</Typography>}
                    sx={{ mb: 0.5 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DateField
                      disabled={!enableDue}
                      value={tempDueDate}
                      onChange={(newValue) => {
                        // Giữ nguyên giờ cũ khi đổi ngày qua input
                        if (newValue && tempDueDate) {
                          const updated = newValue.hour(tempDueDate.hour()).minute(tempDueDate.minute());
                          setTempDueDate(updated);
                        } else {
                          setTempDueDate(newValue);
                        }
                      }}
                      format="DD/MM/YYYY"
                      fullWidth
                      size="small"
                      sx={{ flex: 2, '& .MuiInputBase-input': { fontSize: '14px', py: 1 } }}
                    />
                    <TimeField
                      disabled={!enableDue}
                      value={tempDueDate}
                      onChange={(newValue) => setTempDueDate(newValue)}
                      format="HH:mm"
                      fullWidth
                      size="small"
                      ampm={false}
                      sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: '14px', py: 1 } }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* 3. BUTTONS */}
              <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSaveDate}
                >
                  Save
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveDate}
                  sx={{
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'transparent' : '#f4f5f7',
                    border: 'none',
                    color: 'text.primary',
                    '&:hover': { backgroundColor: (theme) => theme.palette.error.light, color: 'white' }
                  }}
                >
                  Remove
                </Button>
              </Box>

            </Box>
          </LocalizationProvider>
        </Popover>

        {/* === CÁC DIALOG / MENU PHỤ TRỢ KHÁC === */}
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