import { useLoading } from '../context/LoadingContext';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  return isLoading ? (
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress sx={{ color: '#4B8EC9' }} size={60} />
    </Box>
  ) : null;
};

export default LoadingSpinner;