import React from 'react'
import { FaEthereum } from "react-icons/fa";

export default function EthIcon({ style, children, ...props }: any) {
  return (
    <>
      <FaEthereum style={{ display: "inline-block", marginTop: "-5px", ...style }} {...props} />{children}
    </>
  )
}