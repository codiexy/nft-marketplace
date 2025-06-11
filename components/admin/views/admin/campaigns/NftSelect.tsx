import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { ErrorProps, FormDataProps, StepProps } from './type';
import { getAllItems } from 'services';
import { Typography } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export default function NftSelect({ useFormData, errors }: StepProps) {
    const [formData, setFormData] = useFormData();
    const [nfts, setNfts] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const handleChange = (event: SelectChangeEvent<typeof formData.nfts>) => {
        const value = event.target.value;
        setFormData({
            ...formData,
            nfts: typeof value === 'string' ? value.split(',') : value
        });
    };

    React.useEffect(() => {
        (async () => {
            setIsLoading(true);
            const AllNfts: any = await getAllItems({
                sort: { "createdAt": -1 },
                status: "publish,on_sale,on_auction"
            });
            setNfts(AllNfts);
            setIsLoading(false);
        })();
    }, [])

    return (
        <FormControl size='small' fullWidth sx={{ mt: 5 }}>
            <InputLabel id="campaign-nft-label">Nfts</InputLabel>
            <Select
                error={Boolean(errors.nfts)}
                labelId="campaign-nft-label"
                id="campain-nft"
                multiple
                value={formData.nfts}
                onChange={handleChange}
                input={<OutlinedInput label="Nfts" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
                size='small'
                variant="outlined"
            >
                {nfts.map((nft: any) => (
                    <MenuItem key={nft.id} value={nft.name}>
                        <Checkbox checked={formData.nfts.indexOf(nft.name) > -1} />
                        <ListItemText primary={nft.name} />
                    </MenuItem>
                ))}
            </Select>
            <Typography color="red">{errors.nfts}</Typography>
        </FormControl>
    );
}