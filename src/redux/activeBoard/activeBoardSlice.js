import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from "axios";
import { API_ROOT } from "~/utils/constants";
import { mapOrder } from '../../utils/sort';
import { isEmpty } from 'lodash';
import { generatePlaceholderCard } from '../../utils/formatter';

// khởi tao giá trị state của 1 cái Slice trong redux toolkit
const initialState = {
  currentActiveBoard: null
}
// các hành động gọi api bất đồng bộ 

export const fetchBoardDetailsAPI = createAsyncThunk(
  'activeBoard/fetchBoardDetailsAPI',
  async (boardId) => {
    const res = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
    return res.data;
  }
)
// khởi tạo 1 slice trong kho lưu trữ redux store 
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // nơi xử lý dữ liệu đồng bộ 
  reducers: {
    updateCurrentActiveBoard: (state,action) => {
    // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer , ở đấy chúng ta gán nó ra 1 biến có nghĩa hơn 
      let board = action.payload

      // xử lý dữ liệu nếu cần thiết 
      // ....


      // update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    }
  },
  extraReducers : (builder) => {
    builder.addCase(fetchBoardDetailsAPI.fulfilled,(state,action) => {
      // action.payload ở đây chính là cái res.data trả về ở trên
        const board = action.payload

        board.columns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
        board.columns.forEach((column) => {
          if (isEmpty(column.cards)) {
            column.cards = [generatePlaceholderCard(column)];
            column.cardOrderIds = [generatePlaceholderCard(column)._id];
          } else {
            column.cards = mapOrder(column?.cards, column?.cardOrderIds, "_id");
          }
        });

      // update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board

    })
  }
})

// action là nơi dành cho các component bên dưới gọi bằng dispatch tới nó để cập nhật lại dữ liệu 
// thông qua reducer
//để ý  ở trên thì không thấy properties action đâu cả , bởi vì những action này đơn giản là được thằng redux tạo tự động theo tên của reducer 
export const { updateCurrentActiveBoard } = activeBoardSlice.actions

// selecetors
// selector là nơi dành cho các component bên dưới gọi bằng hook useSelector để lấy dữ liệu từ trongkho redux store ra sử dụng 
export const selectCurrentActiveBoard = (state) =>{
    return state.activeBoard.currentActiveBoard
}
// các tên file là activeBoardSlice nhưng chúng ta sẽ export 1 thứ tên là Reducer
//export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer
