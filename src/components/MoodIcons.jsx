'use client'

export const GreatIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="472" height="472" rx="70" fill="#F25A00"/>
    <path d="M110 170 A40 40 0 0 1 190 170" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round"/>
    <path d="M322 170 A40 40 0 0 1 402 170" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round"/>
    <path d="M120 250 H392 A136 136 0 0 1 120 250" fill="none" stroke="white" strokeWidth="20" strokeLinejoin="round" strokeLinecap="round"/>
  </svg>
)

export const GoodIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="472" height="472" rx="80" fill="#F9A24A"/>
    <path d="M95 165 Q140 125 185 145" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round"/>
    <path d="M327 145 Q372 125 417 165" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round"/>
    <circle cx="160" cy="220" r="30" fill="white"/>
    <circle cx="352" cy="220" r="30" fill="white"/>
    <path d="M125 305 Q256 430 387 305" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round"/>
  </svg>
)

export const NeutralIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="472" height="472" rx="90" fill="#A8ADB8"/>
    <circle cx="160" cy="210" r="30" fill="white"/>
    <circle cx="352" cy="210" r="30" fill="white"/>
    <line x1="125" y1="320" x2="387" y2="320" stroke="white" strokeWidth="24" strokeLinecap="round"/>
  </svg>
)

export const BadIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="472" height="472" rx="90" fill="#6F7785"/>
    <path d="M88 178 Q145 188 195 128" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round"/>
    <path d="M317 128 Q367 188 424 178" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round"/>
    <path d="M120 212 Q150 238 185 208 Q180 260 145 258 Q118 250 120 212" fill="white"/>
    <path d="M327 208 Q362 238 392 212 Q394 250 367 258 Q332 260 327 208" fill="white"/>
    <path d="M108 258 C118 278 118 302 108 318 C96 335 76 332 74 308 C72 288 86 274 108 258" fill="white"/>
    <path d="M404 258 C426 274 440 288 438 308 C436 332 416 335 404 318 C394 302 394 278 404 258" fill="white"/>
    <path d="M130 388 Q256 215 382 388" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round"/>
  </svg>
)

export const AwfulIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="472" height="472" rx="90" fill="#E52521"/>
    <line x1="190" y1="95" x2="322" y2="95" stroke="white" strokeWidth="18" strokeLinecap="round"/>
    <line x1="160" y1="125" x2="352" y2="125" stroke="white" strokeWidth="18" strokeLinecap="round"/>
    <line x1="190" y1="155" x2="322" y2="155" stroke="white" strokeWidth="18" strokeLinecap="round"/>
    <path d="M95 180 L205 240" fill="none" stroke="white" strokeWidth="26" strokeLinecap="round"/>
    <path d="M417 180 L307 240" fill="none" stroke="white" strokeWidth="26" strokeLinecap="round"/>
    <circle cx="155" cy="245" r="28" fill="white"/>
    <circle cx="357" cy="245" r="28" fill="white"/>
    <path d="M130 390 Q256 220 382 390" fill="none" stroke="white" strokeWidth="28" strokeLinecap="round"/>
  </svg>
)
