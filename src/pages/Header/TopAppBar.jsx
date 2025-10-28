import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip } from "@mui/material";
import theme from "../../theme";
import AppsIcon from "@mui/icons-material/Apps";
import { ReactComponent as TrelloIcon } from "../../assets/trello.svg";
import SvgIcon from "@mui/material/SvgIcon";
import Workspaces from "./menus/Workspaces";
import Recent from "./menus/Recent";
import Starred from "./menus/Starred";
import Templates from "./menus/Templates";
import Profiles from "./menus/Profiles";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function TopAppBar({ onMenuClick }) {
  return (
    <Box sx={{
      px: 2,
      backgroundColor: theme.palette.white.main,
      width: "100%",
      height: { xs: 48, sm: 56 },
      position: "fixed",
      top: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      overflowX: 'auto',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AppsIcon sx={{ color: theme.palette.primary.main }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SvgIcon component={TrelloIcon} inheritViewBox />
          <Typography variant="span" sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: theme.palette.primary.main }}>Trello</Typography>
        </Box>
        <Box sx={{ display: {xs: 'none', md: 'flex'}, gap: 2 }}>
          <Workspaces />
          <Recent />
          <Starred />
          <Templates />
          <Button variant="outlined">Create</Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField id="outlined-search" label="Search..." type="search" size="small" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: '120px'}} />
        <Tooltip title="Notifications" >
          <Badge color="secondary" variant="dot" invisible={false} sx={{ cursor: 'pointer' }}>
            <NotificationsNoneIcon />
          </Badge>
        </Tooltip>
        <Tooltip title="Helps" >
          <IconButton aria-label="Helps">
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
        <Profiles />
      </Box>
    </Box>
  );
}
