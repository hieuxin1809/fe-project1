let apiRoot = ''
// console.log('import.meta.env: ', import.meta.env)
// console.log('process.env: ', process.env)

// Môi trường Dev sẽ chạy localhost với port 8017
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}

// Môi trường Production sẽ cần api endpoint chuẩn của các bạn
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://trello-api-0gbu.onrender.com'
}
// console.log('🚀 ~ file: constants.js:7 ~ apiRoot:', apiRoot)
export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}

export const LABEL_COLORS = [
  { color: '#2196f3', name: 'Blue' },      // Xanh dương
  { color: '#4caf50', name: 'Green' },     // Xanh lá
  { color: '#ff9800', name: 'Orange' },    // Cam
  { color: '#f44336', name: 'Red' },       // Đỏ
  { color: '#9c27b0', name: 'Purple' },    // Tím
  { color: '#607d8b', name: 'Blue Grey' }, // Xám xanh
  { color: '#795548', name: 'Brown' },     // Nâu
  { color: '#e91e63', name: 'Pink' },      // Hồng
  { color: '#009688', name: 'Teal' }       // Xanh ngọc
]
