import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import React from 'react'
import { StepProps } from './type'

function Step2({ useFormData, errors }: StepProps) {

    const [formData, setFormData] = useFormData();

    return (
        <Grid item md={10} sx={{ mt: 4 }}>
            <TextField
                error={Boolean(errors.group)}
                name='group'
                required
                fullWidth
                id="group-name"
                value={formData.group}
                variant="outlined"
                onChange={(e) => setFormData({ ...formData, group: e.target.value})}  
                label="Group Name"
                size='small'
                helperText={<Typography component="span" color="red">{errors.group}</Typography>}
            />
        </Grid>
    )
}

export default Step2