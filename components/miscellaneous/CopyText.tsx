import { useState, useRef } from 'react'
import { BiCopy } from 'react-icons/bi';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast, ToastContainer } from 'material-react-toastify'

import { trimString } from '../../helpers';

export const TrimAndCopyText = (props: any) => {
    const [copied, setCopied] = useState<Boolean>(false);
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const { text } = props;

    const copyContent = (action: Boolean) => {
        setCopied(action)
        if (action) {
            setTimeout(() => {
                setCopied(false);
                setShow(false)
            }, 2000);
        }
        toast.success("Copied successfully!")

    }

    return (
        <>
            <ToastContainer position='top-right' />
            <CopyToClipboard
                text={text}
                onCopy={() => copyContent(true)}
            >
                <span style={{
                    display: "inline-flex"
                }}>
                    <span>{trimString(text, 4)}</span>
                    <span
                        title='Copy Address'
                        style={{
                            marginLeft: "10px",
                            fontSize: "20px",
                            cursor: "pointer"
                        }}
                        ref={target}
                        onClick={() => setShow(true)}
                    >
                        <BiCopy />
                    </span>
                </span>
            </CopyToClipboard>
        </>
    );
}