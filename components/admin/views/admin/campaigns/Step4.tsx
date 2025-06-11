import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import { FormDataProps } from './type';
import { getBase64FromFile } from 'helpers';
import { Grid, capitalize } from '@mui/material';

import AdCard from './Card';

type Props = {
  useFormData: () => [FormDataProps, React.Dispatch<React.SetStateAction<FormDataProps>>],
  adFilePath?: string
  adFileType?: string
}

export default function Step4({ useFormData, adFilePath = "", adFileType = "" }: Props) {
  const [formData] = useFormData();
  const [filePath, setFilePath] = React.useState<any>("");
  const [fileType, setFileType] = React.useState<any>("image");

  React.useEffect(() => {
    (async () => {
      let path: any = "";
      let type: string = "";
      if (formData.file) {
        path = await getBase64FromFile(formData.file)
          .then(data => data)
          .catch((error) => {
            console.log(error.message)
            return ""
          })
        type = formData.file.type.split('/')[0] == "video" ? 'video' : 'image';
      }
      setFilePath(path)
      setFileType(type)

    })();
  }, [formData.file]);

  return (
    <Grid item md={8} sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ color: "#fff", bgcolor: (theme) => theme.palette.primary.main }} aria-label="recipe">
              {capitalize(formData.title.charAt(0))}
            </Avatar>
          }
          title="Campaign Ad Preview"
          subheader="Preview of the your ad that will show in the nft details page"
        />
        <AdCard
          path={filePath ? filePath : adFilePath}
          type={filePath ? fileType : adFileType}
          title={formData.title}
          description={formData.description}
          buttonText={formData.button_text}
          redirection={formData.redirection_link}
        />
      </Card>
    </Grid>
  );
}