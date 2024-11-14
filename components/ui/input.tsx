/* eslint-disable max-len */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // eslint-disable-next-line react/require-default-props
  showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className, type, showPasswordToggle, ...props
  }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

    return (
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          ref={ref}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? (
              <span role="img" aria-label="Hide password"><EyeOff size={16} /></span>
            ) : (
              <span role="img" aria-label="Show password"><Eye size={16} /></span>
            )}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
