import { Fab, FormControl, FormControlLabel, FormGroup, FormHelperText, Grid, InputLabel, MenuItem, OutlinedInput, Select, Switch, TextField, Typography } from '@mui/material'
import React, { useRef } from 'react'
import { StepProps } from './type'
import NftSelect from './NftSelect'
import { MdAddCircleOutline } from 'react-icons/md';

function Step3({ useFormData, errors }: StepProps) {

    const [formData, setFormData] = useFormData();
    const fileRef = useRef<any>(null);

    const handleFile = () => {
        setFormData({ ...formData, file: fileRef.current?.files[0] || null })
    }

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <TextField
                    error={Boolean(errors.title)}
                    required
                    fullWidth
                    id="campaign-title"
                    label="Title"
                    name='title'
                    defaultValue={formData.title}
                    variant="outlined"
                    onChange={handleChange}
                    size='small'
                    helperText={<Typography component="span" color="red">{errors.title}</Typography>}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <TextField
                    error={Boolean(errors.description)}
                    required
                    fullWidth
                    id="campaign-description"
                    label="Description"
                    defaultValue={formData.description}
                    variant="outlined"
                    name='description'
                    onChange={handleChange}
                    size='small'
                    helperText={<Typography component="span" color="red">{errors.description}</Typography>}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <TextField
                    error={Boolean(errors.button_text)}
                    required
                    fullWidth
                    id="campaign-button-text"
                    label="Button Text"
                    defaultValue={formData.button_text}
                    variant="outlined"
                    name='button_text'
                    onChange={handleChange}
                    size='small'
                    helperText={<Typography component="span" color="red">{errors.button_text}</Typography>}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <TextField
                    error={Boolean(errors.redirection_link)}
                    required
                    fullWidth
                    id="campaign-redirect-url"
                    label="Redirection Url"
                    defaultValue={formData.redirection_link}
                    variant="outlined"
                    name='redirection_link'
                    onChange={handleChange}
                    size='small'
                    helperText={<Typography component="span" color="red">{errors.redirection_link}</Typography>}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <TextField
                    error={Boolean(errors.bid_price)}
                    required
                    fullWidth
                    type='number'
                    id="campaign-bid-price"
                    name='bid_price'
                    defaultValue={formData.bid_price}
                    inputProps={{
                        min: 0
                    }}
                    variant="outlined"
                    onChange={handleChange}
                    label="Ad Amount"
                    size='small'
                    helperText={<Typography component="span" color="red">{errors.bid_price}</Typography>}
                />
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <FormGroup>
                    <FormControlLabel
                        control={<Switch
                            checked={formData.customAds}
                            onChange={(e) => setFormData({ ...formData, customAds: e.target.checked, nfts: [] })}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />}
                        label="Custom Ads"
                    />
                </FormGroup>
            </Grid>
            {
                formData.customAds ? (
                    <Grid item md={10} sx={{ mt: 4 }}>
                        <NftSelect useFormData={useFormData} errors={errors} />
                    </Grid>
                ) : (<></>)
            }
            <Grid item md={12} sx={{ mt: 4, ml: 3 }}>
                <FormGroup>
                    <FormControlLabel
                        control={<>
                            <input
                                ref={fileRef}
                                style={{ display: "none" }}
                                id="upload-photo"
                                name="upload-photo"
                                type="file"
                                onChange={handleFile}
                                accept='image/*, video/*'
                            />
                            <Fab
                                color={Boolean(errors.file) ? "error" : "primary"}
                                size="small"
                                component="span"
                                aria-label="add"
                                variant="extended"
                            >
                                <MdAddCircleOutline /> <Typography component={'span'} color='white' sx={{ ml: 2 }}>Upload Image & Video</Typography>
                            </Fab>
                        </>}
                        label={(<Typography sx={{ ml: 2 }}>Ad will show in the nft details page on load page</Typography>)}
                    />
                    <Typography color="red">{errors.file}</Typography>
                </FormGroup>
            </Grid>
            <Grid item md={12} sx={{ mt: 4 }}>
                <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="campaign-ad-status-label">Status</InputLabel>
                    <Select
                        name='status'
                        fullWidth
                        labelId="campaign-ad-status-label"
                        id="campaign-ad-status"
                        value={formData.status}
                        label="Status"
                        onChange={handleChange}
                        size='small'
                    >
                    <MenuItem value={'publish'}>Publish</MenuItem>
                    <MenuItem value={'draft'}>Draft</MenuItem>
                    <MenuItem value={'pending'}>Pending Review</MenuItem>
                    <MenuItem value={'stop'}>Stop</MenuItem>
                    </Select>
                    <FormHelperText>{errors.status}</FormHelperText>
                </FormControl>
            </Grid>
        </Grid>
    )
}

export default Step3