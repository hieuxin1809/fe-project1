import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '~/redux/user/userSlice'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi' // Import locale tiếng Việt

dayjs.extend(relativeTime)
dayjs.locale('vi') // Set ngôn ngữ hiển thị thời gian

function CardActivitySection({ cardComments = [], onAddCardComment }) {
  const currentUser = useSelector(selectCurrentUser)

  const handleAddComment = (event) => {
    // Xử lý logic Enter để gửi comment như cũ
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!event.target.value) return
      
      onAddCardComment(event.target.value.trim())
      event.target.value = ''
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Ô input nhập comment */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {/* <Avatar
          sx={{ width: 36, height: 36, cursor: 'pointer' }}
          alt="User Avatar"
          src={currentUser?.avatar}
        /> */}
        <TextField
          size='small'
          fullWidth
          placeholder="Viết bình luận..."
          type="text"
          variant="outlined"
          multiline
          onKeyDown={handleAddComment}
        />
      </Box>

      {/* Danh sách Log & Comment */}
      {cardComments.length === 0 && (
        <Typography sx={{ pl: 5, fontSize: '14px', fontWeight: '500', color: '#b6b6b6' }}>
          Chưa có hoạt động nào!
        </Typography>
      )}

      {cardComments.map((comment, index) => {
        // ✨ LOGIC HIỂN THỊ KHÁC BIỆT Ở ĐÂY ✨
        if (comment.isActivityLog) {
          // === GIAO DIỆN CHO LOG (ACTIVITY) ===
          return (
            <Box key={index} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
              {/* Avatar nhỏ hơn */}
              <Avatar
                alt={comment.userDisplayName}
                src={comment.userAvatar}
                sx={{ width: 32, height: 32 }} 
              />
              <Typography component="span" sx={{ fontSize: '13px', color: 'text.secondary' }}>
                <span style={{ fontWeight: 'bold', color: '#172b4d' }}>{comment.userDisplayName}</span> {comment.content}
                <Typography component="span" sx={{ fontSize: '12px', color: '#8f96a3', ml: 1 }}>
                  {dayjs(comment.commentedAt).fromNow()}
                </Typography>
              </Typography>
            </Box>
          )
        } 
        
        // === GIAO DIỆN CHO COMMENT THƯỜNG (CHAT) ===
        return (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar
              alt={comment.userDisplayName}
              src={comment.userAvatar}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 'bold', color: '#172b4d' }}>
                {comment.userDisplayName}
                <Typography component="span" sx={{ fontSize: '12px', color: '#5e6c84', ml: 1 }}>
                   {dayjs(comment.commentedAt).fromNow()}
                </Typography>
              </Typography>

              <Box sx={{
                display: 'inline-block',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2c3e50' : '#f4f5f7', // Màu nền bubble
                padding: '8px 12px',
                borderRadius: '8px',
                color: (theme) => theme.palette.mode === 'dark' ? '#ecf0f1' : '#172b4d',
                mt: 0.5,
                boxShadow: '0 1px 1px rgba(9,30,66,.25)' // Đổ bóng nhẹ
              }}>
                <Typography sx={{ fontSize: '14px' }}>
                  {comment.content}
                </Typography>
              </Box>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default CardActivitySection