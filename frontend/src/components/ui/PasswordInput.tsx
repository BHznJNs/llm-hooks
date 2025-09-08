import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useLanguageStore } from '../../stores/language-store';
import { Input, type InputProps } from './Input';

type PasswordInputProps = {
  id: string;
  value: string;
  placeholder?: string;
  required?: boolean;
} & InputProps;

export function PasswordInput({
  id,
  value,
  placeholder,
  required,
  onChange,
  ...props
}: PasswordInputProps) {
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        suffix={
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="cursor-pointer"
            aria-label={showPassword ? t('hide-password') : t('show-password')}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        }
        {...props}
      />
    </div>
  );
}
