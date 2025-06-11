import React, { useState, useEffect } from 'react'
import moment from 'moment';
import { Avatar, Typography, List, ListItem, ListItemText, ListItemAvatar, IconButton, capitalize, Grid, Tooltip, Button, Menu } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CommentInput from './CommentInput';
import ReplyComment from './CommentReply';
import { Metamask } from 'context';
import { deleteComment, getComments } from 'services';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Comment({ nft }: any) {
    const [editComment, setEditComment] = useState("");
    const [comments, setComments] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isLoading, setIsloading] = useState(false);
    const [commentData, setCommentData] = useState({});
    const { user } = Metamask.useContext();
    const open = Boolean(anchorEl);


    useEffect(() => {
        (async () => {
            setIsloading(true);
            const result = await getComments({ nftId: nft.id });
            setComments(result);
            setIsloading(false);

        })();
    }, [nft.id, updated]);

    const handleClose = () => {
        setAnchorEl(null);
        setEditComment("");
    };

    // // delete comment function
    const handleDeleteComment = async (commentId: any) => {
        try {
            const result = await deleteComment(commentId);
            if (result) {
                resetComment()
            }
        } catch (error: any) {
            console.log(error)
        }
    };

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };



    const handleEditComment = async (comment: any) => {
        try {
            if (comment.type === "text") {
                setEditComment(comment.comment || "");
            }
            setCommentData(comment);
        } catch (error) {
            console.log(error)
        }
    }

    const resetComment = () => {
        setUpdated(!updated);
        handleClose();
    }

    return (
        <div>
            <CommentInput comment={editComment} count={comments?.length} nft={nft} useUpdated={() => [updated, setUpdated]} commentData={commentData} />
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {comments?.length ?
                    comments.map((comment: any, key: any) => {
                        const fromNow = moment(comment.createdAt).fromNow();
                        const userData = comment.creator || {};
                        return (
                            <React.Fragment key={key}>
                                <ListItem alignItems="flex-start" className="commect_imagebox">

                                    <ListItemAvatar>
                                        <Avatar alt={capitalize(userData.name || "No Name")} src={userData.image ? userData.image : "/user-avatar.png"} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        className='icon_and_reply'
                                        primary={
                                            <>
                                                <Typography sx={{ fontWeight: "bold", width: "100%" }} className="user_icon">
                                                    {userData.name || "No Name"}
                                                    <Typography variant='caption' sx={{ ml: 1, float: "right" }} className="time_show">{fromNow}</Typography>
                                                </Typography>
                                                {
                                                    user && comment?.createdBy === user?.id && (
                                                        <div className="comment_action_dots">

                                                            <IconButton onClick={() => handleEditComment(comment)}>
                                                                <Tooltip title="Edit">
                                                                    <EditOutlinedIcon sx={{ mr: 2 }} />
                                                                </Tooltip>
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDeleteComment(comment.id)}>
                                                                <Tooltip title="Delete">
                                                                    <HighlightOffIcon sx={{ mr: 2 }} />
                                                                </Tooltip>
                                                            </IconButton>

                                                        </div>
                                                    )
                                                }
                                            </>
                                        }
                                        secondary={<CommentContent commentData={comment} />}
                                        sx={{ marginTop: "0px", position: "relative", width: "90%" }}
                                    />
                                    <div className='reply_comment'>
                                        <Grid container justifyContent="left">
                                            <Grid item md={12}>
                                                <ReplyComment comment={editComment} count={comments?.length} nft={nft} useUpdated={() => [updated, setUpdated]} commentData={comment} />

                                            </Grid>
                                        </Grid>

                                    </div>

                                </ListItem>
                            </React.Fragment>
                        )
                    }) : (
                        <ListItem alignItems="flex-start" sx={{
                            background: "#ccc"
                        }}>
                            <ListItemText
                                sx={{
                                    textAlign: "center"
                                }}
                            >
                                <Typography fontWeight='700'>Be the first to comment</Typography>
                            </ListItemText>
                        </ListItem>
                    )}
            </List>


        </div>
    )
}


const CommentContent = ({ commentData }: any) => {
    const { user } = Metamask.useContext();
    const { type, comment, image } = commentData;
    const arrayCommentData: any = comment && typeof comment === "string" ? comment.split(`\n`) : "";

    return (
        <>
            {
                type === "file" ? (
                    <span>
                        <img
                            src={image || "/dish-612x612.jpg"}
                            srcSet={image || "/dish-612x612.jpg"}
                            alt={"Comment Image"}
                            width={200}
                            height={150}
                            loading="lazy"
                            style={{ marginTop: '15px', borderRadius: "5px" }}
                        />
                    </span>
                ) : (
                    <>
                        <Typography fontSize='18px'>
                            {
                                arrayCommentData.length ? (
                                    <>
                                        {
                                            arrayCommentData.map((string: any, key: any) => (
                                                <React.Fragment key={key}>

                                                    {string}
                                                    {
                                                        arrayCommentData.length > (key + 1) ? (
                                                            <br />
                                                        ) : ""
                                                    }
                                                </React.Fragment>
                                            ))
                                        }
                                    </>
                                ) : ""
                            }
                        </Typography>
                    </>
                )
            }
        </>
    )
}