import Image from 'next/image';


interface DVProps {
    url: string;
    alt: string;
    type: string;
    feature: string,
    size?: {
        height: number | string;
        width: number | string;
    }
}

const DVAsset = ({
    url = "",
    alt = "NFT Asset ",
    type = "",
    feature = "",
    size = {
        height: 300,
        width: 300
    }
}: DVProps) => {

    return (
        <>
            {
                type === "image" ? (
                    <Image
                        className="object-cover w-full rounded-lg	hover:rounded-3xl"
                        src={url}
                        alt={alt}
                        {...size}
                    />
                ) : type === "audio" ? (                    
                     feature == '' ? (
                    <video
                        poster="/music-placeholder.png"
                        style={{ width: '350px', height: '180px' }}
                        controls
                        preload="auto"
                        controlsList="nodownload"
                        className="form-label inline-block mb-2 text-gray-700 audioBgClass"
                      >
                        <source src={url} />
                      </video>
                     ) : (
                        <video
                        poster={feature}
                        style={{ width: '350px', height: '180px' }}
                        controls
                        preload="auto"
                        controlsList="nodownload"
                        className="form-label inline-block mb-2 text-gray-700 audioBgClass"
                      >
                        <source src={url} />
                      </video>
                     )
                    )
                    :  (
                    <video
                        loop
                        style={{height:"290px",width:"300px"}}
                        controls
                        controlsList='nodownload'
                        preload="auto"
                    >
                        <source src={url}
                        />
                    </video>
                )
            }
        </>
    )
}

export default DVAsset
