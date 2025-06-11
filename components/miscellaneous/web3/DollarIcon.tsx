import React from 'react'
import { FaDollarSign } from "react-icons/fa";

export default function DollarIcon({ style, children, ...props }: any) {
  return (
    <>
      <FaDollarSign style={{ display: "inline-block", marginTop: "-3px", ...style }} {...props} />{children}
    </>
  )
}

