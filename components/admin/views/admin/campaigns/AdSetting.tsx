import { Avatar, Button, Card, CardContent, CardHeader, Grid, TextField } from '@mui/material'
import SnackbarOpen from 'components/miscellaneous/SnackBar';
import { Metamask } from 'context';
import React, { useEffect, useState } from 'react'
import { createThemeSetting, getThemeSetting } from 'services';

export default function AdSetting() {

    const [formData, setFormData] = useState({
        per_click: "",
        per_view: ""
    })
    const { user }: any = Metamask.useContext();
    const [error, setError] = React.useState({ status: false, type: "", message: "" });

    useEffect(() => {
        (async () => {
            const result = await getThemeSetting({
                keys: ["per_click", "per_view"]
            });
            const newFormData: any = formData;
            for (let i = 0; i < result.length; i++) {
                newFormData[result[i].key] = result[i].value;
            }
            setFormData(newFormData);
        })();
    }, []);

    const handleChange = (e: any) => {
        let name = e.target.name;
        let value = e.target.value
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (!formData.per_click) {
                setError({ status: true, type: "warning", message: "Please fill the perclick amount !" });
                return;
            }
            if (!formData.per_view) {
                setError({ status: true, type: "warning", message: "Please fill the perview amount !" });
                return;
            }
            const result = await createThemeSetting({
                data: [
                    {
                        key: "per_click",
                        value: formData.per_click
                    },
                    {
                        key: "per_view",
                        value: formData.per_view
                    }
                ]
            });
            setError({ status: true, type: result.status, message: result.message });

        } catch (error: any) {
            setError({ status: true, type: "error", message: error.message || "Something went wrong!" });
        }

    }

    return (
        <div>
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: (theme) => theme.palette.primary.main, color: "white" }} aria-label="Ads Setting">
                            R
                        </Avatar>
                    }
                    title="Campaign Ad Setting"
                    subheader="Prices of per click & per view of the campaign ad."
                />

                <CardContent component="form" className='ad_setting_form'>
                    <Grid container>
                        <Grid item md={10} sx={{ mt: 4 }}>
                            <TextField
                                required
                                fullWidth
                                type='number'
                                id="campaign-bid-price"
                                name='per_click'
                                defaultValue=""
                                value={formData.per_click}
                                inputProps={{
                                    min: 0,
                                    step: 0.1
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                  }}
                                variant="outlined"
                                onChange={handleChange}
                                label="Bid Price Per Click"
                                size='small'
                            />
                        </Grid>
                        <Grid item md={10} sx={{ mt: 4 }}>
                            <TextField
                                name="per_view"
                                required
                                fullWidth
                                id="campaign-name"
                                defaultValue=""
                                value={formData.per_view}
                                inputProps={{
                                    min: 0,
                                    step: 0.1
                                }}
                                InputLabelProps={{
                                    shrink: true,
                                  }}
                                variant="outlined"
                                onChange={handleChange}
                                label="Bid Price Per View"
                                size='small'
                            />
                        </Grid>
                        <Grid item md={10} sx={{ mt: 4 }}>
                            <Button variant="outlined" onClick={handleSubmit} type='button'>
                                Save
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            {
                error.status ?
                    <SnackbarOpen
                        message={error.message}
                        useOpen={() => [error, setError]}
                        color={error.type}
                    /> :
                    ""
            }
        </div>
    )
}
