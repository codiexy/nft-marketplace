import { Grid, TextField, Typography } from '@mui/material'
import React from 'react'
import { StepProps } from './type'

function Step1({ useFormData, errors }: StepProps) {

    const [formData, setFormData] = useFormData();
    return (
        <Grid item md={10} sx={{ mt: 4 }}>
            <TextField
                error={Boolean(errors.name)}
                name="name"
                required
                fullWidth
                id="campaign-name"
                value={formData.name}
                variant="outlined"
                onChange={(e) => setFormData({ ...formData, name: e.target.value})}  
                label="Campaign Name"
                size='small'
                helperText={<Typography component="span" color="red">{errors.name}</Typography>}
            />
        </Grid>
    )
}

export default Step1