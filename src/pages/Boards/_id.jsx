import { useEffect } from 'react'
import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'
import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'
import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard,
  moveCardInReduxState,
  updateCardOrderInSameColumn,
  addNewColumnFromSocket,
  addNewCardFromSocket,
  moveColumnsFromSocket,
  removeColumnFromSocket,
  addNewMemberToBoard,
  updateColumnTitleFromSocket
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useParams , useNavigate } from 'react-router-dom'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import ActiveCard from '~/components/Modal/ActiveCard/ActiveCard'
import { socketIoInstance } from '~/socketClient'
import { selectCurrentUser } from '~/redux/user/userSlice' // <-- 3. Import selector
import { toast } from 'react-toastify' // <-- 4. Import toast


function Board() {
  const dispatch = useDispatch()
  const navigate = useNavigate() // <-- 5. Khởi tạo navigate
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard)
  const currentUser = useSelector(selectCurrentUser) // <-- 6. Lấy user hiện tại

  const { boardId } = useParams()

  useEffect(() => {
    // Call API
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])

  /**
   * Func này có nhiệm vụ gọi API và xử lý khi kéo thả Column xong xuôi
   * Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong board)
   */
  const moveColumns = (dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    /**
    * Trường hợp dùng Spread Operator này thì lại không sao bởi vì ở đây chúng ta không dùng push như ở trên làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi :))
    */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Board
    updateBoardDetailsAPI(newBoard._id, { columnOrderIds: dndOrderedColumnsIds })
    if (board?._id) {
        socketIoInstance.emit('FE_COLUMN_MOVE', {
            boardId: board._id,
            dndOrderedColumns: dndOrderedColumns // Gửi toàn bộ mảng cột mới
        })
    }
  }

  /**
   * Khi di chuyển card trong cùng Column:
   * Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
   */
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardIds, columnId) => {
    // Update cho chuẩn dữ liệu state Board

    /**
    * Cannot assign to read only property 'cards' of object
    * Trường hợp Immutability ở đây đã đụng tới giá trị cards đang được coi là chỉ đọc read only - (nested object - can thiệp sâu dữ liệu)
    */
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board)
    const columnToUpdate = newBoard.columns.find(column => column._id === columnId)
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards
      columnToUpdate.cardOrderIds = dndOrderedCardIds
    }
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API update Column
    updateColumnDetailsAPI(columnId, { cardOrderIds: dndOrderedCardIds })
    if (board?._id) {
        socketIoInstance.emit('FE_MOVE_CARD_IN_COLUMN', {
            boardId: board._id,
            columnId: columnId,
            cardOrderIds: dndOrderedCardIds
        })
    }
  }

  /**
   * Khi di chuyển card sang Column khác:
   * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   * => Làm một API support riêng.
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    // Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)

    // Tương tự đoạn xử lý chỗ hàm moveColumns nên không ảnh hưởng Redux Toolkit Immutability gì ở đây cả.
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    // setBoard(newBoard)
    dispatch(updateCurrentActiveBoard(newBoard))

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE. (Nhớ lại video 37.2)
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
    if (board?._id) {
        socketIoInstance.emit('FE_MOVE_CARD_UPDATED', {
            boardId: board._id,
            currentCardId,
            prevColumnId,
            nextColumnId,
            dndOrderedColumns // Gửi toàn bộ mảng cột đã được sắp xếp lại
        })
    }
  }
  useEffect(() => {
    // Ngăn chặn logic Socket chạy khi board chưa load xong
    if (!board?._id) return

    // ✨ LOGIC LẮNG NGHE SOCKET MOVE CARD GIỮA CỘT
    const onReceiveCardMove = (moveData) => {
        // Kiểm tra: Đảm bảo sự kiện thuộc Board hiện tại đang mở
        if (moveData.boardId === board._id) {
            dispatch(moveCardInReduxState(moveData)) 
        }
    }
    
    // ✨ LOGIC LẮNG NGHE SOCKET MOVE CARD TRONG CÙNG CỘT
    const onReceiveCardMoveInColumn = (moveData) => {
        if (moveData.boardId === board._id) {
            
            // KHÔNG CẦN TÁI TẠO newDndOrderedColumns PHỨC TẠP
            // Dùng ngay action updateCardOrderInSameColumn mà bạn đã tạo!
            dispatch(updateCardOrderInSameColumn({ 
                columnId: moveData.columnId,
                cardOrderIds: moveData.cardOrderIds
            }))
        }
    }
    const onReceiveNewColumn = (newColumn) => {
        if (newColumn.boardId === board._id) {
            dispatch(addNewColumnFromSocket(newColumn))
        }
    }
    
    // ✨ LOGIC LẮNG NGHE TẠO CARD
    const onReceiveNewCard = (newCard) => {
        if (newCard.boardId === board._id) {
            dispatch(addNewCardFromSocket(newCard))
        }
    }
    const onReceiveColumnMove = (data) => {
        if (data.boardId === board._id) {
            dispatch(moveColumnsFromSocket(data))
        }
    }

    const onReceiveColumnRemove = (data) => {
        if (data.boardId === board._id) {
            dispatch(removeColumnFromSocket(data))
        }
    }

    const onReceiveNewMember = (data) => {
        // Chỉ cập nhật nếu sự kiện thuộc Board hiện tại đang mở
        if (data.boardId === board._id) {
            dispatch(addNewMemberToBoard(data))
        }
    }

    // ✨ LOGIC LẮNG NGHE CẬP NHẬT COLUMN TITLE
    const onReceiveColumnUpdate = (updatedColumn) => {
        if (updatedColumn.boardId === board._id) {
            dispatch(updateColumnTitleFromSocket(updatedColumn))
        }
    }
    const onMemberRemoved = (data) => {
      // Dispatch action để cập nhật Redux
      const { boardId, userId } = data

      // 7. Luôn dispatch để cập nhật UI (danh sách) cho TẤT CẢ mọi người
      dispatch(removeMemberFromBoard({ boardId, userId }))

      // 8. KIỂM TRA NẾU NGƯỜI BỊ ĐÁ LÀ MÌNH
      if (currentUser && currentUser._id === userId) {
        toast.warning('Bạn vừa bị xóa khỏi board này!', { autoClose: 3000 })
        // Điều hướng về trang chủ
        navigate('/')
      }
    }


    // Đăng ký Listener
    socketIoInstance.on('BE_CARD_WAS_MOVED', onReceiveCardMove)
    socketIoInstance.on('BE_MOVE_CARD_IN_COLUMN', onReceiveCardMoveInColumn)
    socketIoInstance.on('BE_COLUMN_CREATED', onReceiveNewColumn) 
    socketIoInstance.on('BE_CARD_CREATED', onReceiveNewCard)
    socketIoInstance.on('BE_COLUMN_MOVED', onReceiveColumnMove)
    socketIoInstance.on('BE_COLUMN_REMOVED', onReceiveColumnRemove)
    socketIoInstance.on('BE_MEMBER_ADDED_TO_BOARD', onReceiveNewMember)
    socketIoInstance.on('BE_COLUMN_UPDATED', onReceiveColumnUpdate)
    socketIoInstance.on('BE_MEMBER_REMOVED_FROM_BOARD', onMemberRemoved)


    // Clean Up event
    return () => {
        socketIoInstance.off('BE_CARD_WAS_MOVED', onReceiveCardMove)
        socketIoInstance.off('BE_MOVE_CARD_IN_COLUMN', onReceiveCardMoveInColumn)
        socketIoInstance.off('BE_COLUMN_CREATED', onReceiveNewColumn)
        socketIoInstance.off('BE_CARD_CREATED', onReceiveNewCard)
        socketIoInstance.off('BE_COLUMN_MOVED', onReceiveColumnMove)
        socketIoInstance.off('BE_COLUMN_REMOVED', onReceiveColumnRemove)
        socketIoInstance.off('BE_MEMBER_ADDED_TO_BOARD', onReceiveNewMember)
        socketIoInstance.off('BE_COLUMN_UPDATED', onReceiveColumnUpdate)
        socketIoInstance.off('BE_MEMBER_REMOVED_FROM_BOARD', onMemberRemoved)
    }
}, [dispatch, board?._id,currentUser, navigate])

  if (!board) {
    return <PageLoadingSpinner caption="Loading Board..." />
  }

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      {/* Modal Active Card, check đóng/mở dựa theo cái State isShowModalActiveCard lưu trong Redux */}
      <ActiveCard />

      {/* Các thành phần còn lại của Board Details */}
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        // 3 cái trường hợp move dưới đây thì giữ nguyên để code xử lý kéo thả ở phần BoardContent không bị quá dài mất kiểm soát khi đọc code, maintain.
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
