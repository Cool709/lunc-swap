import React, { useContext } from "react";
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from '@mui/material/OutlinedInput';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InputAdornment from '@mui/material/InputAdornment';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { useHistory } from "react-router-dom";

import { ThemeConfig } from "../context/index";
import { SlippageList, TxFeeList } from "../config";

const Home = () => {
    const history = useHistory();
    const { Slippage, txFee, setSlippage, setTxFee } = useContext(ThemeConfig);

    return (
        <Stack
            sx={{
                width: theme => theme.isMobile ? '100%' : theme.isTablet ? '80%' : '60%',
                height: '100%',
                mt: theme => theme.isMobile ? 15 : 20
            }}
            direction='row'
            justifyContent={'center'}
        >
            <Stack>
                <Stack
                    sx={{
                        boxShadow: '0px 2px 24px 0px #a3b4c9',
                        background: theme => theme.colors.white,
                        borderRadius: 3,
                        p: 3,
                        width: theme => theme.isMobile ? '100%' : '450px'
                    }}
                    spacing={2}
                >
                    <Stack direction='row' alignItems='center' justifyContent={'space-between'}>
                        <Stack direction='row' alignItems='center'>
                            <IconButton
                                onClick={() => history.goBack()}
                                sx={{
                                    ml: -1,
                                    '& svg': {
                                        color: 'black',
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography sx={{ color: 'black', fontWeight: 'bold' }} >
                                Slippage
                            </Typography>
                        </Stack>
                        <IconButton
                            onClick={() => history.goBack()}
                        >
                            <CloseOutlinedIcon />
                        </IconButton>
                    </Stack>

                    <Stack spacing={0.5}>
                        <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: 13 }}>
                            Slippage Tolerance
                        </Typography>
                        <Stack direction='row' alignItems='center' spacing={1.5}>
                            <OutlinedInput
                                type="number"
                                id="outlined-adornment-weight"
                                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                                aria-describedby="outlined-weight-helper-text"
                                sx={{
                                    borderRadius: 10,
                                    height: 45,
                                    fontSize: 14,
                                    '& input': {
                                        background: 'transparent',
                                        pl: 2
                                    }
                                }}
                                placeholder={Slippage}
                                onChange={(e) => setSlippage(e.target.value)}
                            />
                            {
                                SlippageList.map((item, index) => (
                                    <Button
                                        key={index}
                                        variant='outlined'
                                        onClick={() => setSlippage(item)}
                                        sx={{
                                            background: theme => Slippage == item ? theme.colors.blue : theme.colors.bg,
                                            borderRadius: 10,
                                            height: 40,
                                            color: theme => Slippage == item ? theme.colors.white : theme.colors.text2,
                                            minWidth: 10,
                                            '&:hover': {
                                                color: theme => theme.colors.text2
                                            }
                                        }}
                                    >
                                        {item}%
                                    </Button>
                                ))
                            }
                        </Stack>
                    </Stack>

                    <Stack spacing={0.5}>
                        <Typography sx={{ color: 'black', fontWeight: 'bold', fontSize: 13 }}>
                            Transaction Fee
                        </Typography>
                        <Stack direction='row' alignItems='center' spacing={2}>
                            {
                                TxFeeList.map((item, index) => (
                                    <Button
                                        key={index}
                                        variant='outlined'
                                        onClick={() => setTxFee(item)}
                                        sx={{
                                            background: theme => item.title == txFee.title ? theme.colors.blue : theme.colors.bg,
                                            borderRadius: 10,
                                            height: 40,
                                            color: theme => item.title == txFee.title ? theme.colors.white : theme.colors.text2,
                                            width: '100%',
                                            '&:hover': {
                                                color: theme => theme.colors.text2
                                            }
                                        }}
                                    >
                                        {item.title}
                                    </Button>
                                ))
                            }
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Stack >
    )
}

export default Home;