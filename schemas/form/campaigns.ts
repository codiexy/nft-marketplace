import { object, string, number, array, boolean, date } from "yup";

export const campaignAdSchema = object().shape({
    status: string().required("Status must be required"),
    nfts: array().when('customAds', {
        is: (val: boolean) => Boolean(val),
        then: array().of(string().required('Please select any one nft')),
        otherwise: array().nullable(),
    }),
    customAds: boolean(),
    bid_price: number().min(10, "Bid price greater than 10").required("Bid price must be required"),
    redirection_link: string().trim().url('Must be correct url').required("Redirection url must be required"),
    button_text: string().required("Button text must be required"),
    description: string().trim().required("Description must be required"),
    title: string().trim().required("Title must be required"),
    group: string().trim().required("Group must be required"),
    name: string().trim().required("Name must be required"),
});

export const validateCampaignAdForm = async (formData: any) => {
    const result = await campaignAdSchema.validate(formData)
        .then((value) => {
            return {
                status: true,
                errors: [],
                data: value
            }
        })
        .catch(function (err) {
            return err
            return {
                status: false,
                errors: err.errors,
                data: {}
            };
        });
    return result;
}