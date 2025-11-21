import { useState, useEffect } from 'react'
import { Popover, Box, Typography, Button, TextField, Checkbox, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { LABEL_COLORS } from '~/utils/constants'

function LabelPopover({ 
  anchorEl, 
  onClose, 
  activeCard, 
  boardLabels = [], 
  onUpdateCardLabels, 
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel
}) {
  const [mode, setMode] = useState('LIST')
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].color)
  const [labelText, setLabelText] = useState('')
  const [editingLabel, setEditingLabel] = useState(null)

  // ✨ STATE MỚI: Lưu danh sách ID tạm thời khi đang chọn
  const [pendingLabelIds, setPendingLabelIds] = useState([])

  // Reset state khi mở lại
  useEffect(() => {
    if (anchorEl) {
      setPendingLabelIds(activeCard?.labelIds || [])
      setMode('LIST')
      setLabelText('')
      setEditingLabel(null)
    }
  }, [anchorEl, activeCard])

  const handleClose = () => {
    setMode('LIST')
    onClose()
  }

  // ✨ LOGIC MỚI: Chỉ update vào biến tạm local
  const handleToggleLabelLocal = (labelId) => {
    if (pendingLabelIds.includes(labelId)) {
      setPendingLabelIds(pendingLabelIds.filter(id => id !== labelId))
    } else {
      setPendingLabelIds([...pendingLabelIds, labelId])
    }
  }

  // ✨ LOGIC MỚI: Khi bấm Save ở màn hình List
  const handleSaveList = () => {
    onUpdateCardLabels(pendingLabelIds)
    onClose()
  }

  // Logic Tạo Label Mới
  const handleCreate = () => {
    if (!selectedColor) return
    onCreateLabel({ title: labelText.trim(), color: selectedColor })
    setMode('LIST')
    setLabelText('')
  }

  // Logic Lưu khi Edit
  const handleSaveEdit = () => {
    if (!editingLabel) return
    onUpdateLabel(editingLabel._id, { title: labelText.trim(), color: selectedColor })
    setMode('LIST')
  }

  const handleDelete = () => {
    if (!editingLabel) return
    if (window.confirm('Delete this label?')) {
      onDeleteLabel(editingLabel._id)
      setMode('LIST')
    }
  }

  const ColorBox = ({ color, isSelected, onClick }) => (
    <Box
      onClick={() => onClick(color)}
      sx={{
        width: '32px', height: '32px', borderRadius: '4px', cursor: 'pointer',
        bgcolor: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        '&:hover': { opacity: 0.8 },
        border: isSelected ? '2px solid white' : 'none',
        boxShadow: isSelected ? '0 0 0 2px #091e42' : 'none'
      }}
    />
  )

  // 1. Render Giao diện Danh sách (LIST)
  const renderListMode = () => (
    <Box sx={{ p: 2, width: 300 }}>
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
         <Typography sx={{ fontWeight: 600 }}>Labels</Typography>
         <CloseIcon sx={{ cursor: 'pointer', fontSize: 'small' }} onClick={handleClose} />
       </Box>
       
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2, maxHeight: '200px', overflowY: 'auto' }}>
         {boardLabels.length === 0 && <Typography variant="caption" sx={{color: 'text.secondary'}}>No labels found.</Typography>}
         
         {boardLabels.map(label => {
           // Check dựa trên biến tạm pendingLabelIds
           const isChecked = pendingLabelIds.includes(label._id)
           return (
             <Box key={label._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Checkbox 
                  checked={isChecked} 
                  onChange={() => handleToggleLabelLocal(label._id)} 
                  sx={{ p: 0.5 }}
               />
               <Box 
                  onClick={() => handleToggleLabelLocal(label._id)}
                  sx={{ 
                    flexGrow: 1, height: '32px', borderRadius: '4px', 
                    bgcolor: label.color, color: 'white', 
                    display: 'flex', alignItems: 'center', px: 1.5, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    '&:hover': { opacity: 0.9 },
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}
               >
                 {label.title}
               </Box>
               <IconButton size="small" onClick={() => {
                  setMode('EDIT')
                  setEditingLabel(label)
                  setLabelText(label.title)
                  setSelectedColor(label.color)
               }}>
                 <EditIcon fontSize="small" />
               </IconButton>
             </Box>
           )
         })}
       </Box>

       {/* ✨ Nút Save và Create */}
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" onClick={handleSaveList}>Save</Button>
          <Button 
            fullWidth variant="contained" sx={{ bgcolor: 'rgba(9,30,66,0.04)', color: '#172b4d', boxShadow: 'none', '&:hover': { bgcolor: 'rgba(9,30,66,0.08)', boxShadow: 'none' } }}
            onClick={() => { setMode('CREATE'); setLabelText(''); setSelectedColor(LABEL_COLORS[0].color) }}
          >
            Create a new label
          </Button>
       </Box>
    </Box>
  )

  // 2. Render Giao diện Tạo/Sửa (CREATE / EDIT) giữ nguyên như cũ
  const renderFormMode = () => {
    const isEdit = mode === 'EDIT'
    return (
      <Box sx={{ p: 2, width: 300 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
           <ArrowBackIcon sx={{ cursor: 'pointer', fontSize: 'small', mr: 1 }} onClick={() => setMode('LIST')} />
           <Typography sx={{ fontWeight: 600, flexGrow: 1, textAlign: 'center' }}>
             {isEdit ? 'Edit label' : 'Create label'}
           </Typography>
           <CloseIcon sx={{ cursor: 'pointer', fontSize: 'small' }} onClick={handleClose} />
        </Box>

        <Box sx={{ bgcolor: '#f4f5f7', p: 4, mb: 2, display: 'flex', justifyContent: 'center', borderRadius: '4px' }}>
           <Box sx={{ 
             bgcolor: selectedColor, color: 'white', 
             px: 2, py: 0.5, borderRadius: '4px', fontWeight: 600, minWidth: '100%', textAlign: 'left',
             maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
           }}>
             {labelText || 'Title'}
           </Box>
        </Box>

        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Title</Typography>
        <TextField 
          fullWidth size="small" value={labelText} onChange={e => setLabelText(e.target.value)} 
          placeholder="Optional..." sx={{ mb: 2 }} autoFocus
        />

        <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>Select a color</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
           {LABEL_COLORS.map(c => (
             <ColorBox 
               key={c.color} color={c.color} 
               isSelected={selectedColor === c.color} 
               onClick={setSelectedColor} 
             />
           ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Button variant="contained" onClick={isEdit ? handleSaveEdit : handleCreate}>
             {isEdit ? 'Save' : 'Create'}
           </Button>
           {isEdit && (
             <Button color="error" variant="outlined" onClick={handleDelete} startIcon={<DeleteOutlineIcon />}>
               Delete
             </Button>
           )}
        </Box>
      </Box>
    )
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      {mode === 'LIST' ? renderListMode() : renderFormMode()}
    </Popover>
  )
}

export default LabelPopover