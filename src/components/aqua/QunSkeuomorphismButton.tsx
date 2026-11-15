import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
} from 'react'
import './QunSkeuomorphismButton.css'

export type QunSkeuomorphismButtonTone = 'aqua' | 'danger' | 'neutral'

type QunSkeuomorphismButtonProps = PropsWithChildren<{
  readonly onClick?: MouseEventHandler<HTMLButtonElement>
  readonly disabled?: boolean
  readonly type?: 'button' | 'submit' | 'reset'
  readonly tone?: QunSkeuomorphismButtonTone
  readonly inputProps?: HTMLAttributes<HTMLDivElement>
  readonly buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>
}>

export function QunSkeuomorphismButton({
  onClick,
  disabled,
  type = 'button',
  tone = 'aqua',
  inputProps,
  buttonProps,
  children,
}: QunSkeuomorphismButtonProps): ReactElement {
  const { className: input_class_name = '', ...rest_input_props } = inputProps ?? {}
  const { className: button_class_name = '', ...rest_button_props } = buttonProps ?? {}

  return (
    <div
      {...rest_input_props}
      className={`skeuomorphism-button-container${input_class_name === '' ? '' : ` ${input_class_name}`}`}
    >
      <button
        {...rest_button_props}
        className={`skeuomorphism-button skeuomorphism-button--${tone}${button_class_name === '' ? '' : ` ${button_class_name}`}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {children}
      </button>
    </div>
  )
}
