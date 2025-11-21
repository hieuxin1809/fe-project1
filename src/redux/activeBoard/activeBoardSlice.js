import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

// Khởi tạo giá trị State của một cái Slice trong redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
    return response.data
  }
)

// Khởi tạo một cái Slice trong kho lưu trữ - Redux Store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: Nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây luôn luôn cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1 dòng, đây là rule của Redux
    // https://redux-toolkit.js.org/usage/immer-reducers#mutating-and-returning-state
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết...
      // ...

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      // Update nested data
      // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
      const incomingCard = action.payload

      // Tìm dần từ board > column > card
      const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if (card) {
          // card.title = incomingCard.title
          // card['title'] = incomingCard['title']
          /**
           * Giải thích đoạn dưới, các bạn mới lần đầu sẽ dễ bị lú :D
           * Đơn giản là dùng Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array rồi forEach nó ra.
           * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào card luôn như bên dưới.
          */
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
          console.log('REDUX SUCCESS: Card updated in column', column._id);
        }
      }
    },
    updateCardOrderInSameColumn: (state, action) => { // <<< Tên action mới
      const { columnId, cardOrderIds } = action.payload

      const column = state.currentActiveBoard.columns.find(c => c._id === columnId)
      if (column) {
        column.cardOrderIds = cardOrderIds
        // Cập nhật lại mảng cards dựa trên thứ tự ID mới
        column.cards = mapOrder(column.cards, cardOrderIds, '_id')
      }
    },
    moveCardInReduxState: (state, action) => {
      const { currentCardId, nextColumnId, dndOrderedColumns } = action.payload

      // 1. Cập nhật lại toàn bộ mảng columns và columnOrderIds
      // (Vì dữ liệu gửi qua socket đã là state columns mới nhất sau DND)
      state.currentActiveBoard.columns = dndOrderedColumns
      state.currentActiveBoard.columnOrderIds = dndOrderedColumns.map(c => c._id)

      // 2. Cập nhật trường columnId mới cho Card bị di chuyển
      const nextColumn = state.currentActiveBoard.columns.find(c => c._id === nextColumnId)
      if (nextColumn) {
        // Tìm Card trong cột mới để cập nhật columnId
        const movedCard = nextColumn.cards.find(c => c._id === currentCardId)
        if (movedCard) {
          movedCard.columnId = nextColumnId
        }
      }
    },
    addNewColumnFromSocket: (state, action) => {
      const newColumn = action.payload

      // Logic tương tự như trong ListColumns.jsx: Thêm vào cuối mảng
      state.currentActiveBoard.columns.push(newColumn)
      state.currentActiveBoard.columnOrderIds.push(newColumn._id)
    },

    // ✨ NEW REDUCER: Thêm Card nhận được qua Socket
    addNewCardFromSocket: (state, action) => {
      const newCard = action.payload

      // 1. Tìm Column đích
      const column = state.currentActiveBoard.columns.find(c => c._id === newCard.columnId)
      if (column) {
        // 2. Nếu Column rỗng (đang có placeholder card), xóa nó đi
        if (column.cards.some(card => card.FE_PlaceholderCard)) {
          column.cards = []
          column.cardOrderIds = []
        }

        // 3. Thêm Card mới vào cuối mảng
        column.cards.push(newCard)
        column.cardOrderIds.push(newCard._id)
      }
    },
    moveColumnsFromSocket: (state, action) => {
      const { dndOrderedColumns } = action.payload

      // Cập nhật lại toàn bộ mảng columns và columnOrderIds
      state.currentActiveBoard.columns = dndOrderedColumns
      state.currentActiveBoard.columnOrderIds = dndOrderedColumns.map(c => c._id)
    },
    updateColumnTitleFromSocket: (state, action) => {
      const updatedColumn = action.payload
      const column = state.currentActiveBoard.columns.find(c => c._id === updatedColumn._id)

      if (column) {
        // Cập nhật tất cả các trường (Title, etc.)
        Object.keys(updatedColumn).forEach(key => {
          column[key] = updatedColumn[key]
        })
      }
    },
    removeColumnFromSocket: (state, action) => {
      const { columnId } = action.payload

      // Xử lý xóa column khỏi mảng columns
      state.currentActiveBoard.columns = state.currentActiveBoard.columns.filter(c => c._id !== columnId)

      // Xử lý xóa columnId khỏi mảng columnOrderIds
      state.currentActiveBoard.columnOrderIds = state.currentActiveBoard.columnOrderIds.filter(id => id !== columnId)
    },
    addNewMemberToBoard: (state, action) => {
      const { boardId, newMember } = action.payload

      // Chỉ thêm nếu đây là Board đang được mở (đảm bảo state không null)
      if (state.currentActiveBoard && state.currentActiveBoard._id === boardId) {

        // 1. Thêm User vào mảng members (nếu chưa tồn tại)
        const memberExists = state.currentActiveBoard.members.some(m => m._id === newMember._id)
        if (!memberExists) {
          state.currentActiveBoard.members.push(newMember)
        }

        // 2. Thêm User vào mảng FE_allUsers (nếu bạn dùng mảng này để hiển thị)
        const allUserExists = state.currentActiveBoard.FE_allUsers.some(u => u._id === newMember._id)
        if (!allUserExists) {
          state.currentActiveBoard.FE_allUsers.push(newMember)
        }
      }
    },
    // ✨ ACTION MỚI: Thêm Label vào Board
    addLabelToBoard: (state, action) => {
      if (state.currentActiveBoard) {
        // Nếu chưa có mảng labels thì tạo mới
        if (!state.currentActiveBoard.labels) state.currentActiveBoard.labels = []
        state.currentActiveBoard.labels.push(action.payload)
      }
    },
    // ✨ ACTION MỚI: Cập nhật Label trong Board
    updateLabelInBoard: (state, action) => {
      if (state.currentActiveBoard && state.currentActiveBoard.labels) {
        const updatedLabel = action.payload
        const index = state.currentActiveBoard.labels.findIndex(l => l._id === updatedLabel._id)
        if (index !== -1) {
          state.currentActiveBoard.labels[index] = updatedLabel
        }
      }
    },
    // ✨ ACTION MỚI: Xóa Label khỏi Board
    deleteLabelFromBoard: (state, action) => {
      if (state.currentActiveBoard && state.currentActiveBoard.labels) {
        const labelId = action.payload
        state.currentActiveBoard.labels = state.currentActiveBoard.labels.filter(l => l._id !== labelId)
    },
    removeMemberFromBoard: (state, action) => {
      const { boardId, userId } = action.payload

      // Chỉ cập nhật nếu đây là board đang mở
      if (state.currentActiveBoard && state.currentActiveBoard._id === boardId) {
        
        // 1. Xóa user khỏi mảng members (nếu có)
        state.currentActiveBoard.members = state.currentActiveBoard.members.filter(
          m => m._id !== userId
        )

        // 2. Xóa user khỏi mảng FE_allUsers (để UI cập nhật)
        state.currentActiveBoard.FE_allUsers = state.currentActiveBoard.FE_allUsers.filter(
          u => u._id !== userId
        )
      }
    }
  },
  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // action.payload ở dây chính là cái response.data trả về ở trên
      let board = action.payload

      // Thành viên trong cái board sẽ là gộp lại của 2 mảng owners và members
      board.FE_allUsers = board.owners.concat(board.members)

      // Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71 đã giải thích lý do ở phần Fix bug quan trọng)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        // Khi f5 trang web thì cần xử lý vấn đề kéo thả vào một column rỗng (Nhớ lại video 37.2, code hiện tại là video 69)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          // Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71 đã giải thích lý do ở phần Fix bug quan trọng)
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Action creators are generated for each case reducer function
// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions đâu cả, bởi vì những cái actions này đơn giản là được thằng redux tạo tự động theo tên của reducer nhé.
export const {
  updateCurrentActiveBoard,
  updateCardInBoard,
  moveCardInReduxState,
  updateCardOrderInSameColumn,
  addNewColumnFromSocket,
  addNewCardFromSocket,
  moveColumnsFromSocket,
  removeColumnFromSocket,
  addNewMemberToBoard,
  updateColumnTitleFromSocket,
  
  addLabelToBoard,
  updateLabelInBoard,
  deleteLabelFromBoard
} = activeBoardSlice.actions
  removeMemberFromBoard
  } = activeBoardSlice.actions

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, mọi người lưu ý :D
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
