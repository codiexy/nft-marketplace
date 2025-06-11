import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import EmojiPicker from 'emoji-picker-react';
import InputBase from '@mui/material/InputBase';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import MenuList from '@mui/material/MenuList';
import { Tooltip, Avatar, CircularProgress, IconButton, Popper, Button, capitalize, TextField, Typography } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import { Metamask } from 'context';
import { saveComment, saveReplyComment, updateComment, updateReplyComment } from 'services';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const defaultError = {
    name: "",
    authenticated: ""

};

export default function CommentInput({ comment, type = "comment", nft, useUpdated, commentData, CommentReplyData }: any) {

    const [updated, setUpdated] = useUpdated();
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, login } = Metamask.useContext();
    const [commentType, setCommentType] = useState("");
    const [image, setImage] = useState("")
    const [errors, setErrors] = React.useState<any>(defaultError);


    useEffect(() => {
        setValue(comment || "")
    }, [comment])


    const handleEmojiClick = (event: any) => {
        setShow(true);
        setAnchorEl(event.currentTarget);
    };

    const handleEmoji = (emoji: any) => {
        if (emoji) {
            setValue((prev) => `${prev}${emoji.emoji}`);
        }
    }

    const handleChange = async (e: any) => {
        if (!user) {
            await login();
            return;
        }
        setErrors("")
        setValue(e.target.value);
        setCommentType(e.target.type);
    }

    const handleFileChange = async (event: any) => {
        event.preventDefault();
        setIsLoading(true)
        if (!user) {
            await login();
            return;
        }
        const files = event.target.files[0];
        setImage(URL.createObjectURL(files));
        setCommentType(event.target.type)
        setIsLoading(false)
    }


    const handleCommentSubmit = async (event: any) => {
        event.preventDefault();
        try {
            if (!user) {
                await login();
                return;
            }
            if (!value) {
                setErrors({ ...defaultError, name: "Please write a Comment!" })
                return;
            }
            setIsLoading(true);
            if (type === "reply") {
                const result: any = await saveReplyComment(commentData.id, {
                    commentId: commentData.id,
                    nftId: nft.id,
                    type: commentType,
                    comment: value,
                    image: image || "",

                })
                setValue("");
                setUpdated(!updated)
            } else {
                const result: any = await saveComment({
                    nftId: nft.id,
                    type: commentType,
                    comment: value,
                    image: image || "",

                })
                if (result.status === "success") {
                    setValue("");
                    setUpdated(!updated)
                } else {
                    setErrors({ ...defaultError, authenticated: result.message || "Something went wrong" })
                    return;
                }
            }
            setIsLoading(false)

        } catch (error: any) {

            console.log(error)
        }

    }

    const handleCancel = (event: any) => {
        event.preventDefault();
        setValue('');
    }

    function handleListKeyDown(event: any) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setShow(false);
        } else if (event.key === 'Escape') {
            setShow(false);
        }
    }


    const handleUpdateComment = async (comment: any) => {
        try {
            const id: any = comment.id;
            if (id) {
                if (type === "reply") {
                    await updateReplyComment(comment.commentId, id, { comment: value });
                    setUpdated(!updated)
                    setValue("")
                } else {
                    await updateComment(id, { comment: value });
                    setUpdated(!updated)
                    setValue("")

                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const size = type === "reply" ? "40px" : "50px";

    return (
        <>
            <Typography component="span" color="red">{errors.authenticated}</Typography>
            <Paper
                component="form"
                onSubmit={handleCommentSubmit}
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "100%", mb: 3, position: "relative" }}
                className={`${type}-comment-form`}
            >

                <div className='comment-wrap-box'>
                    <div className='commet-profile'>
                        <Avatar sx={{ width: size, height: size }} alt={user.image ? user.image : user.name} />
                    </div>
                    <TextField
                        error={errors.name}
                        type='file'
                        sx={{ ml: 1, flex: 1 }}
                        placeholder={type === "comment" ? 'Add a comment...' : "Reply message..."}
                        inputProps={{ 'aria-label': 'dish-comment-input' }}
                        value={value}
                        required
                        multiline
                        onChange={handleChange}
                        helperText={<Typography component="span" color="red">{errors.name}</Typography>}
                    />
                </div>
                <div className='comment-cancle'>
                    {
                        value && (
                            <IconButton onClick={handleCancel}><HighlightOffIcon sx={{ mr: 2 }} /></IconButton>
                        )
                    }
                    <div className='left-comment'>
                        <Tooltip title={`Imoji icons`} arrow>
                            <IconButton sx={{ p: '10px' }} onClick={handleEmojiClick}>
                                <AddReactionIcon fontSize={type === "reply" ? 'small' : "medium"} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={`Share Image`} arrow>
                            <IconButton
                                sx={{ p: '5px' }}
                                aria-label="Send image"
                                component="label"
                            >
                                {
                                    isLoading ? (
                                        <CircularProgress size={20} color="secondary" />
                                    ) : (
                                        <>
                                            <CameraAltIcon fontSize={type === "reply" ? 'small' : "medium"} />
                                            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                                        </>
                                    )
                                }
                            </IconButton>
                        </Tooltip>
                    </div>

                    <div className='right-comment'>
                        {
                            isLoading ? (
                                <a className='comment-btn'>Loading...</a>

                            ) : (
                                <>
                                    {
                                        comment && value ? (
                                            <>
                                                <Button variant="contained" onClick={() => handleUpdateComment(type === "reply" ? CommentReplyData : commentData)} style={{background:"#571a81"}}>update</Button>
                                            </>
                                        ) : (

                                            <Button onClick={handleCommentSubmit} variant="contained" style={{background:"#571a81"}}>publish</Button>
                                        )
                                    }
                                    {/* <Button onClick={handleCancel} variant="contained" color="secondary">cancle</Button> */}
                                </>
                            )
                        }
                    </div>
                </div>

                <Popper
                    open={show}
                    anchorEl={anchorEl}
                    role={undefined}
                    placement="auto"
                    transition
                    disablePortal
                    sx={{ zIndex: 9 }} nonce={undefined} onResize={undefined} onResizeCapture={undefined}
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={() => setShow(false)}>
                                    <MenuList
                                        autoFocusItem={show}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        onKeyDown={handleListKeyDown}
                                        sx={{ p: 0 }}
                                    >
                                        <EmojiPicker onEmojiClick={handleEmoji} />
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Paper>
        </>
    );
}
