import { forwardRef, useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CAPTCHAFieldProps {
  onChange?: (value: string | null) => void;
}

interface CAPTCHAFieldRef {
  reset: () => void;
}

const SITEKEY = process.env.GOOGLE_RECAPTCHA_SITE_KEY;

const CAPTCHAField = forwardRef<CAPTCHAFieldRef, CAPTCHAFieldProps>(
  (props, ref): JSX.Element => {
    const captchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: (): void => {
        captchaRef.current?.reset();
        props.onChange?.(null);
      },
    }));

    if (!SITEKEY) throw new Error('GOOGLE_RECAPTCHA_SITE_KEY is not set');

    return (
      <ReCAPTCHA ref={captchaRef} onChange={props.onChange} sitekey={SITEKEY} />
    );
  },
);

CAPTCHAField.displayName = 'CAPTCHAField';

export default CAPTCHAField;
