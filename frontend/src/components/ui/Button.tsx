import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cx } from '@/utils/classNames';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function buttonClassName(
  { variant = 'primary', size = 'md', fullWidth = false }: ButtonStyleProps,
  className?: string,
) {
  return cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);
}

type ButtonProps = ButtonStyleProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth }, className)}
      {...rest}
    />
  );
}

type ButtonLinkProps = ButtonStyleProps & LinkProps;

/** A router link that looks like a button. */
export function ButtonLink({ variant, size, fullWidth, className, ...rest }: ButtonLinkProps) {
  return <Link className={buttonClassName({ variant, size, fullWidth }, className)} {...rest} />;
}
