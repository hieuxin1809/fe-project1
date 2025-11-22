import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DownloadIcon from '@mui/icons-material/Download'
import moment from 'moment'

/**
 * Tạo URL download qua Backend Proxy
 * @param {string} cardId - ID của card
 * @param {string} attachmentId - ID của attachment
 * @returns {string} - URL download qua proxy
 */
const generateDownloadUrl = (cardId, attachmentId) => {
    // API endpoint sẽ trả về file với Content-Disposition header đúng
    return `http://localhost:8017/v1/cards/${cardId}/attachments/${attachmentId}/download`
}

function CardAttachmentList({ attachments = [], cardId }) {  // 👈 thêm cardId vào đây
  if (!attachments.length) return null;

  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AttachFileIcon />
        <Typography variant="span" sx={{ fontWeight: '600', fontSize: '18px' }}>
          Attachments ({attachments.length})
        </Typography>
      </Box>

      {attachments.map((attachment) => {
        // DÙNG cardId từ props (activeCard._id)
        const downloadUrl = generateDownloadUrl(cardId, attachment._id);
        console.log('✅ Download URL:', downloadUrl);

        return (
          <Box
            key={attachment._id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? '#33485D'
                  : theme.palette.grey[100],
              borderRadius: '4px',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '#3d5571'
                    : theme.palette.grey[200],
              },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {attachment.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Uploaded {moment(attachment.uploadedAt).format('lll')}
              </Typography>
            </Box>

            <Link
              href={downloadUrl}
              download={attachment.fileName}
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                ml: 2,
                flexShrink: 0,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              <DownloadIcon fontSize="small" />
              Download
            </Link>
          </Box>
        );
      })}
    </Box>
  );
}


export default CardAttachmentList