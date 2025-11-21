import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import GroupIcon from '@mui/icons-material/Group'
import CloseIcon from '@mui/icons-material/Close'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useConfirm } from 'material-ui-confirm'
import { useSelector , useDispatch } from 'react-redux'
import { selectCurrentActiveBoard } from '~/redux/activeBoard/activeBoardSlice'
import { selectCurrentUser } from '~/redux/user/userSlice'
import { removeMemberFromBoardAPI } from '~/apis'
import { toast } from 'react-toastify'
import { socketIoInstance } from '~/socketClient'
import { removeMemberFromBoard } from '~/redux/activeBoard/activeBoardSlice' // <-- 2. Import

function BoardMembersManager({ board }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const confirmRemoveMember = useConfirm()
  
  //const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser)
  const dispatch = useDispatch() // <-- 2. KHỞI TẠO DISPATCH Ở ĐÂY

  // 3. Lấy dữ liệu trực tiếp từ board prop
  const { FE_allUsers: boardUsers, _id: boardId, owners: boardOwners } = board
  
  // Kiểm tra xem user hiện tại có phải owner không
 // const isOwner = board?.owners?.some(owner => owner._id === currentUser?._id)
 const isOwner = boardOwners?.some(owner => owner._id === currentUser?._id)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleRemoveMember = (member) => {
    confirmRemoveMember({
      title: 'Remove Member',
      description: `Are you sure you want to remove ${member.displayName} from this board?`,
      confirmationText: 'Remove',
      cancellationText: 'Cancel'
    })
      .then(() => {
        // Gọi API xóa thành viên
        removeMemberFromBoardAPI(boardId, member._id)
          .then(() => {
            toast.success('Member removed successfully!')
            // Cập nhật Redux state hoặc refresh board
            socketIoInstance.emit('FE_MEMBER_REMOVED_FROM_BOARD', {
              boardId: boardId,
              userId: member._id
            })
            dispatch(removeMemberFromBoard({
              boardId: boardId,
              userId: member._id
            }))
          })
        console.log('Removing member:', member._id)
      })
      .catch(() => {})
  }

  // Phân loại members: owners và regular members
  const owners = boardUsers?.filter(user => 
    boardOwners?.some(owner => owner._id === user._id)
  ) || []
  
  const members = boardUsers?.filter(user => 
    !board?.owners?.some(owner => owner._id === user._id)
  ) || []

  return (
    <Box>
      <Button
        sx={{
          color: 'white',
          borderColor: 'white',
          '&:hover': { borderColor: 'white' }
        }}
        variant="outlined"
        startIcon={<GroupIcon />}
        onClick={handleClick}
      >
        Members ({boardUsers?.length || 0})
      </Button>

      <Menu
        id="board-members-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'board-members-button'
        }}
        PaperProps={{
          sx: {
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 500
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #ddd'
        }}>
          <Typography variant="subtitle1" fontWeight="600">
            Board Members
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Owners Section */}
        {owners.length > 0 && (
          <>
            <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                OWNERS
              </Typography>
            </Box>
            {owners.map((owner) => (
              <MenuItem 
                key={owner._id}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: 1.5
                }}>
                  <Avatar 
                    src={owner.avatar}
                    alt={owner.displayName}
                    sx={{ width: 36, height: 36 }}
                  >
                    {owner.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="500" noWrap>
                      {owner.displayName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      noWrap
                      sx={{ display: 'block' }}
                    >
                      {owner.email}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600
                    }}
                  >
                    Owner
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </>
        )}

        {/* Members Section */}
        {members.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1, bgcolor: '#f5f5f5' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                MEMBERS
              </Typography>
            </Box>
            {members.map((member) => (
              <MenuItem 
                key={member._id}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: 1.5
                }}>
                  <Avatar 
                    src={member.avatar}
                    alt={member.displayName}
                    sx={{ width: 36, height: 36 }}
                  >
                    {member.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="500" noWrap>
                      {member.displayName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      noWrap
                      sx={{ display: 'block' }}
                    >
                      {member.email}
                    </Typography>
                  </Box>
                  
                  {/* Chỉ owner mới thấy nút xóa */}
                  {isOwner && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveMember(member)
                      }}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'error.dark'
                        }
                      }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </MenuItem>
            ))}
          </>
        )}

        {/* Empty State */}
        {boardUsers?.length === 0 && (
          <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No members in this board
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  )
}

export default BoardMembersManager