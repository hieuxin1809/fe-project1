import React, { useState, useEffect } from 'react';
import {
    Box, Checkbox, Stack, IconButton, Button, TextField,
    Typography, Avatar, AvatarGroup, Chip,
    // --- Thêm import cho Dialog/Menu CỤC BỘ ---
    Dialog, DialogTitle, DialogContent, DialogActions,
    Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    AccessTime as AccessTimeIcon,
    Close as CloseIcon,
    Check as CheckIcon // Thêm CheckIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
// --- Thêm import cho Date Picker ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


function ChecklistItem({
    item,
    checklistId,
    callApiUpdateCard,
    currentChecklists,
    isEditing,
    onSetEditing,
    onOpenAssignMenu, // Prop này dùng cho VIEW MODE (bị ẩn khi hover)
    onOpenDatePicker, // Prop này dùng cho VIEW MODE (bị ẩn khi hover)
    cardMembers
}) {
    
    // --- STATE CHO CHẾ ĐỘ EDIT ---
    // State "nháp" cho các giá trị đang edit
    const [editTitle, setEditTitle] = useState(item.title);
    const [editDueDate, setEditDueDate] = useState(item.dueDate);
    const [editAssignedIds, setEditAssignedIds] = useState(item.assignedMemberIds || []);
    
    // State cho Dialog/Menu CỤC BỘ (dùng trong edit mode)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour')); // State tạm cho picker
    const [assignMenuAnchorEl, setAssignMenuAnchorEl] = useState(null);

    // Reset state "nháp" mỗi khi bắt đầu edit (hoặc khi item prop thay đổi)
    useEffect(() => {
        if (isEditing) {
            setEditTitle(item.title);
            setEditDueDate(item.dueDate);
            setEditAssignedIds(item.assignedMemberIds || []);
            // Set ngày cho picker
            setSelectedDate(dayjs(item.dueDate || Date.now() + 3600*1000));
        }
    }, [isEditing, item]); // Chạy khi 'isEditing' = true

    // --- HÀM XỬ LÝ CỤC BỘ (CHO EDIT MODE) ---
    const handleToggleMember = (memberId) => {
        const newIds = editAssignedIds.includes(memberId)
            ? editAssignedIds.filter(id => id !== memberId)
            : [...editAssignedIds, memberId];
        setEditAssignedIds(newIds);
    };
    
    const handleConfirmDueDate = () => {
        setEditDueDate(selectedDate.toDate());
        setIsDatePickerOpen(false);
    };
    // ------------------------------------------

    const calculateNewProgress = (items) => {
        const totalItemsCount = items.length;
        if (totalItemsCount === 0) return 0;
        const doneItemsCount = items.filter(i => i.isDone).length;
        return Math.round((doneItemsCount / totalItemsCount) * 100);
    };
    
    // --- SỬA LẠI HÀM SAVE ---
    const handleSave = async () => {
        if (!editTitle.trim()) {
            onSetEditing(null); // Vẫn đóng nếu title rỗng
            return;
        }

        const newChecklistsArray = currentChecklists.map(c => {
            if (c._id === checklistId) {
                const newItems = c.items.map(i => {
                    if (i._id === item._id) {
                        // Gói tất cả state "nháp" vào đây
                        return { 
                            ...i, 
                            title: editTitle.trim(),
                            dueDate: editDueDate,
                            assignedMemberIds: editAssignedIds
                        };
                    }
                    return i;
                });
                // Khi SỬA item, KHÔNG CẦN TÍNH LẠI PROGRESS
                // (chỉ khi toggle 'done' hoặc 'delete' mới cần)
                return { ...c, items: newItems };
            }
            return c;
        });

        await callApiUpdateCard({ checklists: newChecklistsArray });
        onSetEditing(null); // Đóng form
    };

    const handleCancel = () => {
        onSetEditing(null); // Hủy, 'useEffect' sẽ reset state lần sau
    };

    const handleDelete = async () => {
        // ... (Logic giữ nguyên)
        const newChecklistsArray = currentChecklists.map(c => {
            if (c._id === checklistId) {
                const newItems = c.items.filter(i => i._id !== item._id);
                const newProgress = calculateNewProgress(newItems);
                return { ...c, items: newItems, progress: newProgress };
            }
            return c;
        });
        await callApiUpdateCard({ checklists: newChecklistsArray });
    };

    const handleToggleDone = async () => {
        // ... (Logic giữ nguyên)
        const newChecklistsArray = currentChecklists.map(c => {
            if (c._id === checklistId) {
                const newItems = c.items.map(i => {
                    if (i._id === item._id) {
                        return { ...i, isDone: !i.isDone };
                    }
                    return i;
                });
                const newProgress = calculateNewProgress(newItems);
                return { ...c, items: newItems, progress: newProgress };
            }
            return c;
        });
        await callApiUpdateCard({ checklists: newChecklistsArray });
    };


    // === GIAO DIỆN CHỈNH SỬA (khi isEditing = true) ===
    if (isEditing) {
        // Lấy thông tin member được gán (từ state "nháp")
        const assignedMembers = (cardMembers || []).filter(m => 
            editAssignedIds.includes(m._id)
        );

        return (
            <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1.5 }}>
                <TextField
                    fullWidth
                    size="small"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Nhập tên item"
                    autoFocus
                />
                
                {/* Hiển thị các lựa chọn (member và date "nháp") */}
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                    <AvatarGroup 
                        max={3}
                        sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}
                    >
                        {assignedMembers.map(member => (
                            <Avatar key={member._id} alt={member.displayName} src={member.avatar} />
                        ))}
                    </AvatarGroup>
                    
                    {editDueDate && (
                        <Chip
                            size="small"
                            icon={<AccessTimeIcon fontSize="small" />}
                            label={dayjs(editDueDate).format('DD/MM')}
                            onDelete={() => setEditDueDate(null)} // Cho phép xóa
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>
            
                {/* Hàng nút điều khiển */}
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'space-between' }}>
                    <Box>
                        <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
                        <Button size="small" onClick={handleCancel}>Cancel</Button>
                    </Box>
                    <Box sx={{ ml: 2, mr: 2 }}>
                        <Button 
                            variant="text" 
                            size='small' 
                            startIcon={<PersonAddIcon />}
                            onClick={(e) => setAssignMenuAnchorEl(e.currentTarget)} // <-- Mở Menu CỤC BỘ
                        >
                            Assign
                        </Button>
                        <Button 
                            variant="text" 
                            size='small' 
                            startIcon={<AccessTimeIcon />}
                            onClick={() => setIsDatePickerOpen(true)} // <-- Mở Dialog CỤC BỘ
                        >
                            Due Date
                        </Button>
                    </Box>
                </Stack>

                {/* --- CÁC DIALOG/MENU CỤC BỘ (Giống hệt AddItemInput) --- */}
                
                <Menu
                    open={Boolean(assignMenuAnchorEl)}
                    anchorEl={assignMenuAnchorEl}
                    onClose={() => setAssignMenuAnchorEl(null)}
                >
                    <Typography sx={{ fontWeight: 600, px: 2, pb: 1 }}>Gán thành viên</Typography>
                    {cardMembers.map(member => {
                        const isAssigned = editAssignedIds.includes(member._id);
                        return (
                            <MenuItem key={member._id} onClick={() => handleToggleMember(member._id)}>
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

                <Dialog open={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)}>
                    <DialogTitle>Chọn ngày & giờ hết hạn (Item)</DialogTitle>
                    <DialogContent sx={{ mt: 1, pt: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                ampm={false}
                                disablePast
                            />
                        </LocalizationProvider>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDatePickerOpen(false)}>Hủy</Button>
                        <Button variant="contained" onClick={handleConfirmDueDate}>
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>

            </Box>
        );
    }

    // === GIAO DIỆN XEM (khi isEditing = false) ===
    
    const assignedMembers = (cardMembers || []).filter(m => 
        (item.assignedMemberIds || []).includes(m._id)
    );

    const renderDueDateChip = () => {
        // ... (Logic render chip Vẫn giữ nguyên)
        if (!item.dueDate) return null;
        const dueDate = dayjs(item.dueDate);
        const now = dayjs();
        let chipStyles = {
            label: dueDate.format('DD/MM'), bgColor: 'transparent', textColor: 'text.secondary',
            iconColor: 'text.secondary', textDecoration: 'none'
        };
        if (item.isDone) {
            chipStyles = {
                label: dueDate.format('DD/MM'), bgColor: '#e5f7e5', textColor: '#2e7d32',
                iconColor: '#2e7d32', textDecoration: 'line-through'
            };
        } else if (dueDate.isBefore(now)) {
            chipStyles = {
                label: `${dueDate.format('DD/MM')} (Overdue)`, bgColor: '#ffdddd', textColor: '#c62828',
                iconColor: '#c62828', textDecoration: 'none'
            };
        } else if (dueDate.diff(now, 'hour') < 24) {
            chipStyles = {
                label: `${dueDate.format('DD/MM')} (Due soon)`, bgColor: '#fff0d6', textColor: '#ef6c00',
                iconColor: '#ef6c00', textDecoration: 'none'
            };
        }
        return (
            <Chip
                size="small"
                icon={<AccessTimeIcon fontSize="small" sx={{ color: chipStyles.iconColor }} />}
                label={chipStyles.label}
                sx={{
                    fontSize: '0.75rem', backgroundColor: chipStyles.bgColor, color: chipStyles.textColor,
                    textDecoration: chipStyles.textDecoration, fontWeight: 500
                }}
            />
        );
    };

    return (
        <Box
            key={item._id}
            sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
                // CSS hover (vẫn giữ nguyên)
                '& .hover-buttons': {
                    display: 'none',
                },
                '&:hover .hover-buttons': {
                    display: 'flex',
                },
            }}
        >
            <Checkbox
                checked={item.isDone}
                onChange={handleToggleDone}
            />

            <Button
                onClick={() => onSetEditing(item._id)} // <-- Bật chế độ edit
                sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    justifyContent: 'flex-start',
                    padding: '0 4px',
                    flexGrow: 1,
                    textDecoration: item.isDone ? 'line-through' : 'none',
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                {item.title}
            </Button>

            {/* Stack bên phải (VIEW MODE) */}
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    justifyContent: 'space-between',
                    marginLeft: 'auto'
                }}
            >
                {/* 1. Phần Info (luôn hiện) */}
                <Stack 
                    direction="row" 
                    spacing={1} 
                    className="info-display"
                    sx={{ alignItems: 'center' }} 
                >
                    <AvatarGroup 
                        max={3}
                        sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}
                    >
                        {assignedMembers.map(member => (
                            <Avatar key={member._id} alt={member.displayName} src={member.avatar} />
                        ))}
                    </AvatarGroup>
                    
                    {renderDueDateChip()}
                    
                </Stack>

                {/* 2. Phần Nút (hiện khi hover) */}
                <Box className="hover-buttons">
                    {/* Các nút này gọi hàm của ActiveCard (ông nội) */}
                    <IconButton size='small' aria-label="assign" onClick={(e) => onOpenAssignMenu(e.currentTarget, item, checklistId)}>
                        <PersonAddIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size='small' aria-label="due date" onClick={() => onOpenDatePicker(item, checklistId)}>
                        <AccessTimeIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton size='small' aria-label="delete" onClick={handleDelete}>
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                </Box>
            </Stack>
        </Box>
    );
}

export default ChecklistItem;