import InputBase from '@mui/material/InputBase';
import { styled } from '@mui/material/styles';

export const CustomInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        borderRadius: 8,
        position: 'relative',
        border: 'none',
        fontSize: 26,
        width: '100%',
        padding: '0px',
        fontWeight: 'bold',
        color: 'white',
        background: 'transparent'
    }
}));