import React, { useEffect, useState } from 'react'

import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import { NftCardProps } from './type';
import Image from 'next/image';
import { Chip, Typography } from '@mui/material';
import { AiFillEye, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { saveNftLike, saveNftViews, unLikeNft } from 'services';

function NFTDetailCard(props: NftCardProps) {
    const { path = "", type = "image", title = "", isLiked = false, likeCount = 0, viewCount = 0, nftId } = props;
    const [favourite, setFavourite] = useState<Boolean>(isLiked);
    const [nftLikes, setNftLikes] = useState<number>(likeCount);
    const [nftViews, setNftViews] = useState<number>(viewCount);


    // Nft views

    useEffect(() => {
        (async () => {
            const result = await saveNftViews(nftId)
            if (result.status === "success") {
                setNftViews((view) => view + 1);
            }
        })();
    }, [nftId]);

    const handleLike = async (e: any) => {
        e.preventDefault();
        if (!favourite) {
            const result = await saveNftLike(nftId);
            if (result.status === "success") {
                setFavourite(true);
                setNftLikes(nftLikes + 1);
            }
        } else {
            const result = await unLikeNft(nftId);
            if (result.status === "success") {
                setFavourite(false)
                setNftLikes(nftLikes - 1)
            }
        }

    }
    return (
        <CardContent sx={{ position: "relative" }}>
            {
                type == "image"
                    ? (
                        <CardMedia  className="nft_card_img">
                            <Image
                                src={path}
                                alt={title}
                                height={325}
                                width={600}
                            />
                        </CardMedia>
                    ) : (
                        <>
                            {
                                type == "audio" ? (
                                    <CardMedia
                                        component="video"
                                        poster="/music-placeholder.png"
                                        image={path}
                                        sx={{
                                            height: 300
                                        }}
                                        controls
                                        preload="auto"
                                        controlsList="nodownload"
                                    >
                                        <source src={path} />
                                    </CardMedia>
                                ) : (
                                    <CardMedia
                                        component="video"
                                        image={path}
                                        sx={{
                                            height: 300
                                        }}
                                        controls
                                        preload="auto"
                                        controlsList="nodownload"
                                    >
                                        <source src={path} />
                                    </CardMedia>
                                )
                            }
                        </>
                    )
            }
            <Typography
            className='view_like_btn'
                component="div"
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0
                }}
            >
                <Chip
                    label="Likes"
                    deleteIcon={favourite ? <AiFillHeart color="#571a81" /> : <AiOutlineHeart />}
                    onDelete={handleLike}
                    icon={<Typography sx={{ pl: 1 }} component="span">{nftLikes}</Typography>}
                />
                <Chip
                    sx={{ ml: 2 }}
                    label="Views"
                    deleteIcon={<AiFillEye color='#571a81' />}
                    onDelete={() => { }}
                    icon={<Typography sx={{ pl: 1 }} component="span">{nftViews}</Typography>}
                />
            </Typography>
        </CardContent>
    )
}

export default NFTDetailCard
