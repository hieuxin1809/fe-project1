import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box' // ✨ Import Box
import Tooltip from '@mui/material/Tooltip' // ✨ Import Tooltip để hover xem tên label

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDispatch, useSelector } from 'react-redux' // ✨ Import useSelector
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice' // ✨ Import selector lấy board

function Card({ card }) {
  const dispatch = useDispatch()
  // ✨ Lấy activeBoard để truy cập danh sách labels đầy đủ
  const activeBoard = useSelector(selectCurrentActiveBoard)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  })
  
  const dndKitCardStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? '1px solid #2ecc71' : undefined
  }

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length
  }

  const setActiveCard = () => {
    dispatch(updateCurrentActiveCard(card))
    dispatch(showModalActiveCard())
  }

  // ✨ Helper function: Map labelIds của card thành mảng object label đầy đủ (có màu, tên)
  const getCardLabels = () => {
    if (!card?.labelIds || !activeBoard?.labels) return []
    return activeBoard.labels.filter(label => card.labelIds.includes(label._id))
  }

  const cardLabels = getCardLabels()

  return (
    <MuiCard
      onClick={setActiveCard}
      ref={setNodeRef} style={dndKitCardStyles} {...attributes} {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        '&:hover': { borderColor: (theme) => theme.palette.primary.main }
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} /> }
      
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        
        {/* ✨ HIỂN THỊ LABELS (Lines) */}
        {cardLabels.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {cardLabels.map(label => (
              <Tooltip title={label.title} key={label._id}>
                <Box
                  sx={{
                    width: '40px', // Độ rộng của line
                    height: '8px', // Độ cao của line
                    borderRadius: '4px',
                    bgcolor: label.color, // Màu nền theo label
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        )}

        <Typography>{card?.title}</Typography>
      </CardContent>

      {shouldShowCardActions() &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {!!card?.memberIds?.length &&
            <Button size="small" startIcon={<GroupIcon />}>{card?.memberIds?.length}</Button>
          }
          {!!card?.comments?.length &&
            <Button size="small" startIcon={<CommentIcon />}>{card?.comments?.length}</Button>
          }
          {!!card?.attachments?.length &&
            <Button size="small" startIcon={<AttachmentIcon />}>{card?.attachments?.length}</Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card