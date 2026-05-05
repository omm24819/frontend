import { useContext, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleContext } from '../../../contexts/TitleContext';

function Site() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle(t('site'));
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('site')}</title>
      </Helmet>
      <Box p={2}>
        <Card>
          <CardContent>
            <Typography variant="h3" gutterBottom>
              {t('site')}
            </Typography>
            <Typography color="text.secondary">
              {t('products_site_placeholder')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default Site;
