import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ChecklistItem from './ChecklistItem'; // Import component item
import AddItemInput from './AddItemInput';   // Import component input

/**
 * Component này render TOÀN BỘ một checklist.
 * Nhận props quản lý dialog từ ActiveCard và truyền xuống ChecklistItem.
 */
function Checklist({
    checklist,
    callApiUpdateCard,
    currentChecklists,
    // Props mới từ ActiveCard
    onOpenAssignMenu,
    onOpenDatePicker,
    cardMembers
}) {
    // State quản lý ẩn/hiện item đã hoàn thành
    const [hideChecked, setHideChecked] = useState(false);

    // State quản lý item NÀO đang được edit (lưu _id của item)
    const [editingItemId, setEditingItemId] = useState(null);

    // Logic để xóa checklist
    const handleDeleteChecklist = async () => {
        if (!confirm(`Xóa checklist "${checklist.title}"?`)) return;
        const updatedChecklists = currentChecklists.filter(c => c._id !== checklist._id);
        await callApiUpdateCard({
            checklists: updatedChecklists
        });
    };

    // --- Logic UI ---
    const items = checklist.items || [];
    const doneItemsCount = items.filter(i => i.isDone).length;
    const totalItemsCount = items.length;
    const hasDoneItems = doneItemsCount > 0;
    const allItemsDone = totalItemsCount > 0 && doneItemsCount === totalItemsCount;
    const itemsToRender = hideChecked ? items.filter(i => !i.isDone) : items;
    // --------------------

    return (
        <Box key={checklist._id} sx={{ mb: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
            {/* Header (Title và Nút) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{checklist.title}</Typography>

                <Box>
                    {/* Nút "Hide checked items" */}
                    {hasDoneItems && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setHideChecked(!hideChecked)}
                            sx={{ mr: 1, color: 'text.secondary' }}
                        >
                            {hideChecked ? 'Show checked items' : 'Hide checked items'}
                        </Button>
                    )}

                    {/* Nút Delete */}
                    <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={handleDeleteChecklist}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {/* Progress (Hiển thị % bên trái) */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                my: 1,
                gap: 1.5
            }}>
                <Typography
                    variant="caption"
                    sx={{
                        minWidth: '35px',
                        textAlign: 'right',
                        color: 'text.secondary',
                        fontWeight: 'bold'
                    }}
                >
                    {checklist.progress}%
                </Typography>
                <Box sx={{
                    width: '100%',
                    backgroundColor: '#eee',
                    borderRadius: '4px',
                    height: 6
                }}>
                    <Box sx={{ width: `${checklist.progress}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 4 }} />
                </Box>
            </Box>

            {/* Danh sách Items */}
            {itemsToRender.map(item => (
                <ChecklistItem
                    key={item._id}
                    item={item}
                    checklistId={checklist._id}
                    callApiUpdateCard={callApiUpdateCard}
                    currentChecklists={currentChecklists}

                    isEditing={item._id === editingItemId}
                    onSetEditing={setEditingItemId}

                    // Truyền props mới xuống item
                    onOpenAssignMenu={onOpenAssignMenu}
                    onOpenDatePicker={onOpenDatePicker}
                    cardMembers={cardMembers}
                />
            ))}

            {/* Thông báo "All complete" */}
            {allItemsDone && hideChecked && (
                <Typography variant="body2" sx={{ my: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    Everything in this checklist is complete.
                </Typography>
            )}

            {/* Add Item */}
            <AddItemInput
                checklist={checklist}
                callApiUpdateCard={callApiUpdateCard}
                currentChecklists={currentChecklists}
                cardMembers={cardMembers} 
            />
        </Box>
    );
}

export default Checklist;