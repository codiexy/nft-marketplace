import React, { useEffect, useRef, useState } from 'react'

import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Card, Chip, capitalize } from '@mui/material';
import { BiSkipNextCircle } from 'react-icons/bi';
import { AdCardProps } from './type';
import Image from 'next/image';

function AdCard(props: AdCardProps) {
    const { path = "", type = "image", buttonText = "", title = "Test Ad", description = "This is test ad description...", redirection = "", onSkipAd = () => { }, onAdView = () => { } } = props;
    const [hover, setHover] = useState<Boolean>(false);
    const videoEl = useRef<any>(null);

    const handleAdView = async () => {
        if (typeof onAdView == "function") {
            await onAdView();
        }
        window.open(redirection)
    }

    useEffect(() => {
        (async () => {
            if (typeof window != "undefined") {
                if (videoEl && videoEl.current) {
                    const videoElement = videoEl.current;
                    videoElement.muted = true;
                    await videoElement.play();
                }
            }
        })();
    }, []);
    


    return (
        <CardContent className={`maincard_ad ${type == "image" ? "image_class" : "video_image"}`}
            sx={{ position: "relative", p: 0 }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {
                type == "image" || type == "img" || !path
                    ? (
                        <CardMedia className='ad_image'>
                            <Image
                                src={path ? path : "/images/banner05.jpg"}
                                alt={title}
                                height={325}
                                width={600}
                            />
                        </CardMedia>
                    ) : (
                        <CardMedia className='ad_viedo'>

                            <video
                                src={path}
                                controls
                                preload="auto"
                                controlsList="nodownload"
                                autoPlay={true}
                                muted={true}
                                height={325}
                                width={600}
                                ref={videoEl}
                            >
                                <source src={path} />
                            </video>
                        </CardMedia>
                    )
            }

            <div className='ad_card_image'>

                <Card className='ad_card_header'>
                    <CardHeader
                        className="ad_btn_more" 
                        sx={{
                            display: 'flex',
                            position: "absolute",
                            bottom: type == 'image' ? "10px" : hover ? '55px' : "10px",
                            left: '10px',
                            borderRadius: '5px',
                            padding: '10px',
                            background: "#fff",
                            cursor: "pointer"
                        }}
                        avatar={
                            <Avatar sx={{ color: "#fff", bgcolor: (theme) => theme.palette.secondary.main }}>
                                {capitalize(title.charAt(0))}
                            </Avatar>
                        }
                        onClick={handleAdView}
                        title={capitalize(title.substring(0, 15))}
                        subheader={capitalize(description.substring(0, 20))}
                        action={<Chip label={capitalize(buttonText || 'Learn More')} color="secondary" sx={{ cursor: "pointer", ml: 5, mt: 1.5 }} />}
                    />
                </Card>
                <Typography className='skip_card_button'
                    component="div"
                    sx={{
                        position: "absolute",
                        bottom: type == 'image' ? "25px" : hover ? '55px' : "10px",
                        right: '10px'
                    }}
                >
                    <Chip
                        color='secondary'
                        label="Skip Ad"
                        onClick={onSkipAd}
                        onDelete={onSkipAd}
                        deleteIcon={<BiSkipNextCircle />}
                    />
                </Typography>
            </div>
        </CardContent >
    )
}

export default AdCard