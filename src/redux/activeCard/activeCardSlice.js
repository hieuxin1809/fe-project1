import { createSlice } from '@reduxjs/toolkit'

// Khởi tạo giá trị của một Slice trong redux
const initialState = {
  currentActiveCard: null,
  isShowModalActiveCard: false
}

// Khởi tạo một slice trong kho lưu trữ - redux store
export const activeCardSlice = createSlice({
  name: 'activeCard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    showModalActiveCard: (state) => {
      state.isShowModalActiveCard = true
    },

    // Clear data và đóng modal ActiveCard
    clearAndHideCurrentActiveCard: (state) => {
      state.currentActiveCard = null
      state.isShowModalActiveCard = false
    },
    // sua phan comment redux
    updateCurrentActiveCard: (state, action) => {
      const updatedCardData = action.payload

      // Ngăn chặn nếu payload là null/undefined
      if (!updatedCardData) {
        console.error('Update payload is missing or null, skipping update.')
        return
      }

      // ✨ LOGIC AN TOÀN: Hợp nhất dữ liệu mới với dữ liệu cũ
      // Điều này đảm bảo:
      // 1. Các trường cũ (như _id, columnId, boardId) KHÔNG bị mất.
      // 2. Các trường mới (như comments, title) được ghi đè.
      const mergedCard = {
        ...state.currentActiveCard, // <-- Luôn giữ lại ID và dữ liệu cũ
        ...updatedCardData          // <-- Ghi đè bằng dữ liệu mới
      }

      // Cập nhật state nếu object đã hợp nhất có ID
      if (mergedCard._id) {
        state.currentActiveCard = mergedCard
      } else {
        // Trường hợp này chỉ xảy ra nếu state ban đầu là null và payload không có ID
        console.error('Error: activeCard ID was lost during the merge process.')
      }
    },
    setCardDueDate: (state, action) => {
      const { dueDate } = action.payload
      if (!state.currentActiveCard) return
      state.currentActiveCard.dueDate = dueDate
    }
  },
  // ExtraReducers: Xử lý dữ liệu bất đồng bộ
  // eslint-disable-next-line no-unused-vars
  extraReducers: (builder) => { }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const {
  clearAndHideCurrentActiveCard,
  updateCurrentActiveCard,
  showModalActiveCard,
  setCardDueDate
} = activeCardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveCard = (state) => {
  return state.activeCard.currentActiveCard
}

export const selectIsShowModalActiveCard = (state) => {
  return state.activeCard.isShowModalActiveCard
}

// Cái file này tên là activeCardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeCardSlice.reducer
export const activeCardReducer = activeCardSlice.reducer
