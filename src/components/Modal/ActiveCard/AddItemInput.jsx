import React, { useState } from 'react';
import {
    Box, TextField, Stack, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Menu, MenuItem, Avatar, AvatarGroup, ListItemIcon, ListItemText, Chip,
    Typography 
} from '@mui/material';
import {
    PersonAdd as PersonAddIcon,
    AccessTime as AccessTimeIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

function AddItemInput({ checklist, callApiUpdateCard, currentChecklists, cardMembers }) {
    const [adding, setAdding] = useState(false);
    const [itemTitle, setItemTitle] = useState('');

    // --- State Cục bộ cho item mới ---
    const [newItemDueDate, setNewItemDueDate] = useState(null); // Lưu Date object
    const [newItemAssignedIds, setNewItemAssignedIds] = useState([]); // Lưu mảng IDs


    // --- State cho Dialog/Menu ---
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'hour')); // State tạm cho picker
    const [assignMenuAnchorEl, setAssignMenuAnchorEl] = useState(null);

    // --- Hàm Reset State ---
    const resetLocalState = () => {
        setAdding(false);
        setItemTitle('');
        setNewItemDueDate(null);
        setNewItemAssignedIds([]);
        setIsDatePickerOpen(false);
        setAssignMenuAnchorEl(null);
    };

    // --- Xử lý cho Menu Gán Member ---
    const handleToggleMember = (memberId) => {
        const newIds = newItemAssignedIds.includes(memberId)
            ? newItemAssignedIds.filter(id => id !== memberId)
            : [...newItemAssignedIds, memberId];
        setNewItemAssignedIds(newIds);
    };
    
    // Lấy thông tin member được gán (từ state cục bộ)
    const assignedMembers = (cardMembers || []).filter(m => 
        newItemAssignedIds.includes(m._id)
    );

    // --- Xử lý cho Date Picker ---
    const handleConfirmDueDate = () => {
        setNewItemDueDate(selectedDate.toDate());
        setIsDatePickerOpen(false);
    };

    // --- Xử lý khi nhấn "Add" ---
    const handleAddItem = async () => {
        if (!itemTitle.trim()) return;

        const newItem = {
            _id: uuidv4(),
            title: itemTitle.trim(),
            isDone: false,
            // Sử dụng state cục bộ
            assignedMemberIds: newItemAssignedIds,
            dueDate: newItemDueDate,
        };

        // Logic gọi API (giữ nguyên)
        const targetChecklist = currentChecklists.find(c => c._id === checklist._id);
        const newItems = [...(targetChecklist.items || []), newItem];
        const newChecklistsArray = currentChecklists.map(c => {
            if (c._id === checklist._id) {
                const targetChecklist = currentChecklists.find(c => c._id === checklist._id);
                const newItems = [...(targetChecklist.items || []), newItem];
                // Khi THÊM item, chúng ta cũng cần tính lại progress
                const totalItemsCount = newItems.length;
                const doneItemsCount = newItems.filter(i => i.isDone).length;
                const newProgress = Math.round((doneItemsCount / totalItemsCount) * 100);

                return { ...c, items: newItems, progress: newProgress };
            }
            return c;
        });

        const updateData = {
            checklists: newChecklistsArray,
            // Nếu có thành viên được chọn, gửi mảng ID
            ...(newItemAssignedIds.length > 0 && { addedChecklistMemberIds: newItemAssignedIds }) 
        };

        await callApiUpdateCard(updateData);

        // Reset tất cả state
        resetLocalState();
    };

    return adding ? (
        <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1.5 }}>
            <TextField
                fullWidth
                size="small"
                value={itemTitle}
                onChange={e => setItemTitle(e.target.value)}
                placeholder="Nhập tên item"
                autoFocus
            />

            {/* Hiển thị các lựa chọn (member và date) */}
            <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                <AvatarGroup 
                    max={3}
                    sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}
                >
                    {assignedMembers.map(member => (
                        <Avatar key={member._id} alt={member.displayName} src={member.avatar} />
                    ))}
                </AvatarGroup>
                
                {newItemDueDate && (
                    <Chip
                        size="small"
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={dayjs(newItemDueDate).format('DD/MM')}
                        onDelete={() => setNewItemDueDate(null)} // Cho phép xóa
                        sx={{ fontSize: '0.75rem' }}
                    />
                )}
            </Stack>
            
            {/* Hàng nút điều khiển */}
            <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'space-between' }}>
                <Box>
                    <Button size="small" variant="contained" onClick={handleAddItem}>Add</Button>
                    <Button size="small" onClick={resetLocalState}>Cancel</Button>
                </Box>
                <Box sx={{ ml: 2, mr: 2 }}>
                    <Button 
                        variant="text" 
                        size='small' 
                        startIcon={<PersonAddIcon />}
                        onClick={(e) => setAssignMenuAnchorEl(e.currentTarget)} // <-- Mở Menu
                    >
                        Assign
                    </Button>
                    <Button 
                        variant="text" 
                        size='small' 
                        startIcon={<AccessTimeIcon />}
                        onClick={() => setIsDatePickerOpen(true)} // <-- Mở Dialog
                    >
                        Due Date
                    </Button>
                </Box>
            </Stack>

            {/* --- CÁC DIALOG/MENU CỤC BỘ --- */}

            {/* Menu gán member */}
            <Menu
                open={Boolean(assignMenuAnchorEl)}
                anchorEl={assignMenuAnchorEl}
                onClose={() => setAssignMenuAnchorEl(null)}
            >
                <Typography sx={{ fontWeight: 600, px: 2, pb: 1 }}>Gán thành viên</Typography>
                {cardMembers.length === 0 && (
                    <MenuItem disabled>Không có thành viên nào trong card này</MenuItem>
                )}
                {cardMembers.map(member => {
                    const isAssigned = newItemAssignedIds.includes(member._id);
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

            {/* Dialog chọn ngày */}
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
    ) : (
        <Button sx={{ mt: 1 }} size="small" onClick={() => setAdding(true)}>+ Add Item</Button>
    );
}

export default AddItemInput;