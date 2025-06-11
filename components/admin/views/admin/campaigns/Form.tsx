import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { Grid } from '@mui/material';
import { ErrorProps, FormDataProps } from './type';
import Step4 from './Step4';
import { saveCampaignAd, updateCampaignAd } from 'services/campaigns';
import { validateCampaignAdForm } from 'schemas/form/campaigns';

const steps = ['Select Campaign', 'Create An Ad Group', 'Create An Ad', 'View An Ad'];
const defaultError: ErrorProps = {
    name: "",
    group: "",
    title: "",
    description: "",
    button_text: "",
    redirection_link: "",
    bid_price: "",
    nfts: "",
    file: "",
    status: ""
};

export default function AdsForm({ setOpenModal, editData = {}, onSubmit = () => {} }: any) {
    const [activeStep, setActiveStep] = React.useState(0);
    const [formData, setFormData] = React.useState<FormDataProps>({
        name: editData.name || "",
        group: editData?.group?.name || "Ad Group 1",
        title: editData.title || "",
        description: editData.description || "",
        button_text: editData.button_text || "",
        redirection_link: editData.redirect_url || "",
        bid_price: editData.amount || "",
        customAds: typeof editData.nfts != "undefined" && editData.nfts.length,
        nfts: editData.nfts || [],
        file: null,
        status: editData.status || "publish"
    });
    const [errors, setErrors] = React.useState<ErrorProps>(defaultError);
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const stepElements: JSX.Element[] = [
        <Step1 useFormData={() => [formData, setFormData]} errors={errors} key="step1"/>,
        <Step2 useFormData={() => [formData, setFormData]} errors={errors} key="step2"/>,
        <Step3 useFormData={() => [formData, setFormData]} errors={errors} key="step3"/>,
        <Step4 useFormData={() => [formData, setFormData]} adFilePath={editData.file || ""} adFileType={editData.file_type || ""} key="step4"/>
    ];

    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = async () => {
        try {
            if ([0, 1, 2, 3].includes(activeStep) && !formData.name) {
                setErrors({ ...defaultError, name: "Please fill name!" })
                return;
            }
            if ([1, 2, 3].includes(activeStep) && !formData.group) {
                setErrors({ ...defaultError, group: "Please fill group!" })
                return;
            }
            if ([2, 3].includes(activeStep)) {
                if (!formData.title) {
                    setErrors({ ...defaultError, title: "Please fill title!" })
                    return;
                }
                if (!formData.description) {
                    setErrors({ ...defaultError, description: "Please fill description!" })
                    return;
                }
                if (!formData.button_text) {
                    setErrors({ ...defaultError, button_text: "Please fill button text!" })
                    return;
                }
                if (!formData.redirection_link) {
                    setErrors({ ...defaultError, redirection_link: "Please fill redirection url!" })
                    return;
                }
                if (!formData.bid_price) {
                    setErrors({ ...defaultError, bid_price: "Please fill bid price!" })
                    return;
                }
                if (formData.customAds && !formData.nfts.length) {
                    setErrors({ ...defaultError, nfts: "Please select any one nft!" })
                    return;
                }
                if (typeof editData.id == "undefined" && !formData.file) {
                    setErrors({ ...defaultError, file: "Please select any image or video!" })
                    return;
                }
            }
            setErrors(defaultError);

            if (activeStep == 3) {
                const validateRes = await validateCampaignAdForm(formData);
                if (validateRes.status) {
                    let result;
                    let inputData = new FormData();
                    const newFormData: any = formData;
                    for (const key in newFormData) {
                        if (Object.prototype.hasOwnProperty.call(newFormData, key)) {
                            inputData.append(key, newFormData[key]);
                        }
                    }
                    if (typeof editData.id != "undefined" && editData.id) {
                        result = await updateCampaignAd(editData.id, inputData);
                    } else {
                        result = await saveCampaignAd(inputData);
                    }
                    if (result.status != "success") {
                        console.error(result.message);
                        return;
                    }
                } else {
                    console.error(validateRes.errors)
                    return;
                }
            }
            let newSkipped = skipped;
            if (isStepSkipped(activeStep)) {
                newSkipped = new Set(newSkipped.values());
                newSkipped.delete(activeStep);
            }
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
            setSkipped(newSkipped);

        } catch (error) {
            console.log(error)
        }


    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFinish = () => {
        if(typeof onSubmit == "function") {
            onSubmit();
            setOpenModal(false);
        }

    }

    return (
        <Box component='form' sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} sx={{ m: 5 }} className="adform_step">
                {steps.map((label, index) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: {
                        optional?: React.ReactNode;
                    } = {};
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label} {...stepProps} className="adcard_list">
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <React.Fragment>
                    <Typography component="div" sx={{ my: 10 }}>
                        <div className="flex items-center justify-center">
                            <div>
                                <div className="flex flex-col items-center space-y-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-green-600 w-28 h-28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h1 className="text-4xl font-bold">Thank You !</h1>
                                    <p className='text-center'>
                                        Thank you for {typeof editData.id != "undefined" ? "update" : "create"} campaign ad! <br />
                                        Now it will show under listed nft (on sale nft) details page after load.
                                    </p>
                                    <span
                                        className="inline-flex items-center  text-white bg-[#8f69f6] border border-[#8f69f6] rounded rounded-full hover:bg-indigo-700 focus:outline-none focus:ring final_done_btn"
                                        onClick={handleFinish}
                                        style={{
                                            cursor: "pointer"
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24"
                                            stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                        </svg>
                                        <span className="text-sm font-medium" >
                                            Done
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Typography>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Typography component={'div'} sx={{ m: 5 }}>
                        <Grid justifyContent="center" spacing={2}>
                            {stepElements[activeStep]}
                        </Grid>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', py: 2, px: 20 }}>
                        <Button
                            color="secondary"
                            variant="outlined"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                        >
                            Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button variant="outlined" onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
}