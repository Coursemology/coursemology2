import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { FormHelperText } from '@mui/material';

interface CAPTCHAFieldProps {
  error: boolean;
  helperText: string;
  onChange?: (value: string | null) => void;
}

interface CAPTCHAFieldRef {
  reset: () => void;
}

const SITEKEY = process.env.GOOGLE_RECAPTCHA_SITE_KEY;

const CAPTCHAField = forwardRef<CAPTCHAFieldRef, CAPTCHAFieldProps>(
  (props, ref): JSX.Element => {
    const { error, helperText, onChange } = props;
    const captchaRef = useRef<ReCAPTCHA>(null);
    useImperativeHandle(ref, () => ({
      reset: (): void => {
        captchaRef.current?.reset();
        onChange?.(null);
      },
    }));

    if (!SITEKEY) throw new Error('GOOGLE_RECAPTCHA_SITE_KEY is not set');

    return (
      <>
        {helperText && (
          <FormHelperText error={error}>{helperText}</FormHelperText>
        )}
        <ReCAPTCHA ref={captchaRef} onChange={onChange} sitekey={SITEKEY} />
      </>
    );
  },
);

CAPTCHAField.displayName = 'CAPTCHAField';

export default CAPTCHAField;
