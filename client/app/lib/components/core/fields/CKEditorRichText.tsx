import { lazy, Suspense, useState } from 'react';
import { FormHelperText, InputLabel, Skeleton } from '@mui/material';
import { cyan } from '@mui/material/colors';

const CKEditorField = lazy(
  () => import(/* webpackChunkName: "CKEditorField" */ './CKEditorField'),
);

const CKEditorRichText = ({
  label,
  value,
  onChange,
  disabled,
  error,
  field,
  required,
  name,
  inputId,
  disableMargins,
  placeholder,
  autofocus,
}: {
  name: string;
  onChange: (text: string) => void;
  value: string;
  inputId?: string;
  autofocus?: boolean;
  disabled?: boolean;
  disableMargins?: boolean;
  error?: string;
  field?: string | undefined;
  label?: string;
  placeholder?: string;
  required?: boolean | undefined;
}): JSX.Element => {
  const [isFocused, setIsFocused] = useState(false);
  const textFieldLabelColor = isFocused ? cyan[500] : undefined;

  return (
    <div
      className="w-full inline-block bg-transparent relative"
      style={{
        fontSize: 16,
        fontFamily: 'Roboto, sans-serif',
        paddingTop: !disableMargins && label ? '1em' : 0,
        paddingBottom: !disableMargins ? '1em' : 0,
      }}
    >
      {label && (
        <InputLabel
          className="pointer-events-none"
          disabled={disabled}
          error={!!error}
          htmlFor={field}
          required={required}
          shrink
          style={{
            color: disabled ? 'rgba(0, 0, 0, 0.3)' : textFieldLabelColor,
          }}
        >
          {label}
        </InputLabel>
      )}

      <textarea
        aria-hidden
        className="hidden"
        disabled={disabled}
        id={inputId}
        name={name}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        value={value || ''}
      />

      <div className="react-ck">
        <Suspense
          fallback={
            <Skeleton
              className="min-h-[94.2px] max-h-[35rem] w-full"
              variant="rounded"
            />
          }
        >
          <CKEditorField
            autoFocus={autofocus}
            disabled={disabled}
            onBlur={() => setIsFocused(false)}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            value={value}
          />
        </Suspense>
      </div>

      {error && <FormHelperText error={!!error}>{error}</FormHelperText>}
    </div>
  );
};

export default CKEditorRichText;
