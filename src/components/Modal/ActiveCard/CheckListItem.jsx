import React, { useState, useEffect } from 'react';
import {
    Box, Checkbox, Stack, IconButton, Button, TextField,
    Typography, Avatar, AvatarGroup, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    AccessTime as AccessTimeIcon,
    Close as CloseIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import dayjs from 'dayjs'; // Đảm bảo dayjs được import
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
    onOpenAssignMenu,
    onOpenDatePicker,
    cardMembers
}) {
    
    // ... (Toàn bộ logic state, hooks, và các hàm xử lý:
    // handleSave, handleCancel, handleDelete, handleToggleDone...
    // ... GIỮ NGUYÊN ...
    // ... )

    // --- STATE CHO CHẾ ĐỘ EDIT ---
    const [editTitle, setEditTitle] = useState(item.title);
    const [editDueDate, setEditDueDate] = useState(item.dueDate);
    const [editAssignedIds, setEditAssignedIds] = useState(item.assignedMemberIds || []);
    
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour'));
    const [assignMenuAnchorEl, setAssignMenuAnchorEl] = useState(null);

    useEffect(() => {
        if (isEditing) {
            setEditTitle(item.title);
            setEditDueDate(item.dueDate);
            setEditAssignedIds(item.assignedMemberIds || []);
            setSelectedDate(dayjs(item.dueDate || Date.now() + 3600*1000));
        }
    }, [isEditing, item]);

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

    const calculateNewProgress = (items) => {
        const totalItemsCount = items.length;
        if (totalItemsCount === 0) return 0;
        const doneItemsCount = items.filter(i => i.isDone).length;
        return Math.round((doneItemsCount / totalItemsCount) * 100);
    };
    
    const handleSave = async () => {
        if (!editTitle.trim()) {
            onSetEditing(null);
            return;
        }
        // 1. Tìm ra ID thành viên vừa được thêm vào (nếu có)
        const oldIds = item.assignedMemberIds || [];
        // Lấy những id có trong editAssignedIds mà không có trong oldIds
       const addedMemberIds = editAssignedIds.filter(id => !oldIds.includes(id));
        const newChecklistsArray = currentChecklists.map(c => {
            if (c._id === checklistId) {
                const newItems = c.items.map(i => {
                    if (i._id === item._id) {
                        return { 
                            ...i, 
                            title: editTitle.trim(),
                            dueDate: editDueDate,
                            assignedMemberIds: editAssignedIds
                        };
                    }
                    return i;
                });
                return { ...c, items: newItems };
            }
            return c;
        });
        // 3. Chuẩn bị payload để gửi đi
        const updateData = {
            checklists: newChecklistsArray,
            // [LOGIC MỚI] Gửi mảng các thành viên mới thêm vào để Backend gửi mail
            ...(addedMemberIds.length > 0 && { addedChecklistMemberIds: addedMemberIds }) 
        };
        
        // 4. Gọi API Update Card Chung
        await callApiUpdateCard(updateData);
        onSetEditing(null);
    };

    const handleCancel = () => {
        onSetEditing(null);
    };

    const handleDelete = async () => {
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
        // ... (Code cho chế độ EDIT MODE giữ nguyên) ...
        const assignedMembers = (cardMembers || []).filter(m => 
            editAssignedIds.includes(m._id)
        );

        return (
            <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1.5 }}>
                <TextField
                    fullWidth size="small" value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Nhập tên item" autoFocus
                />
                
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
                            label={dayjs(editDueDate).format('HH:mm DD/MM/YYYY')} // <-- Sửa format
                            onDelete={() => setEditDueDate(null)}
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>
            
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'space-between' }}>
                    <Box>
                        <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
                        <Button size="small" onClick={handleCancel}>Cancel</Button>
                    </Box>
                    <Box sx={{ ml: 2, mr: 2 }}>
                        <Button 
                            variant="text" size='small' startIcon={<PersonAddIcon />}
                            onClick={(e) => setAssignMenuAnchorEl(e.currentTarget)}
                        >
                            Assign
                        </Button>
                        <Button 
                            variant="text" size='small' startIcon={<AccessTimeIcon />}
                            onClick={() => setIsDatePickerOpen(true)}
                        >
                            Due Date
                        </Button>
                    </Box>
                </Stack>

                {/* ... (Code Menu và Dialog CỤC BỘ giữ nguyên) ... */}
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

    /**
     * ✨ HÀM RENDER CHIP ĐÃ ĐƯỢC CẬP NHẬT ✨
     */
    const renderDueDateChip = () => {
        if (!item.dueDate) return null;

        const dueDate = dayjs(item.dueDate);
        const now = dayjs();
        
        // Cập nhật format
        const label = dueDate.format('HH:mm DD/MM/YYYY');
        
        let chipStyles = {};

        if (item.isDone) {
            // 1. HOÀN THÀNH (Ưu tiên cao nhất): Xanh lá, gạch ngang
            chipStyles = {
                bgColor: '#e5f7e5', // Light green
                textColor: '#2e7d32', // Dark green
                iconColor: '#2e7d32',
                textDecoration: 'line-through'
            };
        } else if (dueDate.isBefore(now)) {
            // 2. QUÁ HẠN: Đỏ
            chipStyles = {
                bgColor: '#ffdddd', // Light red
                textColor: '#c62828', // Dark red
                iconColor: '#c62828',
                textDecoration: 'none'
            };
        } else if (dueDate.diff(now, 'hour') < 24) {
            // 3. SẮP HẾT HẠN (trong 24h): Cam
            chipStyles = {
                bgColor: '#fff0d6', // Light orange
                textColor: '#ef6c00', // Dark orange
                iconColor: '#ef6c00',
                textDecoration: 'none'
            };
        } else {
            // 4. CÒN HẠN (giống logic card): Xanh lá
            chipStyles = {
                bgColor: '#e5f7e5', // Light green
                textColor: '#2e7d32', // Dark green
                iconColor: '#2e7d32',
                textDecoration: 'none'
            };
        }

        return (
            <Chip
                size="small"
                icon={<AccessTimeIcon fontSize="small" sx={{ color: chipStyles.iconColor }} />}
                label={label} // Dùng format mới
                sx={{
                    fontSize: '0.75rem',
                    backgroundColor: chipStyles.bgColor,
                    color: chipStyles.textColor,
                    textDecoration: chipStyles.textDecoration,
                    fontWeight: 500,
                    // Cho phép chip thu nhỏ nếu không đủ chỗ
                    maxWidth: '100%'
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
                // CSS hover (giữ nguyên)
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
                onClick={() => onSetEditing(item._id)}
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
                    marginLeft: 'auto',
                    alignItems: 'center' // Căn giữa stack
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
                        sx={{
                            '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' },
                        }}
                    >
                        {assignedMembers.map(member => (
                            <Avatar key={member._id} alt={member.displayName} src={member.avatar} />
                        ))}
                    </AvatarGroup>
                    
                    {/* Sử dụng hàm render chip đã cập nhật */}
                    {renderDueDateChip()}
                    
                </Stack>

                {/* 2. Phần Nút (hiện khi hover) */}
                <Box className="hover-buttons">
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