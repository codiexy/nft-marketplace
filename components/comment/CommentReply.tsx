import React, { useState, useEffect, createRef } from 'react'
import moment from 'moment';
import {
    Avatar, Typography, List, ListItem, capitalize, Tooltip, ListItemText,
    ListItemAvatar, Menu, MenuItem, IconButton, Button
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CommentInput from './CommentInput';
import { Metamask } from 'context';
import { deleteReplyComment, getReplyComment } from 'services';

function ReplyComment({ type = "comment", nft, useUpdated, commentData }: any) {
    const [replyAction, setReplyAction] = useState(false);
    const [editComment, setEditComment] = useState("");
    const [currentComment, setCurrentComment] = useState(false);
    const [replyComments, setReplyComments] = useState([]);
    const [CommentReplyData, setCommentReplyData] = useState({})
    const [updated, setUpdated] = useUpdated();
    const [anchorEl, setAnchorEl] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const { user }: any = Metamask.useContext();
    const [isLoading, setIsloading] = useState(false);

    const open = Boolean(anchorEl);

    useEffect(() => {
        (async () => {
            setIsloading(true);
            const result = await getReplyComment(commentData.id);
            setReplyComments(result);
            setIsloading(false);

        })();
    }, [nft.id, updated]);


    const handleAccordionChange = (event: any) => {
        event.preventDefault();
        setExpanded(!expanded);
    };

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
        // setCurrentComment(commentData);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setCurrentComment(false);
        setReplyAction(false);
        setEditComment("");
    };


    // // delete comment function
    const handleDeleteComment = async (commentData: any) => {
        try {
            const replyId = commentData.id || "";
            const id = commentData.commentId || "";
            const result = await deleteReplyComment(id, replyId);
            if (result) {
                resetComment()
            }
        } catch (error: any) {
            console.log(error)
        }
    };

    const handleEditComment = (commentData: any) => {
        try {
            if (commentData.type === "text") {
                setEditComment(commentData.comment || "");
            }
            setReplyAction(true)
            setCommentReplyData(commentData)
        } catch (error) {
            console.log(error)
        }
    }



    const resetComment = () => {
        setUpdated(!updated);
        handleClose();
    }



    return (
        <>
            <Typography variant="body1" sx={{ width: "100%", pl: 6 }} className="reply_icon">
                <Tooltip title={`Reply`} arrow>
                    <IconButton onClick={() => setReplyAction(true)} className="reply_box">
                        <Typography className='reply_title'>
                            reply <ReplyIcon fontSize='small' />
                        </Typography>
                    </IconButton>
                </Tooltip>
            </Typography>
            <Typography component="div" sx={{
                margin: "0 0 0 auto",
                width: "91%"
            }}>
                {
                    replyAction ? (
                        <Typography component="div">
                            <CommentInput comment={editComment} nft={nft} useUpdated={() => [updated, setUpdated]} commentData={commentData} type="reply" CommentReplyData={CommentReplyData} />
                        </Typography>
                    ) : ""
                }
                {
                    replyComments.length ? (
                        <Typography
                            component='div'
                        >
                            <Typography
                                className='comment_length'
                                component='span'
                                sx={{ color: "#9c27b0", fontSize: "14px", cursor: "pointer", display: "inline-flex" }}
                                onClick={handleAccordionChange}
                            >
                                <Typography>{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} </Typography> {replyComments.length} REPLIES
                            </Typography>
                            {
                                expanded ? (
                                    <>
                                        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                            {replyComments?.length ?
                                                replyComments.map((replyComment: any, key: any) => {
                                                    const fromNow = moment(replyComment.createdAt).fromNow();
                                                    const commentUser = replyComment.creator || {};
                                                    return (
                                                        <React.Fragment key={key}>
                                                            <ListItem alignItems="flex-start" className='reply_cmt_section'>
                                                                <ListItemAvatar sx={{ minWidth: "42px", marginTop: "3px" }}>
                                                                    <Avatar sx={{ width: "30px", height: "30px" }} alt={capitalize(commentUser.name || "No Name")} src={commentUser?.photoURL ? commentUser.photoURL : "/user-avatar.png"} />
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    className='icon_and_reply'
                                                                    primary={
                                                                        <>
                                                                            <Typography sx={{ fontWeight: "bold", width: "100%" }} className="user_icon">
                                                                                {commentUser.name || "No Name"}
                                                                                <Typography variant='caption' sx={{ ml: 1, float: "right" }} className="time_show">{fromNow}</Typography>
                                                                            </Typography>
                                                                            {
                                                                                commentUser._id === user.id && (
                                                                                    <div className="comment_action_dots">

                                                                                        <IconButton onClick={() => handleEditComment(replyComment)}><Tooltip title="Edit"><EditOutlinedIcon sx={{ mr: 2 }} /></Tooltip></IconButton>
                                                                                        <IconButton onClick={() => handleDeleteComment(replyComment)}><Tooltip title="Delete"><HighlightOffIcon sx={{ mr: 2 }} /></Tooltip></IconButton>

                                                                                    </div>

                                                                                )
                                                                            }
                                                                        </>
                                                                    }
                                                                    secondary={<CommentContent replyComment={replyComment} inputType={type} />}
                                                                    sx={{ marginTop: "0px", position: "relative", width: "91%" }}
                                                                />
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
                                                            <Typography fontWeight='700'>No Comment Found</Typography>
                                                        </ListItemText>
                                                    </ListItem>
                                                )}
                                        </List>
                                    </>
                                ) : ""
                            }
                        </Typography>
                    ) : ""
                }
            </Typography>

        </>
    )
}

const CommentContent = ({ replyComment }: any) => {
    const { type, comment, url } = replyComment;
    const arrayCommentData: any = comment && typeof comment === "string" ? comment.split(`\n`) : "";


    return (
        <>
            {
                type === "file" ? (
                    <span>
                        <img
                            src={url || "/dish-612x612.jpg"}
                            srcSet={url || "/dish-612x612.jpg"}
                            alt={"Comment Image"}
                            width={175}
                            height={125}
                            loading="lazy"
                            style={{ marginTop: '15px', borderRadius: "5px" }}
                        />
                    </span>
                ) : (
                    <>
                        <Typography >
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

export default ReplyComment