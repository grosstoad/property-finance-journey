import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  styled, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';

const Logo = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontWeight: 700,
  cursor: 'pointer',
  color: theme.palette.primary.contrastText,
}));

const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  color: theme.palette.primary.contrastText,
}));

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems: NavItem[] = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Deposit Calculator', path: '/calculator', icon: <CalculateIcon /> },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        Property Finance
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton 
              sx={{ 
                textAlign: 'center',
                backgroundColor: location.pathname === item.path ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
              }}
              onClick={() => handleNavigate(item.path)}
            >
              <Box sx={{ mr: 1 }}>{item.icon}</Box>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Logo variant="h6" onClick={() => handleNavigate('/')}>
            Property Finance
          </Logo>
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => handleNavigate(item.path)}
                  variant={location.pathname === item.path ? "contained" : "text"}
                  color={location.pathname === item.path ? "secondary" : "inherit"}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}; 