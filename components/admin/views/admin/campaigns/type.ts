
export type FormDataProps = {
    name: string
    group: string
    title: string
    description: string
    button_text: string
    redirection_link: string
    bid_price: string
    customAds: boolean
    nfts: string[],
    file: any,
    status: string
}

export type ErrorProps = {
    name: string
    group: string
    title: string
    description: string
    button_text: string
    redirection_link: string
    bid_price: string
    nfts: string
    file: string
    status: string
}

export type StepProps = {
    useFormData: () => [FormDataProps, React.Dispatch<React.SetStateAction<FormDataProps>>]
    errors: ErrorProps
}

export type AdCardProps = {
    path?: string
    type?: 'img' | 'video' 
    buttonText?: string
    title?: string 
    description?: string
    redirection?: string
    onSkipAd?: () => void
    onAdView?: () => void
}