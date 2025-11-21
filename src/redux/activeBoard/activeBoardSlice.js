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

// Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux
export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    return response.data
  }
)

export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      const board = action.payload
      state.currentActiveBoard = board
    },
    updateCardInBoard: (state, action) => {
      const incomingCard = action.payload
      const column = state.currentActiveBoard.columns.find(i => i._id === incomingCard.columnId)
      if (column) {
        const card = column.cards.find(i => i._id === incomingCard._id)
        if (card) {
          Object.keys(incomingCard).forEach(key => {
            card[key] = incomingCard[key]
          })
        }
      }
    },
    updateCardOrderInSameColumn: (state, action) => {
      const { columnId, cardOrderIds } = action.payload
      const column = state.currentActiveBoard.columns.find(c => c._id === columnId)
      if (column) {
        column.cardOrderIds = cardOrderIds
        column.cards = mapOrder(column.cards, cardOrderIds, '_id')
      }
    },
    moveCardInReduxState: (state, action) => {
      const { currentCardId, nextColumnId, dndOrderedColumns } = action.payload
      state.currentActiveBoard.columns = dndOrderedColumns
      state.currentActiveBoard.columnOrderIds = dndOrderedColumns.map(c => c._id)

      const nextColumn = state.currentActiveBoard.columns.find(c => c._id === nextColumnId)
      if (nextColumn) {
        const movedCard = nextColumn.cards.find(c => c._id === currentCardId)
        if (movedCard) {
          movedCard.columnId = nextColumnId
        }
      }
    },
    addNewColumnFromSocket: (state, action) => {
      const newColumn = action.payload
      state.currentActiveBoard.columns.push(newColumn)
      state.currentActiveBoard.columnOrderIds.push(newColumn._id)
    },
    addNewCardFromSocket: (state, action) => {
      const newCard = action.payload
      const column = state.currentActiveBoard.columns.find(c => c._id === newCard.columnId)
      if (column) {
        if (column.cards.some(card => card.FE_PlaceholderCard)) {
          column.cards = []
          column.cardOrderIds = []
        }
        column.cards.push(newCard)
        column.cardOrderIds.push(newCard._id)
      }
    },
    moveColumnsFromSocket: (state, action) => {
      const { dndOrderedColumns } = action.payload
      state.currentActiveBoard.columns = dndOrderedColumns
      state.currentActiveBoard.columnOrderIds = dndOrderedColumns.map(c => c._id)
    },
    updateColumnTitleFromSocket: (state, action) => {
      const updatedColumn = action.payload
      const column = state.currentActiveBoard.columns.find(c => c._id === updatedColumn._id)
      if (column) {
        Object.keys(updatedColumn).forEach(key => {
          column[key] = updatedColumn[key]
        })
      }
    },
    removeColumnFromSocket: (state, action) => {
      const { columnId } = action.payload
      state.currentActiveBoard.columns = state.currentActiveBoard.columns.filter(c => c._id !== columnId)
      state.currentActiveBoard.columnOrderIds = state.currentActiveBoard.columnOrderIds.filter(id => id !== columnId)
    },
    addNewMemberToBoard: (state, action) => {
      const { boardId, newMember } = action.payload
      if (state.currentActiveBoard && state.currentActiveBoard._id === boardId) {
        const memberExists = state.currentActiveBoard.members.some(m => m._id === newMember._id)
        if (!memberExists) {
          state.currentActiveBoard.members.push(newMember)
        }
        const allUserExists = state.currentActiveBoard.FE_allUsers.some(u => u._id === newMember._id)
        if (!allUserExists) {
          state.currentActiveBoard.FE_allUsers.push(newMember)
        }
      }
    },
    
    // ✨ ACTION MỚI: Thêm Label vào Board
    addLabelToBoard: (state, action) => {
      if (state.currentActiveBoard) {
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
      } // <--- ĐÃ SỬA: Đóng ngoặc IF
    },  // <--- ĐÃ SỬA: Đóng ngoặc Function và thêm dấu phẩy
    
    // ✨ ACTION MỚI: Xóa Member khỏi Board
    removeMemberFromBoard: (state, action) => {
      const { boardId, userId } = action.payload
      if (state.currentActiveBoard && state.currentActiveBoard._id === boardId) {
        // 1. Xóa user khỏi mảng members
        state.currentActiveBoard.members = state.currentActiveBoard.members.filter(
          m => m._id !== userId
        )
        // 2. Xóa user khỏi mảng FE_allUsers
        state.currentActiveBoard.FE_allUsers = state.currentActiveBoard.FE_allUsers.filter(
          u => u._id !== userId
        )
      }
    }
  }, // <--- Đóng reducers

  // ExtraReducers: Nơi xử lý dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      let board = action.payload
      board.FE_allUsers = board.owners.concat(board.members)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')

      board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        } else {
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })
      state.currentActiveBoard = board
    })
  }
})

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
  deleteLabelFromBoard,
  removeMemberFromBoard
} = activeBoardSlice.actions

export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

export const activeBoardReducer = activeBoardSlice.reducer